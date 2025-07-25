// components/attandance-comp/AttendanceDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, History } from 'lucide-react';
import TakeAttendanceTab from './TakeAttendanceTab';
import ViewHistoryTab     from './ViewHistoryTab';
import HistoryDayDetailModal from './HistoryDayDetailModal';

export default function AttendanceDashboard({
  students,
  initialHistory,
  onSaveAttendance,
  onToggleStatus
}) {
  const [activeTab,  setActiveTab]  = useState('take-attendance');
  const [history,    setHistory]    = useState(initialHistory);
  const [viewingDay, setViewingDay] = useState(null);

  // sync parent-driven updates
  useEffect(() => setHistory(initialHistory), [initialHistory]);

  // build “today” record map
  const today = new Date().toISOString().slice(0,10);
  const initialTodayMap = useMemo(() => {
    const m = new Map(students.map(s => [s.id, {
      studentId: s.id,
      status:    'unmarked',
      inTime:    '',
      outTime:   ''
    }]));
    const todayRec = history.find(d => d.date === today);
    if (todayRec) {
      todayRec.records.forEach(r => m.set(r.studentId, { ...r }));
    }
    return m;
  }, [students, history]);

  const [attendanceMap, setAttendanceMap] = useState(initialTodayMap);
  useEffect(() => setAttendanceMap(initialTodayMap), [initialTodayMap]);

  // stats
  const stats = useMemo(() => {
    const recs = Array.from(attendanceMap.values());
    return {
      total:   students.length,
      present: recs.filter(r => r.status === 'present').length,
      late:    recs.filter(r => r.status === 'late').length,
      absent:  recs.filter(r => r.status === 'absent').length,
    };
  }, [attendanceMap, students.length]);

  // handlers for TakeAttendanceTab
  const handleRecordUpdate = (id, rec) => {
    setAttendanceMap(m => new Map(m).set(id, rec));
  };
  const handleMarkAllPresent = () => {
    const m = new Map();
    students.forEach(s => m.set(s.id, {
      studentId: s.id, status: 'present', inTime: '09:00', outTime: '17:00'
    }));
    setAttendanceMap(m);
  };
  const handleClearAll = () => {
    const m = new Map();
    students.forEach(s => m.set(s.id, {
      studentId: s.id, status: 'unmarked', inTime: '', outTime: ''
    }));
    setAttendanceMap(m);
  };
const handleSave = () => {
  // 1️⃣ build today's new day
  const records = Array.from(attendanceMap.values());
  const newDay  = { date: today, records };

  // 2️⃣ update local state immediately
  const newHistory = [newDay, ...history.filter(d => d.date !== today)];
  setHistory(newHistory);
  const newMap = new Map(records.map(r => [r.studentId, r]));
  setAttendanceMap(newMap);

  // 3️⃣ then persist to server
  onSaveAttendance(newHistory);
};



  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg">
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden mb-6">
          <button
            onClick={()=>setActiveTab('take-attendance')}
            className={`flex-1 py-2 flex justify-center gap-2 ${
              activeTab==='take-attendance'
                ? 'bg-white text-indigo-600'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <ClipboardList size={16}/> Take Attendance
          </button>
          <button
            onClick={()=>setActiveTab('view-history')}
            className={`flex-1 py-2 flex justify-center gap-2 ${
              activeTab==='view-history'
                ? 'bg-white text-indigo-600'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <History size={16}/> View History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab==='take-attendance' && (
            <TakeAttendanceTab
              key="take"
              stats={stats}
              students={students}
              attendanceMap={attendanceMap}
              onRecordUpdate={handleRecordUpdate}
              onMarkAllPresent={handleMarkAllPresent}
              onClearAll={handleClearAll}
              onSave={handleSave}
            />
          )}
          {activeTab==='view-history' && (
            <ViewHistoryTab
              key="history"
              history={history}
              students={students}
              onDayClick={setViewingDay}
              onToggleStatus={onToggleStatus}
            />
          )}
        </AnimatePresence>
      </div>

      <HistoryDayDetailModal
        date={viewingDay}
        history={history}
        students={students}
        onClose={()=>setViewingDay(null)}
      />
    </div>
  );
}
