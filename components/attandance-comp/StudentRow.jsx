// // components/attandance-comp/StudentRow.jsx
// import React from 'react';
// import { motion } from 'framer-motion';
// import { Check, Clock, X, User } from 'lucide-react';

// const StudentRow = ({ student, status, onStatusChange }) => {
//     const baseBtn = 'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
//     const activeBtn = 'text-white shadow-md';
//     const inactiveBtn = 'bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600';

//     const styles = {
//         present: status === 'present' ? `bg-green-600 ${activeBtn} focus:ring-green-500` : `${inactiveBtn} hover:bg-green-50 dark:hover:bg-green-900/40`,
//         late: status === 'late' ? `bg-yellow-500 ${activeBtn} focus:ring-yellow-500` : `${inactiveBtn} hover:bg-yellow-50 dark:hover:bg-yellow-900/40`,
//         absent: status === 'absent' ? `bg-red-600 ${activeBtn} focus:ring-red-500` : `${inactiveBtn} hover:bg-red-50 dark:hover:bg-red-900/40`,
//     };

//     return (
//         <motion.tr 
//             layout 
//             initial={{ opacity: 0 }} 
//             animate={{ opacity: 1 }} 
//             exit={{ opacity: 0 }}
//             className="border-b border-slate-200 dark:border-slate-700/50"
//         >
//             <td className="p-4">
//                 <div className="flex items-center gap-4">
//                     {/* --- START: This is the updated section --- */}
//                     <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-700">
//                         <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
//                     </div>
//                     {/* --- END: This is the updated section --- */}

//                     <span className="font-medium text-slate-800 dark:text-slate-200">{student.name}</span>
//                 </div>
//             </td>
//             <td className="p-4 text-right">
//                 <div className="flex items-center justify-end gap-2">
//                     <button className={`${baseBtn} ${styles.present}`} onClick={() => onStatusChange(student.id, 'present')}><Check size={14}/> Present</button>
//                     <button className={`${baseBtn} ${styles.late}`} onClick={() => onStatusChange(student.id, 'late')}><Clock size={14}/> Late</button>
//                     <button className={`${baseBtn} ${styles.absent}`} onClick={() => onStatusChange(student.id, 'absent')}><X size={14}/> Absent</button>
//                 </div>
//             </td>
//         </motion.tr>
//     );
// };

// export default StudentRow;

















// components/attandance-comp/StudentRow.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, X, User } from 'lucide-react';

// CHANGE 1: The component now receives a detailed 'attendanceRecord' object and an 'onRecordUpdate' function.
const StudentRow = ({ student, attendanceRecord, onRecordUpdate }) => {
    // Destructure the record for easier access.
    const { status, inTime, outTime } = attendanceRecord;

    const baseBtn = 'px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
    const activeBtn = 'text-white shadow-md';
    const inactiveBtn = 'bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600';

    const styles = {
        present: status === 'present' ? `bg-green-600 ${activeBtn} focus:ring-green-500` : `${inactiveBtn} hover:bg-green-50 dark:hover:bg-green-900/40`,
        late: status === 'late' ? `bg-yellow-500 ${activeBtn} focus:ring-yellow-500` : `${inactiveBtn} hover:bg-yellow-50 dark:hover:bg-yellow-900/40`,
        absent: status === 'absent' ? `bg-red-600 ${activeBtn} focus:ring-red-500` : `${inactiveBtn} hover:bg-red-50 dark:hover:bg-red-900/40`,
    };

    // CHANGE 2: Handlers for updating status and time.
    const handleStatusClick = (newStatus) => {
        // Create a new record object based on the new status, with default times.
        const newRecord = {
            present: { status: 'present', inTime: inTime || '09:00', outTime: outTime || '17:00' },
            late: { status: 'late', inTime: inTime || '09:30', outTime: '' },
            absent: { status: 'absent', inTime: '', outTime: '' },
        }[newStatus];
        onRecordUpdate(student.id, newRecord);
    };

    const handleTimeChange = (field, value) => {
        // Update a specific time field while preserving the rest of the record.
        onRecordUpdate(student.id, { ...attendanceRecord, [field]: value });
    };

    // CHANGE 3: The component now returns a React Fragment to wrap the main row and the conditional time input row.
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

            {/* CHANGE 4: Conditionally rendered row for time inputs with animations. */}
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
                                            onChange={(e) => handleTimeChange('inTime', e.target.value)}
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
                                                onChange={(e) => handleTimeChange('inTime', e.target.value)}
                                                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm w-32"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`out-time-${student.id}`} className="text-sm font-medium text-slate-500 dark:text-slate-400">Out Time:</label>
                                            <input
                                                type="time"
                                                id={`out-time-${student.id}`}
                                                value={outTime}
                                                onChange={(e) => handleTimeChange('outTime', e.target.value)}
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
};

export default StudentRow;