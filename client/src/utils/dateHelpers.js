/**
 * Format date string into a user-friendly format (e.g., 'Jul 15, 2026')
 * @param {string|Date} dateInput 
 * @returns {string} Formatted date
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get human-readable relative string and color indicator for a deadline
 * @param {string|Date} dateInput 
 * @param {boolean} completed 
 * @returns {Object} { text, colorClass, status }
 */
export const getDeadlineStatus = (dateInput, completed) => {
  if (completed) {
    return { text: 'Completed', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200', status: 'completed' };
  }

  if (!dateInput) {
    return { text: 'No Date', colorClass: 'text-slate-500 bg-slate-50 border-slate-200', status: 'none' };
  }

  const deadline = new Date(dateInput);
  if (isNaN(deadline.getTime())) {
    return { text: String(dateInput), colorClass: 'text-slate-500 bg-slate-50 border-slate-200', status: 'unknown' };
  }

  // Clear times to compare dates only
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(deadline);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: `Overdue by ${absDays} day${absDays > 1 ? 's' : ''}`,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse',
      status: 'overdue'
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Today',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200 font-semibold',
      status: 'today'
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200 font-medium',
      status: 'tomorrow'
    };
  }

  if (diffDays <= 7) {
    return {
      text: `${diffDays} days left`,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
      status: 'week'
    };
  }

  return {
    text: formatDate(deadline),
    colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
    status: 'upcoming'
  };
};

/**
 * Checks if a date falls in "This Week" (next 7 days starting today)
 * @param {string|Date} dateInput 
 * @returns {boolean}
 */
export const isThisWeek = (dateInput) => {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 7;
};
