import React from 'react';

const timeFilters = [
  { id: 'all', label: 'All Tasks' },
  { id: 'today', label: 'Due Today' },
  { id: 'tomorrow', label: 'Due Tomorrow' },
  { id: 'week', label: 'Due This Week' },
  { id: 'completed', label: 'Completed' }
];

const categoryFilters = [
  { id: 'ALL_CATS', label: 'All Categories' },
  { id: 'Assignments', label: 'Assignments' },
  { id: 'Placements', label: 'Placements' },
  { id: 'Internships', label: 'Internships' },
  { id: 'Exams', label: 'Exams' },
  { id: 'Bills', label: 'Bills' },
  { id: 'Meetings', label: 'Meetings' },
  { id: 'Events', label: 'Events' },
  { id: 'Projects', label: 'Projects' },
  { id: 'Personal', label: 'Personal' }
];

export const FilterBar = ({
  activeTimeFilter,
  onTimeFilterChange,
  activeCategoryFilter,
  onCategoryFilterChange,
  tasks
}) => {
  // Helper to count tasks for badges
  const getFilterCount = (filterId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDateMatch = (dateStr, targetDate) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);
      return d.getTime() === targetDate.getTime();
    };

    const isThisWeekCheck = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    };

    const pending = tasks.filter(t => !t.completed);

    switch (filterId) {
      case 'all':
        return pending.length;
      case 'today':
        return pending.filter(t => checkDateMatch(t.deadline, today)).length;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return pending.filter(t => checkDateMatch(t.deadline, tomorrow)).length;
      case 'week':
        return pending.filter(t => isThisWeekCheck(t.deadline)).length;
      case 'completed':
        return tasks.filter(t => t.completed).length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Time/Status Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
          {timeFilters.map((filter) => {
            const isActive = activeTimeFilter === filter.id;
            const count = getFilterCount(filter.id);
            
            return (
              <button
                key={filter.id}
                onClick={() => onTimeFilterChange(filter.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Categories:
        </span>
        <div className="flex gap-2">
          {categoryFilters.map((cat) => {
            const isActive = activeCategoryFilter === cat.id;
            const pendingInCat = tasks.filter(t => !t.completed && (cat.id === 'ALL_CATS' || t.category === cat.id)).length;

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryFilterChange(cat.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                {cat.label}
                {pendingInCat > 0 && cat.id !== 'ALL_CATS' && (
                  <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {pendingInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
