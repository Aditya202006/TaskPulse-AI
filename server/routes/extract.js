import express from 'express';
import { extractTasks } from '../controllers/extractController.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Extends protection and limits uploaded fields to 'file'
router.post('/', protect, upload.single('file'), extractTasks);

export default router;
