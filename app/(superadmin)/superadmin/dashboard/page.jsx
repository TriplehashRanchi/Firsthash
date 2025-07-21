// app/(superadmin)/superadmin/dashboard/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ plans: 0, coupons: 0, admins: 0 });

  useEffect(() => {
    // TODO: Call backend endpoints to get real data
    setStats({ plans: 3, coupons: 5, admins: 27 });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, Super Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-gray-600 text-sm">Total Plans</h2>
          <p className="text-3xl font-bold">{stats.plans}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-gray-600 text-sm">Active Coupons</h2>
          <p className="text-3xl font-bold">{stats.coupons}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-gray-600 text-sm">Registered Admins</h2>
          <p className="text-3xl font-bold">{stats.admins}</p>
        </div>
      </div>
    </div>
  );
}
