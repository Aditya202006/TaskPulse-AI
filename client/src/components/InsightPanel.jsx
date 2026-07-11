import React from 'react';
import { Sparkles, CalendarClock, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { isThisWeek } from '../utils/dateHelpers';

export const InsightPanel = ({ tasks }) => {
  const pendingTasks = tasks.filter(t => !t.completed);
  
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-3">
          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          <h2>AI Pulse Insights</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed italic">
          No tasks found yet. Upload a schedule or poster to extract upcoming deadlines and view automated action items.
        </p>
      </div>
    );
  }

  // Calculations
  const totalPending = pendingTasks.length;
  const highPriorityPending = pendingTasks.filter(t => t.priority === 'High').length;
  
  // Tasks due today/tomorrow
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkDateMatch = (dateInput, matchDate) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return false;
    d.setHours(0, 0, 0, 0);
    return d.getTime() === matchDate.getTime();
  };

  const dueTodayCount = pendingTasks.filter(t => checkDateMatch(t.deadline, today)).length;
  const dueTomorrowTasks = pendingTasks.filter(t => checkDateMatch(t.deadline, tomorrow));
  const dueTomorrowCount = dueTomorrowTasks.length;
  const dueThisWeekCount = pendingTasks.filter(t => isThisWeek(t.deadline)).length;

  // Most common pending category
  const categoryCounts = pendingTasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  let topCategory = null;
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  });

  const completionRate = Math.round(((tasks.length - totalPending) / tasks.length) * 100);

  // Build list of insights strings & icons
  const insights = [];

  // Insight 1: Deadlines due today/tomorrow
  if (dueTodayCount > 0) {
    insights.push({
      text: `Urgent: You have ${dueTodayCount} task${dueTodayCount > 1 ? 's' : ''} due TODAY.`,
      icon: AlertTriangle,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
      iconColor: 'text-rose-600'
    });
  } else if (dueTomorrowCount > 0) {
    const hasInterviewOrExam = dueTomorrowTasks.some(t => t.category === 'Placements' || t.category === 'Exams');
    insights.push({
      text: hasInterviewOrExam 
        ? `Heads up: You have a Placement/Exam deadline TOMORROW!` 
        : `You have ${dueTomorrowCount} deadline${dueTomorrowCount > 1 ? 's' : ''} tomorrow.`,
      icon: CalendarClock,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600'
    });
  }

  // Insight 2: Weekly deadlines
  if (dueThisWeekCount > 0) {
    insights.push({
      text: `You have ${dueThisWeekCount} deadline${dueThisWeekCount > 1 ? 's' : ''} this week.`,
      icon: CalendarClock,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600'
    });
  }

  // Insight 3: Category with highest load
  if (topCategory && maxCount > 0) {
    insights.push({
      text: `Most pending tasks belong to the "${topCategory}" category.`,
      icon: TrendingUp,
      colorClass: 'text-purple-600 bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600'
    });
  }

  // Insight 4: General feedback
  if (highPriorityPending > 0) {
    insights.push({
      text: `You have ${highPriorityPending} High Priority task${highPriorityPending > 1 ? 's' : ''} waiting. Focus on these!`,
      icon: Lightbulb,
      colorClass: 'text-amber-600 bg-amber-50/50 border-amber-100',
      iconColor: 'text-amber-600'
    });
  } else if (completionRate > 60 && totalPending > 0) {
    insights.push({
      text: `Great work! Your task completion rate is ${completionRate}%. Keep it up.`,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600'
    });
  } else {
    insights.push({
      text: `All clean. Clear outstanding tasks to boost your academic flow.`,
      icon: Lightbulb,
      colorClass: 'text-slate-600 bg-slate-50 border-slate-100',
      iconColor: 'text-slate-500'
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2>AI Pulse Insights</h2>
      </div>

      <div className="flex flex-col gap-3">
        {insights.slice(0, 3).map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 hover:translate-x-1 ${insight.colorClass}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${insight.iconColor}`} />
              <p className="text-sm font-medium leading-relaxed">
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightPanel;
