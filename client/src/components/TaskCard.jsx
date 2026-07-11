import React, { useState } from 'react';
import { Calendar, Clock, FileText, Trash2, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { getDeadlineStatus } from '../utils/dateHelpers';

// Category color mappings
const categoryStyles = {
  Assignments: 'bg-blue-50 text-blue-700 border-blue-150',
  Placements: 'bg-purple-50 text-purple-700 border-purple-150',
  Internships: 'bg-indigo-50 text-indigo-700 border-indigo-150',
  Exams: 'bg-rose-50 text-rose-700 border-rose-150',
  Bills: 'bg-orange-50 text-orange-700 border-orange-150',
  Meetings: 'bg-amber-50 text-amber-700 border-amber-150',
  Events: 'bg-pink-50 text-pink-700 border-pink-150',
  Projects: 'bg-sky-50 text-sky-700 border-sky-150',
  Personal: 'bg-teal-50 text-teal-700 border-teal-150',
  Others: 'bg-slate-50 text-slate-700 border-slate-150'
};

// Priority color mappings
const priorityStyles = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200'
};

export const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  const [showReason, setShowReason] = useState(false);
  const { _id, title, deadline, time, priority, category, summary, reason, sourceFile, completed } = task;

  const deadlineStatus = getDeadlineStatus(deadline, completed);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-300 hover:shadow-md hover:border-slate-300 ${
        completed ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-slate-200'
      }`}
    >
      {/* Visual top border indicator for High Priority */}
      {!completed && priority === 'High' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${categoryStyles[category] || categoryStyles.Others}`}>
              {category}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${priorityStyles[priority] || priorityStyles.Medium}`}>
              {priority} Priority
            </span>
          </div>

          {/* Status Badge */}
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${deadlineStatus.colorClass}`}>
            {deadlineStatus.text}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3
            className={`text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors ${
              completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Summary Description */}
        {summary && (
          <p className={`text-sm text-slate-600 leading-relaxed ${completed ? 'text-slate-400' : ''}`}>
            {summary}
          </p>
        )}

        {/* Time and Date Fields */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{deadlineStatus.text.includes('Overdue') || deadlineStatus.text === 'Today' || deadlineStatus.text === 'Tomorrow' ? 'Date:' : ''} {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{time}</span>
            </div>
          )}
          {sourceFile && (
            <div className="flex items-center gap-1 max-w-[200px]" title={sourceFile}>
              <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-400 italic">{sourceFile}</span>
            </div>
          )}
        </div>

        {/* Reason for AI Extraction Collapsible */}
        {reason && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowReason(!showReason)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              <span>AI Extraction Logic</span>
              {showReason ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showReason && (
              <p className="mt-2 text-xs leading-relaxed text-slate-500 bg-slate-50 border border-slate-150 p-2.5 rounded-lg italic">
                {reason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={() => onToggleComplete(_id, !completed)}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold border transition-all ${
            completed
              ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${completed ? 'text-slate-400' : ''}`} />
          {completed ? 'Undo Complete' : 'Mark Complete'}
        </button>

        <button
          onClick={() => onDelete(_id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all"
          title="Delete Task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
