import { Metadata } from 'next';
import React from 'react';

import EmployeeDashboardPage from './dashboard/page';

export const metadata: Metadata = {
    title: ' Employee',
};

const Employee = () => {
    return <EmployeeDashboardPage />;
};

export default Employee;
