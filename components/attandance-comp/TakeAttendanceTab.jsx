// // components/attandance-comp/TakeAttendanceTab.jsx
// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Users, UserCheck, UserX, Clock, Check, Trash2, Loader2 } from 'lucide-react';

// // CORRECTED: Imports from the same directory
// import StatCard from './StatCard';
// import StudentRow from './StudentRow';

// // ... (rest of the component code is unchanged) ...
// const TakeAttendanceTab = ({
//   stats, students, attendance, isSaving,
//   onStatusChange, onMarkAllPresent, onClearAll, onSave
// }) => {
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard title="Total Students" value={stats.total} Icon={Users} color={{bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400'}} details={`${students.length} students in class`} />
//         <StatCard title="Present Today" value={stats.present} Icon={UserCheck} color={{bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400'}} details={`${Math.round((stats.present / stats.total) * 100 || 0)}% attendance`} />
//         <StatCard title="Late Today" value={stats.late} Icon={Clock} color={{bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400'}} details={`${stats.late} marked as late`} />
//         <StatCard title="Absent Today" value={stats.absent} Icon={UserX} color={{bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400'}} details={`${stats.absent} marked as absent`} />
//       </div>

//       <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between mb-4">
//         <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Quick Actions:</p>
//         <div className="flex gap-2">
//           <button onClick={onMarkAllPresent} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-md flex items-center gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/50 border border-slate-300 dark:border-slate-600"><Check size={14} className="text-green-500"/> Mark All Present</button>
//           <button onClick={onClearAll} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-md flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/50 border border-slate-300 dark:border-slate-600"><Trash2 size={14} className="text-red-500"/> Clear All</button>
//         </div>
//       </div>
//       <div className="overflow-hidden border border-slate-200 dark:border-slate-700/50 rounded-lg">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase"><tr><th className="p-4 font-semibold text-left">Student</th><th className="p-4 font-semibold text-right">Status</th></tr></thead>
//           <tbody><AnimatePresence>{students.map(s => <StudentRow key={s.id} student={s} status={attendance.get(s.id) || 'unmarked'} onStatusChange={onStatusChange} />)}</AnimatePresence></tbody>
//         </table>
//         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
//           <button onClick={onSave} disabled={isSaving} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105 flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed">
//             {isSaving && <Loader2 className="animate-spin h-5 w-5"/>}
//             {isSaving ? 'Saving...' : 'Save Attendance'}
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default TakeAttendanceTab;













// components/attandance-comp/TakeAttendanceTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, Check, Trash2, Loader2 } from 'lucide-react';
import StatCard from './StatCard';
import StudentRow from './StudentRow';

// CHANGE 1: The props received from the parent are now different.
const TakeAttendanceTab = ({
  stats, students, attendanceMap, isSaving,
  onRecordUpdate, onMarkAllPresent, onClearAll, onSave
}) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Stats Section (no changes here) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.total} Icon={Users} color={{bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400'}} details={`${students.length} students in class`} />
        <StatCard title="Present Today" value={stats.present} Icon={UserCheck} color={{bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400'}} details={`${Math.round((stats.present / stats.total) * 100 || 0)}% attendance`} />
        <StatCard title="Late Today" value={stats.late} Icon={Clock} color={{bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400'}} details={`${stats.late} marked as late`} />
        <StatCard title="Absent Today" value={stats.absent} Icon={UserX} color={{bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400'}} details={`${stats.absent} marked as absent`} />
      </div>

      {/* Quick Actions (no changes here) */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Quick Actions:</p>
        <div className="flex gap-2">
          <button onClick={onMarkAllPresent} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-md flex items-center gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/50 border border-slate-300 dark:border-slate-600"><Check size={14} className="text-green-500"/> Mark All Present</button>
          <button onClick={onClearAll} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-md flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/50 border border-slate-300 dark:border-slate-600"><Trash2 size={14} className="text-red-500"/> Clear All</button>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 dark:border-slate-700/50 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase"><tr><th className="p-4 font-semibold text-left">Student</th><th className="p-4 font-semibold text-right">Status</th></tr></thead>
          <tbody>
            <AnimatePresence>
                {/* CHANGE 2: Pass the detailed record object and new handler to each row. */}
                {students.map(student => (
                    <StudentRow
                        key={student.id}
                        student={student}
                        attendanceRecord={attendanceMap.get(student.id) || { status: 'unmarked', inTime: '', outTime: '' }}
                        onRecordUpdate={onRecordUpdate}
                    />
                ))}
            </AnimatePresence>
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button onClick={onSave} disabled={isSaving} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-105 flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {isSaving && <Loader2 className="animate-spin h-5 w-5"/>}
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TakeAttendanceTab;