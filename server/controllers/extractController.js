import { extractText } from '../services/ocr.js';
import { extractTasksFromText } from '../services/gemini.js';
import Task from '../models/Task.js';
import { isDbConnected } from '../config/db.js';
import { mockTasks } from './taskController.js';

/**
 * Upload file, extract text via OCR, parse structured tasks with Gemini, and persist to MongoDB
 * @route POST /api/extract
 */
export const extractTasks = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded. Please upload a file (PDF, PNG, JPEG, or TXT).');
    }

    const { buffer, mimetype, originalname } = req.file;

    console.log(`[Extract Controller] File upload received: ${originalname} (${mimetype}, ${buffer.length} bytes)`);

    // 1. Perform OCR or text retrieval
    const rawText = await extractText(buffer, mimetype, originalname);

    if (!rawText || rawText.trim().length === 0) {
      res.status(422);
      throw new Error('No readable text could be extracted from this document. Please verify the document has readable text or try an image with better clarity.');
    }

    // 2. Perform AI parsing of extracted text
    const extractedTasks = await extractTasksFromText(rawText);

    if (!extractedTasks || extractedTasks.length === 0) {
      return res.status(200).json({
        message: 'No deadlines or tasks were identified in this document.',
        tasks: []
      });
    }

    // 3. Write each extracted task to MongoDB or Mock memory store
    const savedTasks = [];
    const useMock = !isDbConnected;

    for (const item of extractedTasks) {
      // Validate dates
      let parsedDate = new Date(item.deadline);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(); // Fallback if invalid
      }

      if (useMock) {
        console.log('[Extract Controller] Saving extracted task to In-Memory Mock Store...');
        const newTask = {
          _id: 'mock-task-' + Math.random().toString(36).substr(2, 9),
          user: req.user.id,
          title: item.task,
          deadline: parsedDate,
          originalDeadline: item.originalDeadline,
          time: item.time || '',
          priority: item.priority || 'Medium',
          category: item.category || 'Others',
          summary: item.shortSummary || '',
          reason: item.reason || '',
          sourceFile: originalname,
          completed: false,
          createdAt: new Date()
        };
        mockTasks.push(newTask);
        savedTasks.push(newTask);
      } else {
        const task = await Task.create({
          user: req.user.id,
          title: item.task,
          deadline: parsedDate,
          originalDeadline: item.originalDeadline,
          time: item.time,
          priority: item.priority || 'Medium',
          category: item.category || 'Others',
          summary: item.shortSummary,
          reason: item.reason,
          sourceFile: originalname,
          completed: false
        });
        savedTasks.push(task);
      }
    }

    console.log(`[Extract Controller] Saved ${savedTasks.length} tasks in database.`);
    
    res.status(201).json({
      message: `Successfully processed document and created ${savedTasks.length} tasks!`,
      tasks: savedTasks
    });
  } catch (error) {
    console.error('[Extract Controller] Process failed:', error.message);
    next(error);
  }
};
