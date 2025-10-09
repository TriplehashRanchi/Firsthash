'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

export default function ExpenseInfoPopup() {
  const [visible, setVisible] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const timerRef = useRef(null);

  // 🟢 Show once automatically for 3s after page load
  useEffect(() => {
    if (!hasShownOnce) {
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 3000);
      setHasShownOnce(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [hasShownOnce]);

  // 🟡 Hover behavior (for later manual re-view)
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setVisible(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setVisible(false), 1000);
  };

  return (
    <div className="relative ml-2 inline-block">
      {/* ℹ️ Info Icon */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
        aria-label="Info about expenses"
      >
        <Info size={17} strokeWidth={2} />
      </button>

      {/* Tooltip */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute z-50 left-6 top-1/2 -translate-y-1/2 w-72 sm:w-80 
          bg-gradient-to-br from-slate-800 to-slate-900 text-white text-xs sm:text-sm 
          px-4 py-3 rounded-lg shadow-2xl border border-slate-700 transition-all duration-500 ease-out
          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}
      >
        <p className="leading-snug">
          💡 <span className="font-medium text-amber-300">Internal Note:</span>{' '}
          These extra expenses are internal and <span className="font-semibold text-amber-300">not billed to the client.</span>{' '}
          They won’t appear in the quotation or total cost.
        </p>

        {/* Tooltip Arrow */}
        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-slate-800"></div>
      </div>
    </div>
  );
}
