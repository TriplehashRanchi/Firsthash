'use client';

import React from 'react';
import SelfManualAttendanceCardBase from './SelfManualAttendanceCardBase';

export default function EmployeeManualAttendanceCard(props) {
  return (
    <SelfManualAttendanceCardBase
      {...props}
      title="Employee attendance"
      subtitle="If your normal attendance action was missed today, you can submit your own clock-in and clock-out once for the current date."
      badgeLabel="Employee self service"
      accentClass="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      buttonClass="bg-blue-600 hover:bg-blue-700"
    />
  );
}
