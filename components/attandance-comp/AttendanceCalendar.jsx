// app/attendance/components/AttendanceCalendar.jsx
import React, { useMemo, useState } from 'react';
import { format, startOfMonth, getDaysInMonth, getDay, isEqual, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const getRecordTime = (record, key) => record?.[key] || record?.[key === 'inTime' ? 'in_time' : 'out_time'] || '';

const timeToSeconds = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return null;

    const [hours, minutes] = timeValue.slice(0, 5).split(':').map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    return (hours * 3600) + (minutes * 60);
};

const getWorkedSeconds = (record) => {
    const inSeconds = timeToSeconds(getRecordTime(record, 'inTime'));
    const outSeconds = timeToSeconds(getRecordTime(record, 'outTime'));

    if (inSeconds === null || outSeconds === null || outSeconds <= inSeconds) return 0;

    return outSeconds - inSeconds;
};

const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0 && minutes === 0) return '';
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const AttendanceCalendar = ({ history, onDayClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(startOfMonth(currentMonth));
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth });

    const monthSummary = useMemo(() => {
        const monthRecords = history
            .filter(day => isSameMonth(new Date(day.date), currentMonth))
            .flatMap(day => day.records);

        return {
            present: monthRecords.filter(record => record.status === 'present').length,
            absent: monthRecords.filter(record => record.status === 'absent').length,
            late: monthRecords.filter(record => record.status === 'late').length,
        };
    }, [history, currentMonth]);

    const getDayRecord = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return history.find(h => isEqual(new Date(h.date), date));
    };

    const getDayStatus = (record) => {
        if (!record || record.records.length === 0) return 'no-record';
        if (record.records.some(r => r.status === 'absent')) return 'absent';
        if (record.records.some(r => ['present', 'late'].includes(r.status) && r.location_status === 'outside_radius')) return 'outside';
        if (record.records.some(r => ['present', 'late'].includes(r.status))) return 'present';
        return 'no-record';
    };

    const getDayWorkedLabel = (record) => {
        if (!record) return '';
        const totalSeconds = record.records.reduce((sum, item) => sum + getWorkedSeconds(item), 0);
        return formatDuration(totalSeconds);
    };

    const statusStyles = {
        present: 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60',
        outside: 'bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60',
        absent: 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/60',
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
            <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-green-50 px-3 py-2 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <div className="text-xs font-semibold uppercase">Present</div>
                    <div className="text-xl font-bold">{monthSummary.present}</div>
                </div>
                <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <div className="text-xs font-semibold uppercase">Absent</div>
                    <div className="text-xl font-bold">{monthSummary.absent}</div>
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <div className="text-xs font-semibold uppercase">Late</div>
                    <div className="text-xl font-bold">{monthSummary.late}</div>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                {calendarDays.map(day => {
                    const record = getDayRecord(day);
                    const status = getDayStatus(record);
                    const workedLabel = getDayWorkedLabel(record);
                    const isTodayMarker = isToday(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                    return (
                        <button 
                            key={day} 
                            onClick={() => onDayClick(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                            className={`flex h-14 w-full flex-col items-center justify-center rounded-lg transition-colors ${statusStyles[status]} ${isTodayMarker ? statusStyles.today : ''}`}
                        >
                            <span className="font-bold text-slate-700 dark:text-slate-200">{day}</span>
                            {workedLabel ? <span className="mt-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">{workedLabel}</span> : null}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default AttendanceCalendar;
