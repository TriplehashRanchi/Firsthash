// app/attendance/components/AttendanceCalendar.jsx
import React, { useState } from 'react';
import { format, startOfMonth, getDaysInMonth, getDay, isEqual, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceCalendar = ({ history, onDayClick, students }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(startOfMonth(currentMonth));
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth });

    const getDayStatus = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const record = history.find(h => isEqual(new Date(h.date), date));
        if (!record) return 'no-record';
        const total = students.length;
        const present = record.records.filter(r => r.status === 'present').length;
        const late = record.records.filter(r => r.status === 'late').length;
        if (present + late === total) return 'perfect';
        if (record.records.some(r => r.status === 'absent')) return 'issue';
        return 'no-record';
    };

    const statusStyles = {
        perfect: 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60',
        issue: 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/60',
        'no-record': 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700',
        today: 'ring-2 ring-indigo-500',
    };

    const changeMonth = (amount) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft/></button>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{format(currentMonth, 'MMMM yyyy')}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map(day => {
                    const status = getDayStatus(day);
                    const isTodayMarker = isToday(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                    return (
                        <button 
                            key={day} 
                            onClick={() => onDayClick(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                            className={`h-12 w-full rounded-lg transition-colors ${statusStyles[status]} ${isTodayMarker ? statusStyles.today : ''}`}
                        >
                            <span className="font-bold text-slate-700 dark:text-slate-200">{day}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default AttendanceCalendar;