// // components/attandance-comp/AttendanceDashboard.jsx
// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ClipboardList, History } from 'lucide-react';

// // CORRECTED: Components are in the same directory, so use './'
// import TakeAttendanceTab from './TakeAttendanceTab';
// import ViewHistoryTab from './ViewHistoryTab';
// import HistoryDayDetailModal from './HistoryDayDetailModal';

// // ... (rest of the component code is unchanged) ...
// const AttendanceDashboard = ({ students, initialHistory }) => {
//     const [activeTab, setActiveTab] = useState('take-attendance');
//     const [attendance, setAttendance] = useState(() => new Map(students.map(s => [s.id, 'unmarked'])));
//     const [isSaving, setIsSaving] = useState(false);
    
//     // History-related states are now here
//     const [history, setHistory] = useState(initialHistory);
//     const [viewingDay, setViewingDay] = useState(null);

//     const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

//     // Derived Stats
//     const stats = useMemo(() => {
//         const marked = Array.from(attendance.values());
//         return {
//             total: students.length,
//             present: marked.filter(s => s === 'present').length,
//             late: marked.filter(s => s === 'late').length,
//             absent: marked.filter(s => s === 'absent').length,
//         };
//     }, [attendance, students.length]);

//     // --- Handlers ---
//     const handleStatusChange = (studentId, status) => setAttendance(prev => new Map(prev).set(studentId, status));
//     const handleMarkAllPresent = () => setAttendance(new Map(students.map(s => [s.id, 'present'])));
//     const handleClearAll = () => setAttendance(new Map(students.map(s => [s.id, 'unmarked'])));
    
//     const handleSave = () => {
//         setIsSaving(true);
//         console.log("Saving Attendance...");
//         console.log(Object.fromEntries(attendance));
//         setTimeout(() => {
//             setIsSaving(false);
//             alert("Attendance saved! Check console.");
//         }, 1500);
//     };

//     // --- Styles ---
//     const tabBtn = "flex-1 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2";
//     const activeTabBtn = "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm rounded-md";
//     const inactiveTabBtn = "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md";

//     return (
//         <div className="space-y-8">
//             <div className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6">
//                 <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex space-x-1 mb-6">
//                     <button onClick={() => setActiveTab('take-attendance')} className={`${tabBtn} ${activeTab === 'take-attendance' ? activeTabBtn : inactiveTabBtn}`}><ClipboardList size={16} />Take Attendance</button>
//                     <button onClick={() => setActiveTab('view-history')} className={`${tabBtn} ${activeTab === 'view-history' ? activeTabBtn : inactiveTabBtn}`}><History size={16} />View History</button>
//                 </div>

//                 <AnimatePresence mode="wait">
//                     {activeTab === 'take-attendance' && (
//                         <TakeAttendanceTab
//                             key="take"
//                             stats={stats}
//                             students={students}
//                             attendance={attendance}
//                             isSaving={isSaving}
//                             onStatusChange={handleStatusChange}
//                             onMarkAllPresent={handleMarkAllPresent}
//                             onClearAll={handleClearAll}
//                             onSave={handleSave}
//                         />
//                     )}

//                     {activeTab === 'view-history' && (
//                         <ViewHistoryTab
//                             key="history"
//                             history={history}
//                             students={students}
//                             studentMap={studentMap}
//                             onDayClick={setViewingDay}
//                         />
//                     )}
//                 </AnimatePresence>
//             </div>
//             <HistoryDayDetailModal date={viewingDay} history={history} students={students} onClose={() => setViewingDay(null)} />
//         </div>
//     );
// };

// export default AttendanceDashboard;

















// components/attandance-comp/AttendanceDashboard.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, History } from 'lucide-react';
import TakeAttendanceTab from './TakeAttendanceTab';
import ViewHistoryTab from './ViewHistoryTab';
import HistoryDayDetailModal from './HistoryDayDetailModal';

const AttendanceDashboard = ({ students, initialHistory }) => {
    const [activeTab, setActiveTab] = useState('take-attendance');
    
    // CHANGE 1: The state now holds a detailed object for each student.
    const [attendance, setAttendance] = useState(() => new Map(
        students.map(s => [s.id, { status: 'unmarked', inTime: '', outTime: '' }])
    ));
    
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState(initialHistory);
    const [viewingDay, setViewingDay] = useState(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    // CHANGE 2: Stats calculation now looks inside the record object.
    const stats = useMemo(() => {
        const markedRecords = Array.from(attendance.values());
        return {
            total: students.length,
            present: markedRecords.filter(r => r.status === 'present').length,
            late: markedRecords.filter(r => r.status === 'late').length,
            absent: markedRecords.filter(r => r.status === 'absent').length,
        };
    }, [attendance, students.length]);

    // CHANGE 3: A new handler to update the entire record object.
    const handleRecordUpdate = (studentId, newRecord) => {
        setAttendance(prev => new Map(prev).set(studentId, newRecord));
    };

    // CHANGE 4: Quick actions now create full record objects.
    const handleMarkAllPresent = () => {
        const newAttendance = new Map();
        students.forEach(student => {
            newAttendance.set(student.id, { status: 'present', inTime: '09:00', outTime: '17:00' });
        });
        setAttendance(newAttendance);
    };

    const handleClearAll = () => {
        const newAttendance = new Map();
        students.forEach(student => {
            newAttendance.set(student.id, { status: 'unmarked', inTime: '', outTime: '' });
        });
        setAttendance(newAttendance);
    };
    
    const handleSave = () => {
        setIsSaving(true);
        console.log("Saving Attendance (with time details):");
        console.log(Object.fromEntries(attendance));
        setTimeout(() => {
            setIsSaving(false);
            alert("Attendance saved! Check console for detailed records.");
        }, 1500);
    };

    const tabBtn = "flex-1 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2";
    const activeTabBtn = "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm rounded-md";
    const inactiveTabBtn = "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md";

    return (
        <div className="space-y-8">
            <div className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6">
                <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex space-x-1 mb-6">
                    <button onClick={() => setActiveTab('take-attendance')} className={`${tabBtn} ${activeTab === 'take-attendance' ? activeTabBtn : inactiveTabBtn}`}><ClipboardList size={16} />Take Attendance</button>
                    <button onClick={() => setActiveTab('view-history')} className={`${tabBtn} ${activeTab === 'view-history' ? activeTabBtn : inactiveTabBtn}`}><History size={16} />View History</button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'take-attendance' && (
                        // CHANGE 5: Pass down the new props.
                        <TakeAttendanceTab
                            key="take"
                            stats={stats}
                            students={students}
                            attendanceMap={attendance} 
                            isSaving={isSaving}
                            onRecordUpdate={handleRecordUpdate}
                            onMarkAllPresent={handleMarkAllPresent}
                            onClearAll={handleClearAll}
                            onSave={handleSave}
                        />
                    )}

                    {activeTab === 'view-history' && (
                        <ViewHistoryTab
                            key="history"
                            history={history}
                            students={students}
                            studentMap={studentMap}
                            onDayClick={setViewingDay}
                        />
                    )}
                </AnimatePresence>
            </div>
            <HistoryDayDetailModal date={viewingDay} history={history} students={students} onClose={() => setViewingDay(null)} />
        </div>
    );
};

export default AttendanceDashboard;