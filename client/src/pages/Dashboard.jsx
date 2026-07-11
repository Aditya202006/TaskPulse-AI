import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import UploadZone from '../components/UploadZone';
import InsightPanel from '../components/InsightPanel';
import FilterBar from '../components/FilterBar';
import TaskCard from '../components/TaskCard';
import {
  fetchTasks,
  createTaskManual,
  updateTaskApi,
  deleteTaskApi,
  extractTasksFromFile
} from '../services/taskService';
import GmailSyncButton from '../components/GmailSyncButton';
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Inbox,
  X,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { isThisWeek } from '../utils/dateHelpers';

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTimeFilter, setActiveTimeFilter] = useState('all'); // all, today, tomorrow, week, completed, overdue, high_priority, upcoming
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL_CATS');

  // File Upload State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');

  // Manual Task Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualTask, setManualTask] = useState({
    title: '',
    deadline: '',
    time: '',
    priority: 'Medium',
    category: 'Others',
    summary: '',
    reason: ''
  });
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load Tasks on Mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Upload and Extract Callbacks
  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setProgressStep('Uploading document to server...');
    setError(null);

    // Dynamic timer to simulate steps for the user
    const stepInterval = setTimeout(() => {
      setProgressStep('Running OCR Space text extraction...');
    }, 2000);

    const stepInterval2 = setTimeout(() => {
      setProgressStep('Prompting Google Gemini AI parser...');
    }, 4500);

    try {
      const response = await extractTasksFromFile(file);
      
      // Update tasks array with newly added tasks
      if (response.tasks && response.tasks.length > 0) {
        setTasks(prev => [...response.tasks, ...prev]);
      } else {
        alert(response.message || 'No deadlines could be found in the document.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'File processing failed. Please verify API configurations.');
    } finally {
      clearTimeout(stepInterval);
      clearTimeout(stepInterval2);
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  // Task Actions
  const handleToggleComplete = async (id, completed) => {
    try {
      const updatedTask = await updateTaskApi(id, { completed });
      setTasks(prev => prev.map(t => (t._id === id ? updatedTask : t)));
    } catch (err) {
      console.error(err);
      alert('Could not update task status.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskApi(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete task.');
    }
  };

  const handleGmailSyncSuccess = (newTasks) => {
    setTasks(prev => [...newTasks, ...prev]);
  };

  // Manual Task Submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!manualTask.title || !manualTask.deadline) {
      setModalError('Title and Deadline Date are required.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createTaskManual(manualTask);
      setTasks(prev => [created, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setManualTask({
        title: '',
        deadline: '',
        time: '',
        priority: 'Medium',
        category: 'Others',
        summary: '',
        reason: ''
      });
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to manually add task.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get Today's context
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getTomorrowDate = () => {
    const tomorrow = getTodayDate();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Calculate dynamic stats
  const todayDate = getTodayDate();
  const tomorrowDate = getTomorrowDate();

  const countTodayPending = tasks.filter(t => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === todayDate.getTime();
  }).length;

  const countUpcoming = tasks.filter(t => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= todayDate.getTime();
  }).length;

  const countOverdue = tasks.filter(t => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < todayDate.getTime();
  }).length;

  const countCompleted = tasks.filter(t => t.completed).length;

  const countHighPriorityPending = tasks.filter(t => t.priority === 'High' && !t.completed).length;

  // Filter Tasks
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // 1. Search Query Match
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query) ||
          (task.summary && task.summary.toLowerCase().includes(query)) ||
          task.priority.toLowerCase().includes(query) ||
          (task.sourceFile && task.sourceFile.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // 2. Category Filter
      if (activeCategoryFilter !== 'ALL_CATS' && task.category !== activeCategoryFilter) {
        return false;
      }

      // 3. Time / Status Filter
      const taskDate = new Date(task.deadline);
      taskDate.setHours(0, 0, 0, 0);

      switch (activeTimeFilter) {
        case 'today':
          return !task.completed && taskDate.getTime() === todayDate.getTime();
        case 'tomorrow':
          return !task.completed && taskDate.getTime() === tomorrowDate.getTime();
        case 'week':
          return !task.completed && isThisWeek(task.deadline);
        case 'completed':
          return task.completed;
        case 'overdue':
          return !task.completed && taskDate.getTime() < todayDate.getTime();
        case 'high_priority':
          return !task.completed && task.priority === 'High';
        case 'upcoming':
          return !task.completed && taskDate.getTime() >= todayDate.getTime();
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* User Greetings */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload class schedules or email screenshots to extract deadlines instantly.
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Task Manually
          </button>
        </div>

        {/* Global Connection Errors */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-rose-700 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Connection Issue:</span> {error}
              <button onClick={loadTasks} className="ml-2 font-bold underline hover:text-rose-900">Retry Connecting</button>
            </div>
          </div>
        )}

        {/* Dynamic Statistics Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title="Today's Tasks"
            value={countTodayPending}
            icon={CalendarCheck}
            color="amber"
            isActive={activeTimeFilter === 'today'}
            onClick={() => {
              setActiveTimeFilter('today');
              setActiveCategoryFilter('ALL_CATS');
            }}
          />
          <StatCard
            title="Upcoming"
            value={countUpcoming}
            icon={CalendarDays}
            color="blue"
            isActive={activeTimeFilter === 'upcoming'}
            onClick={() => {
              setActiveTimeFilter('upcoming');
              setActiveCategoryFilter('ALL_CATS');
            }}
          />
          <StatCard
            title="Overdue"
            value={countOverdue}
            icon={AlertTriangle}
            color="rose"
            isActive={activeTimeFilter === 'overdue'}
            onClick={() => {
              setActiveTimeFilter('overdue');
              setActiveCategoryFilter('ALL_CATS');
            }}
          />
          <StatCard
            title="Completed"
            value={countCompleted}
            icon={CheckCircle}
            color="emerald"
            isActive={activeTimeFilter === 'completed'}
            onClick={() => {
              setActiveTimeFilter('completed');
              setActiveCategoryFilter('ALL_CATS');
            }}
          />
          <StatCard
            title="High Priority"
            value={countHighPriorityPending}
            icon={Zap}
            color="purple"
            isActive={activeTimeFilter === 'high_priority'}
            onClick={() => {
              setActiveTimeFilter('high_priority');
              setActiveCategoryFilter('ALL_CATS');
            }}
          />
        </div>

        {/* Middle Panel: Upload & Smart AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UploadZone
              onUploadSuccess={handleFileUpload}
              isProcessing={isProcessing}
              progressStep={progressStep}
            />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <InsightPanel tasks={tasks} />
            <GmailSyncButton onSyncSuccess={handleGmailSyncSuccess} />
          </div>
        </div>

        {/* Task Sorting Filters & Searching Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
          {/* Header Row: Search & reset buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search extracted titles, tags, summaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-250 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Clear All Filters helper */}
            {(activeTimeFilter !== 'all' || activeCategoryFilter !== 'ALL_CATS' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveTimeFilter('all');
                  setActiveCategoryFilter('ALL_CATS');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline focus:outline-none shrink-0"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Filters Bar Component */}
          <FilterBar
            activeTimeFilter={activeTimeFilter}
            onTimeFilterChange={setActiveTimeFilter}
            activeCategoryFilter={activeCategoryFilter}
            onCategoryFilterChange={setActiveCategoryFilter}
            tasks={tasks}
          />
        </div>

        {/* Task Cards Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                    <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-100 rounded" />
                  <div className="h-12 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center max-w-md mx-auto shadow-sm">
              <Inbox className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5] mb-4" />
              <h3 className="text-base font-bold text-slate-800">No matching tasks</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                We couldn't find any tasks matching your active filters. Clear filters or upload a new schedule.
              </p>
              <button
                onClick={() => {
                  setActiveTimeFilter('all');
                  setActiveCategoryFilter('ALL_CATS');
                  setSearchQuery('');
                }}
                className="mt-5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors focus:outline-none"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Manual Task Creator Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-2">Create Task Manually</h2>
            <p className="text-xs text-slate-500 mb-6">Fill in details to organize manual items in your timeline.</p>

            {modalError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-rose-700 text-sm">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="font-medium">{modalError}</div>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 3 submission"
                  value={manualTask.title}
                  onChange={(e) => setManualTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualTask.deadline}
                    onChange={(e) => setManualTask(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Deadline Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 5:00 PM or 17:00"
                    value={manualTask.time}
                    onChange={(e) => setManualTask(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={manualTask.priority}
                    onChange={(e) => setManualTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Category
                  </label>
                  <select
                    value={manualTask.category}
                    onChange={(e) => setManualTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  >
                    <option value="Assignments">Assignments</option>
                    <option value="Placements">Placements</option>
                    <option value="Internships">Internships</option>
                    <option value="Exams">Exams</option>
                    <option value="Bills">Bills</option>
                    <option value="Meetings">Meetings</option>
                    <option value="Events">Events</option>
                    <option value="Projects">Projects</option>
                    <option value="Personal">Personal</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {/* Description Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Summary Description
                </label>
                <textarea
                  placeholder="Summarize the core requirements or context here..."
                  rows="3"
                  value={manualTask.summary}
                  onChange={(e) => setManualTask(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-650 hover:bg-slate-50 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-all focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
