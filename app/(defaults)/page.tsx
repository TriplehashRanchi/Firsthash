import { Metadata } from 'next';
import React from 'react';
import AdminDashboard from './admin/dashboard/page';

export const metadata: Metadata = {
    title: ' Admin',
};

const Sales = () => {
    return <AdminDashboard />;
};

export default Sales;
