import express from 'express';
import { syncGmailTasks } from '../controllers/gmailController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Secures Gmail synchronization route
router.post('/sync', protect, syncGmailTasks);

export default router;
