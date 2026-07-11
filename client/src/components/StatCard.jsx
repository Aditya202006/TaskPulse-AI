import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50/50 hover:bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100 text-blue-600',
    text: 'text-blue-900',
    activeRing: 'ring-2 ring-blue-500 border-transparent',
    glow: 'shadow-blue-50'
  },
  amber: {
    bg: 'bg-amber-50/50 hover:bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100 text-amber-600',
    text: 'text-amber-900',
    activeRing: 'ring-2 ring-amber-500 border-transparent',
    glow: 'shadow-amber-50'
  },
  rose: {
    bg: 'bg-rose-50/50 hover:bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100 text-rose-600',
    text: 'text-rose-900',
    activeRing: 'ring-2 ring-rose-500 border-transparent',
    glow: 'shadow-rose-50'
  },
  emerald: {
    bg: 'bg-emerald-50/50 hover:bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-900',
    activeRing: 'ring-2 ring-emerald-500 border-transparent',
    glow: 'shadow-emerald-50'
  },
  purple: {
    bg: 'bg-purple-50/50 hover:bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100 text-purple-600',
    text: 'text-purple-900',
    activeRing: 'ring-2 ring-purple-500 border-transparent',
    glow: 'shadow-purple-50'
  }
};

export const StatCard = ({ title, value, icon: Icon, color = 'blue', isActive = false, onClick }) => {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex flex-col justify-between p-5 rounded-2xl border bg-white transition-all duration-300 hover:shadow-md ${styles.glow} ${styles.bg} ${
        isActive ? styles.activeRing + ' shadow-md scale-[1.02]' : 'border-slate-200'
      } cursor-pointer focus:outline-none`}
    >
      <div className="flex w-full justify-between items-start">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${styles.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline">
        <span className={`text-3xl font-bold tracking-tight ${styles.text}`}>
          {value}
        </span>
      </div>
    </button>
  );
};

export default StatCard;
