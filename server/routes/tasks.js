import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Apply auth protection middleware to all task management routes
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
