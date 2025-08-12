'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, PlusCircle, User, Calendar } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

// --- Config & Helpers ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const formatCurrency = (value) => `₹ ${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const monthName = (m) => new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });

// --- MODAL 1: For updating BASE Salary ---
const BaseSalaryModal = ({ isOpen, employee, onSave, onCancel }) => {
  const [salary, setSalary] = useState('');
  useEffect(() => { if (employee) setSalary(employee.salary ?? ''); }, [employee, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e) => { e.preventDefault(); onSave(employee.firebase_uid, salary); };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-1">Update Base Salary</h2>
          <p className="text-sm text-slate-500 mb-4">For {employee?.name}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="salary" className="text-xs text-slate-500">New Base Salary Amount (per month)</label>
              <input id="salary" name="salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Base Salary</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MODAL 2: For updating MONTHLY Salary ---
const MonthlySalaryModal = ({ isOpen, record, onSave, onCancel }) => {
  const [form, setForm] = useState({ amount_paid: 0, status: 'pending', notes: '' });
  useEffect(() => { if (record) setForm({ amount_paid: record.amount_paid ?? 0, status: record.status ?? 'pending', notes: record.notes ?? '' }); }, [record, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const isPaidInFull = parseFloat(form.amount_paid) >= parseFloat(record.amount_due);
    if (form.status === 'complete' && !isPaidInFull) {
      if (!window.confirm("The amount paid is less than the amount due. Are you sure you want to mark this as complete?")) {
        return;
      }
    }
    onSave(record.id, form);
  };
  return (
     <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-1">Update Monthly Payment</h2>
          <p className="text-sm text-slate-500 mb-4">For {record?.employee_name} ({monthName(record?.period_month)} {record?.period_year})</p>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label className="text-xs text-slate-500">Amount Due</label>
              <p className="font-bold text-lg">{formatCurrency(record.amount_due)}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Amount Paid (₹)</label>
              <input type="number" value={form.amount_paid} onChange={(e) => setForm(f => ({ ...f, amount_paid: e.target.value }))} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border"/>
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border">
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </select>
            </div>
             <div>
                <label className="text-xs text-slate-500">Notes</label>
                <input type="text" value={form.notes || ''} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border"/>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Changes</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main Page Component ---
function PayrollManagementPage() {
  const [activeTab, setActiveTab] = useState('baseSalary'); // 'baseSalary' or 'monthlyPayroll'

  const [employees, setEmployees] = useState([]);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState('');
  const [isBaseSalaryModalOpen, setIsBaseSalaryModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [monthlyError, setMonthlyError] = useState('');
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [editingMonthlyRecord, setEditingMonthlyRecord] = useState(null);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchData = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    setIsEmployeeLoading(true);
    axios.get(`${API_URL}/api/members`, { headers })
      .then(res => setEmployees(res.data.filter(emp => emp.employee_type === 1) || []))
      .catch(e => setEmployeeError(e?.response?.data?.error || 'Failed to load employees.'))
      .finally(() => setIsEmployeeLoading(false));

    setIsMonthlyLoading(true);
    axios.get(`${API_URL}/api/members/salaries`, { headers })
      .then(res => setMonthlyRecords(res.data || []))
      .catch(e => setMonthlyError(e?.response?.data?.error || 'Failed to load monthly records.'))
      .finally(() => setIsMonthlyLoading(false));
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => { if (user) fetchData(); });
    return () => unsubscribe();
  }, []);

  const handleUpdateBaseSalary = async (uid, salary) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.put(`${API_URL}/api/members/${uid}/salary`, { salary }, { headers: { Authorization: `Bearer ${token}` } });
      setIsBaseSalaryModalOpen(false);
      fetchData();
    } catch (e) { alert(e?.response?.data?.error || 'Failed to update base salary.'); }
  };

  const handleGenerate = async (month, year) => {
    if (!window.confirm(`Generate/update salary records for ${monthName(month)}, ${year}?`)) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`${API_URL}/api/members/salaries/generate`, { month, year }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      fetchData();
    } catch (e) { alert(e?.response?.data?.error || 'Failed to generate salaries.'); }
  };

  const handleUpdateMonthlyRecord = async (id, formData) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.put(`${API_URL}/api/members/salaries/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setIsMonthlyModalOpen(false);
      fetchData();
    } catch (e) { alert(e?.response?.data?.error || 'Failed to save record.'); }
  };
  
  const tabConfig = {
      baseSalary: { label: 'Base Salaries', icon: User },
      monthlyPayroll: { label: 'Monthly Payroll', icon: Calendar },
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8  text-slate-900 ">
      <BaseSalaryModal isOpen={isBaseSalaryModalOpen} employee={editingEmployee} onSave={handleUpdateBaseSalary} onCancel={() => setIsBaseSalaryModalOpen(false)} />
      <MonthlySalaryModal isOpen={isMonthlyModalOpen} record={editingMonthlyRecord} onSave={handleUpdateMonthlyRecord} onCancel={() => setIsMonthlyModalOpen(false)} />

      <div className="max-w-7xl mx-auto isolate space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">Payroll Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage base salaries and process monthly payroll.</p>
        </header>

        {/* --- Tab Buttons --- */}
        <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {Object.entries(tabConfig).map(([key, {label, icon: Icon}]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`${ activeTab === key
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <Icon className="mr-2 h-5 w-5"/> {label}
                    </button>
                ))}
            </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* --- Conditional Rendering Based on Active Tab --- */}
            {activeTab === 'baseSalary' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4">Employee Base Salaries</h2>
                {isEmployeeLoading ? <p className="text-center p-4">Loading...</p> : employeeError ? <p className="text-center p-4 text-red-500">{employeeError}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="border-b"><th className="p-3 text-xs uppercase">Employee Name</th><th className="p-3 text-xs uppercase">Base Salary</th><th className="p-3 text-xs uppercase text-right">Actions</th></tr></thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr key={emp.firebase_uid} className="border-b border-slate-100">
                            <td className="p-3 text-sm">{emp.name}</td>
                            <td className="p-3 text-sm font-semibold">{formatCurrency(emp.salary)}</td>
                            <td className="p-3 text-sm text-right"><button onClick={() => { setEditingEmployee(emp); setIsBaseSalaryModalOpen(true);}} className="p-2 text-slate-500 hover:text-indigo-600"><Edit3 size={16} /></button></td>
                          </tr>
                        ))}
                        {employees.length === 0 && (<tr><td className="p-4 text-center" colSpan={3}>No in-house employees found.</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'monthlyPayroll' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Monthly Payroll</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border rounded-lg mb-6 flex flex-wrap items-center gap-4">
                  <div className="flex-grow"><h3 className="font-semibold">Payroll Generator</h3><p className="text-sm text-slate-500">Create or update payslips for a month.</p></div>
                  <div className="flex items-center gap-2">
                    <select value={month} onChange={e => setMonth(e.target.value)} className="p-2 rounded-lg bg-white dark:bg-slate-700 border">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{monthName(m)}</option>))}
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)} className="p-2 rounded-lg bg-white dark:bg-slate-700 border">
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                  </div>
                  <button onClick={() => handleGenerate(month, year)} className="flex items-center px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><PlusCircle size={16} className="mr-2" />Generate</button>
                </div>
                {isMonthlyLoading ? <p className="text-center p-4">Loading...</p> : monthlyError ? <p className="text-center p-4 text-red-500">{monthlyError}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="border-b"><th className="p-3 text-xs uppercase">Employee</th><th className="p-3 text-xs uppercase">Period</th><th className="p-3 text-xs uppercase">Due</th><th className="p-3 text-xs uppercase">Paid</th><th className="p-3 text-xs uppercase">Remaining</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3 text-xs uppercase text-right">Actions</th></tr></thead>
                      <tbody>
                        {monthlyRecords.map((rec) => {
                          const remaining = Number(rec.amount_due ?? 0) - Number(rec.amount_paid ?? 0);
                          return (
                            <tr key={rec.id} className="border-b border-slate-100">
                              <td className="p-3 text-sm">{rec.employee_name}</td>
                              <td className="p-3 text-sm">{monthName(rec.period_month)} {rec.period_year}</td>
                              <td className="p-3 text-sm font-semibold">{formatCurrency(rec.amount_due)}</td>
                              <td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(rec.amount_paid)}</td>
                              <td className={`p-3 text-sm font-semibold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCurrency(remaining)}</td>
                              <td className="p-3 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${rec.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{rec.status}</span></td>
                              <td className="p-3 text-sm text-right"><button onClick={() => { setEditingMonthlyRecord(rec); setIsMonthlyModalOpen(true); }} className="p-2 text-slate-500 hover:text-indigo-600"><Edit3 size={16} /></button></td>
                            </tr>
                          );
                        })}
                        {monthlyRecords.length === 0 && (<tr><td className="p-4 text-center" colSpan={7}>No payroll records found. Try generating records.</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PayrollManagementPage;













//'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Edit3, PlusCircle, User, Calendar, ChevronDown } from 'lucide-react';
// import { getAuth } from 'firebase/auth';
// import axios from 'axios';

// // --- Config & Helpers ---
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// const formatCurrency = (value) => `₹ ${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
// const monthName = (m) => new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });

// // --- MODALS (Unchanged from before) ---
// const BaseSalaryModal = ({ isOpen, employee, onSave, onCancel }) => { /* ... No changes here ... */ };
// const MonthlySalaryModal = ({ isOpen, record, onSave, onCancel }) => { /* ... No changes here ... */ };

// // --- Main Page Component ---
// function PayrollManagementPage() {
//   const [activeTab, setActiveTab] = useState('monthlyPayroll'); // Default to the most important tab

//   const [employees, setEmployees] = useState([]);
//   const [isEmployeeLoading, setIsEmployeeLoading] = useState(true);
//   const [employeeError, setEmployeeError] = useState('');
//   const [isBaseSalaryModalOpen, setIsBaseSalaryModalOpen] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState(null);

//   const [monthlyRecords, setMonthlyRecords] = useState([]);
//   const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
//   const [monthlyError, setMonthlyError] = useState('');
//   const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
//   const [editingMonthlyRecord, setEditingMonthlyRecord] = useState(null);

//   // --- NEW: State for expanding rows ---
//   const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

//   const fetchData = async () => { /* ... No changes here ... */ };
//   useEffect(() => { /* ... No changes here ... */ }, []);
//   const handleUpdateBaseSalary = async (uid, salary) => { /* ... No changes here ... */ };
//   const handleGenerate = async (month, year) => { /* ... No changes here ... */ };
//   const handleUpdateMonthlyRecord = async (id, formData) => { /* ... No changes here ... */ };

//   // --- NEW: Data Transformation for the Smart Report ---
//   const groupedMonthlyRecords = useMemo(() => {
//     if (!monthlyRecords.length) return [];
//     // The 'reduce' function groups the flat array into an object where keys are employee UIDs
//     const grouped = monthlyRecords.reduce((acc, record) => {
//       // If we haven't seen this employee yet, initialize them
//       if (!acc[record.firebase_uid]) {
//         acc[record.firebase_uid] = {
//           employee_name: record.employee_name,
//           firebase_uid: record.firebase_uid,
//           total_due: 0,
//           pending_months: 0,
//           records: []
//         };
//       }
      
//       // Add this record to the employee's list
//       acc[record.firebase_uid].records.push(record);
      
//       // If this record is pending, add to their totals
//       if (record.status === 'pending') {
//         const remaining = Number(record.amount_due ?? 0) - Number(record.amount_paid ?? 0);
//         if (remaining > 0) {
//             acc[record.firebase_uid].total_due += remaining;
//             acc[record.firebase_uid].pending_months += 1;
//         }
//       }
//       return acc;
//     }, {});
//     // Convert the object back to an array and sort by who is owed the most
//     return Object.values(grouped).sort((a, b) => b.total_due - a.total_due);
//   }, [monthlyRecords]);

  
//   const tabConfig = {
//       baseSalary: { label: 'Base Salaries', icon: User },
//       monthlyPayroll: { label: 'Monthly Payroll', icon: Calendar },
//   };

//   const currentYear = new Date().getFullYear();
//   const [year, setYear] = useState(currentYear);
//   const [month, setMonth] = useState(new Date().getMonth() + 1);

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900/95 text-slate-900 dark:text-slate-50">
//       <BaseSalaryModal isOpen={isBaseSalaryModalOpen} employee={editingEmployee} onSave={handleUpdateBaseSalary} onCancel={() => setIsBaseSalaryModalOpen(false)} />
//       <MonthlySalaryModal isOpen={isMonthlyModalOpen} record={editingMonthlyRecord} onSave={handleUpdateMonthlyRecord} onCancel={() => setIsMonthlyModalOpen(false)} />

//       <div className="max-w-7xl mx-auto isolate space-y-8">
//         <header>
//           <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">Payroll Management</h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage base salaries and process monthly payroll.</p>
//         </header>

//         <div className="border-b border-slate-200 dark:border-slate-700">
//             <nav className="-mb-px flex space-x-6" aria-label="Tabs">{Object.entries(tabConfig).map(([key, {label, icon: Icon}]) => (<button key={key} onClick={() => setActiveTab(key)} className={`${ activeTab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}><Icon className="mr-2 h-5 w-5"/> {label}</button>))}
//             </nav>
//         </div>

//         <AnimatePresence mode="wait">
//           <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
//             {activeTab === 'baseSalary' && (
//               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border">
//                 {/* ... Base Salary Table (no changes) ... */}
//               </div>
//             )}

//             {activeTab === 'monthlyPayroll' && (
//               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
//                 <div className="p-6">
//                     <h2 className="text-xl font-bold mb-4">Monthly Payroll</h2>
//                     {/* --- Generator UI (no changes) --- */}
//                     <div className="p-4 bg-slate-50 ...">
//                         {/* ... Generator ... */}
//                     </div>
//                 </div>
//                 {isMonthlyLoading ? <p className="text-center p-4">Loading...</p> : monthlyError ? <p className="text-center p-4 text-red-500">{monthlyError}</p> : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                       {/* --- NEW: Smart Report Header --- */}
//                       <thead><tr className="border-b border-t"><th className="p-3 text-xs uppercase">Employee</th><th className="p-3 text-xs uppercase">Total Due</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3 text-xs uppercase text-right">Actions</th></tr></thead>
                      
//                       <tbody>
//                         {/* --- NEW: Smart Report Body (Grouped by Employee) --- */}
//                         {groupedMonthlyRecords.map((group) => {
//                           const isExpanded = expandedEmployeeId === group.firebase_uid;
//                           return (
//                             <React.Fragment key={group.firebase_uid}>
//                               {/* --- Summary Row --- */}
//                               <tr className="border-b border-slate-100 bg-white dark:bg-slate-800">
//                                 <td className="p-3 text-sm font-semibold">{group.employee_name}</td>
//                                 <td className="p-3 text-sm font-bold text-red-600">{formatCurrency(group.total_due)}</td>
//                                 <td className="p-3 text-sm">
//                                   {group.pending_months > 0 ? (
//                                     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{group.pending_months} Month(s) Overdue</span>
//                                   ) : (
//                                     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">All Paid Up</span>
//                                   )}
//                                 </td>
//                                 <td className="p-3 text-sm text-right">
//                                   <button onClick={() => setExpandedEmployeeId(isExpanded ? null : group.firebase_uid)} 
//                                     className="p-2 flex items-center text-slate-500 hover:text-indigo-600">
//                                     Details <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
//                                   </button>
//                                 </td>
//                               </tr>
                              
//                               {/* --- NEW: Expanded Detail Rows --- */}
//                               {isExpanded && (
//                                   <tr className="bg-slate-50 dark:bg-slate-900/50">
//                                     <td colSpan={4} className="p-0">
//                                         <div className="p-4 space-y-2">
//                                             {group.records.map(rec => {
//                                                 const remaining = Number(rec.amount_due ?? 0) - Number(rec.amount_paid ?? 0);
//                                                 return (
//                                                     <div key={rec.id} className="grid grid-cols-5 gap-4 items-center">
//                                                         <div className="font-semibold">{monthName(rec.period_month)} {rec.period_year}</div>
//                                                         <div>Due: {formatCurrency(rec.amount_due)}</div>
//                                                         <div className="text-green-600">Paid: {formatCurrency(rec.amount_paid)}</div>
//                                                         <div className={remaining > 0 ? 'text-red-600 font-bold' : ''}>Rem: {formatCurrency(remaining)}</div>
//                                                         <div className="text-right">
//                                                             <button onClick={() => { setEditingMonthlyRecord(rec); setIsMonthlyModalOpen(true); }} className="p-2 text-slate-500 hover:text-indigo-600"><Edit3 size={16} /></button>
//                                                         </div>
//                                                     </div>
//                                                 )
//                                             })}
//                                         </div>
//                                     </td>
//                                   </tr>
//                               )}
//                             </React.Fragment>
//                           )
//                         })}
//                         {monthlyRecords.length === 0 && (<tr><td className="p-4 text-center" colSpan={4}>No payroll records found. Try generating records.</td></tr>)}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// export default PayrollManagementPage;