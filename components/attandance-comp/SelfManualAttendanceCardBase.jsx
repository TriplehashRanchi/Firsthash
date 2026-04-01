'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { CalendarDays, Clock3, LogIn, LogOut, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const toInputTime = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') {
    return '';
  }

  return timeValue.slice(0, 5);
};

const toSeconds = (timeValue) => {
  if (!timeValue) {
    return null;
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  return (hours * 3600) + (minutes * 60);
};

export default function SelfManualAttendanceCardBase({
  title,
  subtitle,
  accentClass,
  buttonClass,
  badgeLabel,
  todayRecord,
  onRecordSaved,
}) {
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [submittingType, setSubmittingType] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    setInTime(toInputTime(todayRecord?.in_time));
    setOutTime(toInputTime(todayRecord?.out_time));
  }, [todayRecord]);

  const hasInTime = Boolean(todayRecord?.in_time);
  const hasOutTime = Boolean(todayRecord?.out_time);

  const statusLabel = useMemo(() => {
    if (hasInTime && hasOutTime) {
      return 'Today complete';
    }

    if (hasInTime) {
      return 'Clocked in';
    }

    return 'Not marked yet';
  }, [hasInTime, hasOutTime]);

  const submitManualMark = async (markType) => {
    setFeedback({ type: '', message: '' });

    const selectedTime = markType === 'in_time' ? inTime : outTime;
    if (!selectedTime) {
      setFeedback({ type: 'error', message: `Select a ${markType === 'in_time' ? 'clock-in' : 'clock-out'} time first.` });
      return;
    }

    if (markType === 'out_time' && toSeconds(selectedTime) <= toSeconds(toInputTime(todayRecord?.in_time))) {
      setFeedback({ type: 'error', message: 'Clock-out must be later than today clock-in.' });
      return;
    }

    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      setFeedback({ type: 'error', message: 'You must be logged in to mark attendance.' });
      return;
    }

    setSubmittingType(markType);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/api/self/attendance/manual`,
        { mark_type: markType, time: selectedTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback({
        type: 'success',
        message: response.data?.message || 'Attendance updated successfully.',
      });

      if (typeof onRecordSaved === 'function') {
        onRecordSaved(response.data?.record);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update attendance.',
      });
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${accentClass}`}>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              {badgeLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Today only
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-gray-100 px-3 py-2 font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              Status: {statusLabel}
            </span>
            <span className="rounded-lg bg-gray-100 px-3 py-2 font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              In: {todayRecord?.in_time || 'Not marked'}
            </span>
            <span className="rounded-lg bg-gray-100 px-3 py-2 font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              Out: {todayRecord?.out_time || 'Not marked'}
            </span>
          </div>
        </div>

        <div className="grid w-full gap-4 lg:max-w-xl lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
              <LogIn className="mr-2 h-4 w-4" />
              clock-in
            </label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                step="60"
                value={inTime}
                onChange={(event) => setInTime(event.target.value)}
                disabled={hasInTime || submittingType !== null}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <button
              type="button"
              onClick={() => submitManualMark('in_time')}
              disabled={hasInTime || !inTime || submittingType !== null}
              className={`mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${buttonClass}`}
            >
              {submittingType === 'in_time' ? 'Saving...' : hasInTime ? 'Clock-in added' : 'Save clock-in'}
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
              <LogOut className="mr-2 h-4 w-4" />
              clock-out
            </label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                step="60"
                value={outTime}
                onChange={(event) => setOutTime(event.target.value)}
                disabled={!hasInTime || hasOutTime || submittingType !== null}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <button
              type="button"
              onClick={() => submitManualMark('out_time')}
              disabled={!hasInTime || hasOutTime || !outTime || submittingType !== null}
              className={`mt-3 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${buttonClass}`}
            >
              {submittingType === 'out_time' ? 'Saving...' : hasOutTime ? 'Clock-out added' : 'Save clock-out'}
            </button>
          </div>
        </div>
      </div>

      {feedback.message ? (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Manual attendance is restricted to the current day. Previous dates cannot be edited from this screen.
      </p>
    </section>
  );
}
