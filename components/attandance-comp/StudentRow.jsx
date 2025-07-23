// components/attandance-comp/StudentRow.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, X, User } from 'lucide-react';

export default function StudentRow({ student, attendanceRecord, onRecordUpdate }) {
    const { status, inTime, outTime } = attendanceRecord;

    const baseBtn = 'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
    const activeBtn = 'text-white shadow-md';
    const inactiveBtn = 'bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600';

    const styles = {
        present: status === 'present'
            ? `bg-green-600 ${activeBtn} focus:ring-green-500`
            : `${inactiveBtn} hover:bg-green-50 dark:hover:bg-green-900/40`,
        late: status === 'late'
            ? `bg-yellow-500 ${activeBtn} focus:ring-yellow-500`
            : `${inactiveBtn} hover:bg-yellow-50 dark:hover:bg-yellow-900/40`,
        absent: status === 'absent'
            ? `bg-red-600 ${activeBtn} focus:ring-red-500`
            : `${inactiveBtn} hover:bg-red-50 dark:hover:bg-red-900/40`,
    };

    // Always include studentId in the new record
    const handleStatusClick = (newStatus) => {
        const defaults = {
            present: { status: 'present', inTime: inTime || '09:00', outTime: outTime || '17:00' },
            late:    { status: 'late',    inTime: inTime || '09:30', outTime: '' },
            absent:  { status: 'absent',  inTime: '', outTime: '' }
        };
        const base = defaults[newStatus];
        onRecordUpdate(student.id, { studentId: student.id, ...base });
    };

    const handleTimeChange = (field, value) => {
        onRecordUpdate(student.id, {
            studentId: student.id,
            status,
            inTime,
            outTime,
            [field]: value
        });
    };

    return (
        <>
            <motion.tr layout className="border-b border-slate-200 dark:border-slate-700/50">
                <td className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-700">
                            <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{student.name}</span>
                    </div>
                </td>
                <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button className={`${baseBtn} ${styles.present}`} onClick={() => handleStatusClick('present')}><Check size={14}/> Present</button>
                        <button className={`${baseBtn} ${styles.late}`} onClick={() => handleStatusClick('late')}><Clock size={14}/> Late</button>
                        <button className={`${baseBtn} ${styles.absent}`} onClick={() => handleStatusClick('absent')}><X size={14}/> Absent</button>
                    </div>
                </td>
            </motion.tr>

            <AnimatePresence>
                {(status === 'present' || status === 'late') && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-slate-50 dark:bg-slate-800/30"
                    >
                        <td colSpan="2" className="p-3">
                            <div className="flex items-center justify-end gap-4">
                                {status === 'late' && (
                                    <div className="flex items-center gap-2">
                                        <label htmlFor={`in-time-${student.id}`} className="text-sm font-medium text-slate-500 dark:text-slate-400">Late Arrival:</label>
                                        <input
                                            type="time"
                                            id={`in-time-${student.id}`}  
                                            value={inTime}
                                            onChange={e => handleTimeChange('inTime', e.target.value)}
                                            className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm w-32"
                                        />
                                    </div>
                                )}

                                {status === 'present' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`in-time-${student.id}`} className="text-sm font-medium text-slate-500 dark:text-slate-400">In Time:</label>
                                            <input
                                                type="time"
                                                id={`in-time-${student.id}`}  
                                                value={inTime}
                                                onChange={e => handleTimeChange('inTime', e.target.value)}
                                                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm w-32"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`out-time-${student.id}`} className="text-sm font-medium text-slate-500 dark:text-slate-400">Out Time:</label>
                                            <input
                                                type="time"
                                                id={`out-time-${student.id}`}  
                                                value={outTime}
                                                onChange={e => handleTimeChange('outTime', e.target.value)}
                                                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm w-32"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
}
