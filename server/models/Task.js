import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  originalDeadline: {
    type: String,
    trim: true
  },
  time: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: [
      'Assignments',
      'Placements',
      'Internships',
      'Exams',
      'Bills',
      'Meetings',
      'Events',
      'Projects',
      'Personal',
      'Others'
    ],
    default: 'Others'
  },
  summary: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  sourceFile: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
