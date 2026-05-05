// components/attandance-comp/HistoryDayDetailModal.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isEqual } from 'date-fns';
import { MapPin } from 'lucide-react';

// CORRECTED: Import from the same directory
import StatusBadge from './StatusBadge';

const getRecordTime = (record, key) => record?.[key] || record?.[key === 'inTime' ? 'in_time' : 'out_time'] || '';

const timeToSeconds = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return null;

    const [hours, minutes] = timeValue.slice(0, 5).split(':').map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    return (hours * 3600) + (minutes * 60);
};

const formatWorkedHours = (record) => {
    const inSeconds = timeToSeconds(getRecordTime(record, 'inTime'));
    const outSeconds = timeToSeconds(getRecordTime(record, 'outTime'));

    if (inSeconds === null || outSeconds === null || outSeconds <= inSeconds) return '';

    const totalSeconds = outSeconds - inSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const getMapUrl = (record) => {
    if (record?.latitude == null || record?.longitude == null) return '';
    return `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;
};

// ... (rest of the component code is unchanged) ...
const HistoryDayDetailModal = ({ date, history, students, onClose }) => {
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    if (!date) return null;

    const record = history.find(h => isEqual(new Date(h.date), date));

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
                                        const workedHours = formatWorkedHours(r);
                                        const mapUrl = getMapUrl(r);
                                        return (
                                            <li key={r.studentId} className="py-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{student?.name || 'Unknown'}</span>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {workedHours ? <span>Worked {workedHours}</span> : null}
                                                        {mapUrl ? (
                                                            <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                View on Map
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {r.location_status === 'outside_radius' ? (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                            Outside radius
                                                        </span>
                                                    ) : null}
                                                    <StatusBadge status={r.status} />
                                                </div>
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
