'use client';

import React from 'react';
import SelfManualAttendanceCardBase from './SelfManualAttendanceCardBase';

export default function ManagerManualAttendanceCard(props) {
  return (
    <SelfManualAttendanceCardBase
      {...props}
      title="Manager manual attendance"
      subtitle="Use this only when today’s manager attendance was not captured automatically. The backend accepts only today and locks the mark sequence."
      badgeLabel="Manager self service"
      accentClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      buttonClass="bg-emerald-600 hover:bg-emerald-700"
    />
  );
}
