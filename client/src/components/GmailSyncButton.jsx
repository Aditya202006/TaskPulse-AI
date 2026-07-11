import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { syncGmailTasksApi } from '../services/taskService';

export const GmailSyncButton = ({ onSyncSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle | syncing | success | error
  const [message, setMessage] = useState('');
  const [taskCount, setTaskCount] = useState(0);

  const handleSync = async () => {
    setStatus('syncing');
    setMessage('Connecting to Gmail...');
    
    // Simulate steps for better UX
    const steps = [
      'Scanning recent inbox emails...',
      'Running Gemini AI task extractor...',
      'Writing deadlines to database...'
    ];
    
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setMessage(steps[stepIdx]);
        stepIdx++;
      }
    }, 1500);

    try {
      const data = await syncGmailTasksApi();
      clearInterval(interval);
      setTaskCount(data.tasks?.length || 0);
      setStatus('success');
      setMessage(data.message || 'Gmail sync complete!');
      
      if (data.tasks && data.tasks.length > 0) {
        onSyncSuccess(data.tasks);
      }

      // Reset to idle after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setTaskCount(0);
      }, 4000);

    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setStatus('error');
      
      const errMsg = err.response?.data?.message || 'Sync failed. Verify server and network connection.';
      setMessage(errMsg);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
          <Mail className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Gmail Inbox Sync</h2>
          <p className="text-2xs text-slate-500">Auto-extract deadlines from emails</p>
        </div>
      </div>

      {/* Body States */}
      {status === 'syncing' && (
        <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          <span className="text-xs font-semibold text-slate-600 animate-pulse">
            {message}
          </span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="text-xs font-semibold">
            {message} {taskCount > 0 && `(${taskCount} new task${taskCount > 1 ? 's' : ''} added)`}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-700 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="font-semibold leading-relaxed">{message}</div>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 underline focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Extract dates from placement notices, exam schedule emails, or utility bills in one click.
          </p>
          <button
            onClick={handleSync}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
          >
            Sync Gmail Inbox
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GmailSyncButton;
