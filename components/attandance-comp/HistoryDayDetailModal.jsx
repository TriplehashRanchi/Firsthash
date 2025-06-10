// components/attandance-comp/HistoryDayDetailModal.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isEqual } from 'date-fns';

// CORRECTED: Import from the same directory
import StatusBadge from './StatusBadge';

// ... (rest of the component code is unchanged) ...
const HistoryDayDetailModal = ({ date, history, students, onClose }) => {
    if (!date) return null;
    const record = history.find(h => isEqual(new Date(h.date), date));
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    return (
        <AnimatePresence>
            {date && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Attendance for {format(date, 'MMMM dd, yyyy')}</h3>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {record ? (
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {record.records.map(r => {
                                        const student = studentMap.get(r.studentId);
                                        return (
                                            <li key={r.studentId} className="py-3 flex justify-between items-center">
                                                <span className="font-medium text-slate-600 dark:text-slate-300">{student?.name || 'Unknown'}</span>
                                                <StatusBadge status={r.status} />
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <p className="text-center text-slate-500 dark:text-slate-400">No record for this day.</p>}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-2xl">
                            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Close</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HistoryDayDetailModal;