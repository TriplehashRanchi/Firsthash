// components/attandance-comp/ViewHistoryTab.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// CORRECTED: Imports from the same directory
import AttendanceCalendar from './AttendanceCalendar';
import StatusBadge from './StatusBadge';

// ... (rest of the component code is unchanged) ...
const ViewHistoryTab = ({ history, students, studentMap, onDayClick }) => {
    const [historyView, setHistoryView] = useState('list');
    const [filterStudent, setFilterStudent] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredHistory = useMemo(() => {
        return history.map(day => {
            let filteredRecords = day.records;
            if (filterStudent !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.studentId === filterStudent);
            }
            if (filterStatus !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.status === filterStatus);
            }
            return { ...day, records: filteredRecords };
        }).filter(day => day.records.length > 0);
    }, [history, filterStudent, filterStatus]);

    const tabBtn = "flex-1 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2 text-nowrap";
    const activeTabBtn = "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm rounded-md";
    const inactiveTabBtn = "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-4">
                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex space-x-1">
                    <button onClick={() => setHistoryView('list')} className={`${tabBtn} ${historyView === 'list' ? activeTabBtn : inactiveTabBtn}`}>List View</button>
                    <button onClick={() => setHistoryView('calendar')} className={`${tabBtn} ${historyView === 'calendar' ? activeTabBtn : inactiveTabBtn}`}>Calendar View</button>
                </div>
            </div>

            {historyView === 'list' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <select onChange={(e) => setFilterStudent(e.target.value)} value={filterStudent} className="w-full p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                            <option value="all">All Students</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} className="w-full p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                            <option value="all">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <AnimatePresence>
                        {filteredHistory.map(day => (
                            <motion.div key={day.date} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                <h3 className="px-5 py-3 text-md font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">{format(new Date(day.date), 'EEEE, MMMM dd, yyyy')}</h3>
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">{day.records.map(r => <li key={r.studentId} className="px-5 py-3 flex justify-between items-center"><span className="font-medium text-slate-600 dark:text-slate-300">{studentMap.get(r.studentId)?.name}</span><StatusBadge status={r.status} /></li>)}</ul>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
            
            {historyView === 'calendar' && <AttendanceCalendar history={history} onDayClick={onDayClick} students={students}/>}
        </motion.div>
    );
};

export default ViewHistoryTab;