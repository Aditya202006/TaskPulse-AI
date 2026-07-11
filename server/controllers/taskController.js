import Task from '../models/Task.js';
import { isDbConnected } from '../config/db.js';

// In-memory data store for demo mock sessions or database-offline mode
export let mockTasks = [
  {
    _id: 'mock-task-1',
    user: '507f1f77bcf86cd799439011',
    title: 'Assignment 3: OS CPU Scheduler',
    deadline: new Date('2026-07-15T17:00:00.000Z'),
    originalDeadline: '15 July',
    time: '5:00 PM',
    priority: 'High',
    category: 'Assignments',
    summary: 'Write a CPU scheduling simulator implementing FCFS, SJF, and Round Robin algorithms in C/C++.',
    reason: 'Due in 5 days; high importance assignment.',
    completed: false,
    sourceFile: 'OS_Assignment3.pdf',
    createdAt: new Date()
  },
  {
    _id: 'mock-task-2',
    user: '507f1f77bcf86cd799439011',
    title: 'Resume & Portfolio Submission',
    deadline: new Date('2026-07-12T23:59:00.000Z'),
    originalDeadline: 'July 12',
    time: '11:59 PM',
    priority: 'High',
    category: 'Placements',
    summary: 'Upload latest resume and portfolio link to the placement cell dashboard.',
    reason: 'Placement portal closes in 2 days.',
    completed: false,
    sourceFile: 'Microsoft_Placement_Notice.png',
    createdAt: new Date()
  },
  {
    _id: 'mock-task-3',
    user: '507f1f77bcf86cd799439011',
    title: 'Electricity & Internet Bill',
    deadline: new Date('2026-07-20T00:00:00.000Z'),
    originalDeadline: 'July 20',
    time: '',
    priority: 'Medium',
    category: 'Bills',
    summary: 'Pay monthly electricity bill and high-speed fiber internet subscription.',
    reason: 'Avoid late fees and service disruption.',
    completed: false,
    sourceFile: 'Bill_Notification_SMS.txt',
    createdAt: new Date()
  }
];

const useMockStore = (req) => {
  return !isDbConnected;
};

/**
 * Get all tasks for the logged-in user
 * @route GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    if (useMockStore(req)) {
      console.log('[Tasks Controller] Serving tasks from In-Memory Mock Store...');
      // Return mock tasks sorted by deadline
      const userMockTasks = mockTasks.filter(t => t.user === req.user.id);
      userMockTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      return res.status(200).json(userMockTasks);
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ deadline: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Manually create a task
 * @route POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      deadline,
      originalDeadline,
      time,
      priority,
      category,
      summary,
      reason,
      sourceFile
    } = req.body;

    if (!title || !deadline) {
      res.status(400);
      throw new Error('Title and deadline date are required');
    }

    if (useMockStore(req)) {
      console.log('[Tasks Controller] Creating task in In-Memory Mock Store...');
      const newTask = {
        _id: 'mock-task-' + Math.random().toString(36).substr(2, 9),
        user: req.user.id,
        title,
        deadline: new Date(deadline),
        originalDeadline: originalDeadline || deadline,
        time: time || '',
        priority: priority || 'Medium',
        category: category || 'Others',
        summary: summary || '',
        reason: reason || '',
        sourceFile: sourceFile || 'Manual Entry',
        completed: false,
        createdAt: new Date()
      };
      mockTasks.push(newTask);
      return res.status(201).json(newTask);
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      deadline: new Date(deadline),
      originalDeadline: originalDeadline || deadline,
      time: time || '',
      priority: priority || 'Medium',
      category: category || 'Others',
      summary: summary || '',
      reason: reason || '',
      sourceFile: sourceFile || 'Manual Entry'
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * Update task properties (e.g., mark completed)
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (useMockStore(req)) {
      console.log('[Tasks Controller] Updating task in In-Memory Mock Store...');
      const taskIndex = mockTasks.findIndex(t => t._id === id && t.user === req.user.id);
      if (taskIndex === -1) {
        res.status(404);
        throw new Error('Task not found or not authorized');
      }
      
      const updates = { ...req.body };
      if (updates.deadline) {
        updates.deadline = new Date(updates.deadline);
      }

      mockTasks[taskIndex] = {
        ...mockTasks[taskIndex],
        ...updates
      };

      return res.status(200).json(mockTasks[taskIndex]);
    }

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or not authorized');
    }

    // Apply updates
    const updates = { ...req.body };
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (useMockStore(req)) {
      console.log('[Tasks Controller] Deleting task in In-Memory Mock Store...');
      const taskIndex = mockTasks.findIndex(t => t._id === id && t.user === req.user.id);
      if (taskIndex === -1) {
        res.status(404);
        throw new Error('Task not found or not authorized');
      }
      mockTasks.splice(taskIndex, 1);
      return res.status(200).json({ message: 'Task successfully deleted', id });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or not authorized');
    }

    res.status(200).json({ message: 'Task successfully deleted', id });
  } catch (error) {
    next(error);
  }
};
