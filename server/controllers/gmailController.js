import { fetchInboxEmails } from '../services/gmail.js';
import { extractTasksFromText } from '../services/gemini.js';
import Task from '../models/Task.js';
import { isDbConnected } from '../config/db.js';
import { mockTasks } from './taskController.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Sync inbox emails and extract new tasks
 * @route POST /api/gmail/sync
 */
export const syncGmailTasks = async (req, res, next) => {
  try {
    const useMock = !isDbConnected || req.user.email === 'demo.user@taskpulse.ai';
    let accessToken = null;
    let isMockFallback = false;
    let fallbackReason = '';

    if (!useMock) {
      console.log(`[Gmail Controller] Fetching Google OAuth token from Clerk for user ${req.user.email}...`);
      // Google user ID was mapped to googleId during auth middleware sync
      const clerkUserId = req.user.googleId;
      
      if (!clerkUserId) {
        console.log('[Gmail Controller] User not linked to Google SSO. Falling back to mock emails.');
        isMockFallback = true;
        fallbackReason = 'Google SSO not linked';
      } else {
        try {
          const tokenList = await clerkClient.users.getUserOauthAccessToken(clerkUserId, 'oauth_google');
          accessToken = tokenList[0]?.token;
        } catch (err) {
          console.warn(`[Gmail Controller] Could not fetch OAuth token: ${err.message}`);
        }

        if (!accessToken) {
          console.log('[Gmail Controller] Gmail access token missing. Falling back to mock emails.');
          isMockFallback = true;
          fallbackReason = 'Gmail API permissions missing';
        }
      }
    }

    // 1. Fetch matching emails from Gmail API (or fall back to mock list on errors)
    let emails = [];
    if (useMock || isMockFallback) {
      emails = await fetchInboxEmails(null, true);
    } else {
      try {
        emails = await fetchInboxEmails(accessToken, false);
      } catch (err) {
        if (err.message.includes('403') || err.message.includes('401')) {
          console.warn(`[Gmail Controller] Google API error (${err.message}). Falling back to mock emails.`);
          emails = await fetchInboxEmails(null, true);
          isMockFallback = true;
          fallbackReason = 'Gmail API disabled/unauthorized (403)';
        } else {
          throw err;
        }
      }
    }
    
    if (!emails || emails.length === 0) {
      return res.status(200).json({
        message: 'No matching emails found in your inbox.',
        tasks: []
      });
    }

    const createdTasks = [];
    console.log(`[Gmail Controller] Processing ${emails.length} emails for task extraction...`);

    // 2. Iterate through each email, parse, and extract
    for (const email of emails) {
      const sourceName = `Email: ${email.subject}`;

      // Prevent duplicate syncing by checking existing sourceFile name
      const dbPersist = isDbConnected && req.user.email !== 'demo.user@taskpulse.ai';
      if (dbPersist) {
        const alreadyExists = await Task.findOne({ user: req.user.id, sourceFile: sourceName });
        if (alreadyExists) {
          console.log(`[Gmail Controller] Skipping duplicate email in DB: "${email.subject}"`);
          continue;
        }
      } else {
        const alreadyExists = mockTasks.some(t => t.user === req.user.id && t.sourceFile === sourceName);
        if (alreadyExists) {
          console.log(`[Gmail Controller] Skipping duplicate mock email: "${email.subject}"`);
          continue;
        }
      }

      console.log(`[Gmail Controller] Extracting tasks from email: "${email.subject}"`);
      const emailContent = `Subject: ${email.subject}\nFrom: ${email.from}\nDate: ${email.date}\nContent:\n${email.body}`;

      // Pause for 1.5 seconds to respect Google AI Studio free tier rate limits (15 RPM)
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const aiTasks = await extractTasksFromText(emailContent);
        
        if (aiTasks && aiTasks.length > 0) {
          for (const item of aiTasks) {
            let parsedDate = new Date(item.deadline);
            if (isNaN(parsedDate.getTime())) {
              parsedDate = new Date();
            }

            if (!dbPersist) {
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
                sourceFile: sourceName,
                completed: false,
                createdAt: new Date()
              };
              mockTasks.push(newTask);
              createdTasks.push(newTask);
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
                sourceFile: sourceName,
                completed: false
              });
              createdTasks.push(task);
            }
          }
        }
      } catch (extractErr) {
        console.error(`[Gmail Controller] Failed to extract from email "${email.subject}":`, extractErr.message);
        // Continue processing other emails even if one fails
      }
    }

    console.log(`[Gmail Controller] Finished syncing. Created ${createdTasks.length} tasks.`);
    
    let finalMessage = '';
    if (isMockFallback) {
      finalMessage = `Notice: ${fallbackReason}. Synced simulated demo emails instead! Extracted ${createdTasks.length} new tasks.`;
    } else {
      finalMessage = createdTasks.length > 0 
        ? `Successfully synced Gmail inbox! Extracted ${createdTasks.length} new tasks.` 
        : 'Synced Gmail inbox. No new deadlines found.';
    }

    res.status(200).json({
      message: finalMessage,
      tasks: createdTasks
    });

  } catch (error) {
    console.error('[Gmail Controller] Sync process failed:', error.message);
    next(error);
  }
};
