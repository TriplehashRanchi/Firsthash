'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, PlusCircle, User, Calendar, Briefcase, Eye, X, Wallet, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { t } from 'i18next';

// --- Config & Helpers ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const formatCurrency = (value) => `₹ ${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const monthName = (m) => new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });
const getEmployeeType = (type) => {
    switch (Number(type)) {
        case 0:
            return 'Freelancer';
        case 1:
            return 'In-House';
        case 2:
            return 'Manager';
        default:
            return 'Unknown';
    }
};

const RoleTooltip = ({ roles }) => {
    const [position, setPosition] = useState('down');
    const tooltipRef = useRef(null);
    const wrapperRef = useRef(null);

    if (!roles || roles.length === 0) return <span className="text-slate-400 text-xs italic">No role assigned</span>;

    const roleList = Array.isArray(roles)
        ? roles.map((r) => r.role_name || r.type_name).filter(Boolean)
        : (() => {
              try {
                  const parsed = JSON.parse(roles);
                  return Array.isArray(parsed) ? parsed.map((r) => r.role_name || r.type_name).filter(Boolean) : [];
              } catch {
                  return [];
              }
          })();

    if (roleList.length === 0) return <span className="text-slate-400 text-xs italic">No role assigned</span>;

    const primaryRole = roleList[0];
    const extraCount = roleList.length - 1;

    // 🧭 Detect available space on hover
    useEffect(() => {
        const handleHover = () => {
            if (!wrapperRef.current || !tooltipRef.current) return;
            const rect = wrapperRef.current.getBoundingClientRect();
            const tooltipHeight = tooltipRef.current.offsetHeight;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // 🧠 Flip dynamically
            if (spaceBelow < tooltipHeight + 20 && spaceAbove > tooltipHeight) {
                setPosition('up');
            } else {
                setPosition('down');
            }
        };

        const wrapper = wrapperRef.current;
        wrapper?.addEventListener('mouseenter', handleHover);
        return () => wrapper?.removeEventListener('mouseenter', handleHover);
    }, []);

    return (
        <div ref={wrapperRef} className="relative group inline-block cursor-pointer select-none">
            {/* === Visible Role Summary === */}
            <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-2 py-0.5 rounded-md border border-indigo-200/30 dark:border-indigo-800/40 shadow-sm">
                    {primaryRole}
                </span>

                {extraCount > 0 && <span className="text-[11px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-1.5 py-[1px] rounded-full shadow-md font-semibold">+{extraCount}</span>}
            </div>

            {/* === Tooltip Popup === */}
            <div
                ref={tooltipRef}
                className={`
          absolute hidden group-hover:block z-50 w-max min-w-[130px] 
          rounded-xl border border-slate-200/60 dark:border-slate-700/60
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl
          ${position === 'up' ? 'bottom-full mb-2 origin-bottom animate-fadeUp' : 'top-full mt-2 origin-top animate-fadeDown'}
        `}
            >
                <div className="p-3">
                    <h4 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wide">Assigned Roles</h4>
                    <ul className="space-y-1.5">
                        {roleList.map((role, i) => (
                            <li key={i} className="flex items-center text-[13px] text-slate-700 dark:text-slate-200 gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                {role}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* === Animations === */}
            <style jsx>{`
                .animate-fadeDown {
                    animation: fadeDown 0.22s ease-out;
                }
                .animate-fadeUp {
                    animation: fadeUp 0.22s ease-out;
                }
                @keyframes fadeDown {
                    from {
                        opacity: 0;
                        transform: translateY(-6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

// --- MODAL 1: For updating BASE Salary ---
const BaseSalaryModal = ({ isOpen, employee, onSave, onCancel }) => {
    const [salary, setSalary] = useState('');
    useEffect(() => {
        if (employee) setSalary(employee.salary ?? '');
    }, [employee, isOpen]);
    if (!isOpen) return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(employee.firebase_uid, salary);
    };
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Update Base Salary / Rate</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        For {employee?.name} ({getEmployeeType(employee?.employee_type)})
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="salary" className="text-xs text-slate-500">
                                New Base Salary or Monthly Rate (₹)
                            </label>
                            <input
                                id="salary"
                                name="salary"
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                Save Base Salary
                            </button>
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
    useEffect(() => {
        if (record) setForm({ amount_paid: record.amount_paid ?? 0, status: record.status ?? 'pending', notes: record.notes ?? '' });
    }, [record, isOpen]);
    if (!isOpen) return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        const isPaidInFull = parseFloat(form.amount_paid) >= parseFloat(record.amount_due);
        if (form.status === 'complete' && !isPaidInFull) {
            if (!window.confirm('The amount paid is less than the amount due. Are you sure you want to mark this as complete?')) {
                return;
            }
        }
        onSave(record.id, form);
    };
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Update Monthly Payment</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        For {record?.employee_name} ({monthName(record?.period_month)} {record?.period_year})
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Amount Due</label>
                            <p className="font-bold text-lg">{formatCurrency(record.amount_due)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Amount Paid (₹)</label>
                            <input
                                type="number"
                                value={form.amount_paid}
                                onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))}
                                className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Status</label>
                            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border">
                                <option value="pending">Pending</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Notes</label>
                            <input
                                type="text"
                                value={form.notes || ''}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                placeholder="Optional notes..."
                                className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const AssignTaskModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [projectName, setProjectName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(freelancer.firebase_uid, { project_name: projectName });
        setProjectName('');
    };
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Assign New Task</h2>
                    <p className="text-sm text-slate-500 mb-4">To {freelancer?.name}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Task / Project Description</label>
                            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                                Assign Task
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
const BillTaskModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [unbilledTasks, setUnbilledTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [fee, setFee] = useState('');
    useEffect(() => {
        if (isOpen && freelancer) {
            const auth = getAuth();
            auth.currentUser.getIdToken().then((token) => {
                axios.get(`${API_URL}/api/members/freelancers/${freelancer.firebase_uid}/unbilled-tasks`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setUnbilledTasks(res.data));
            });
        }
    }, [isOpen, freelancer]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ task_id: selectedTaskId, fee });
        setSelectedTaskId('');
        setFee('');
    };
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
                <motion.div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold mb-4">Bill a Task for {freelancer?.name}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Select an Assigned Task</label>
                            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required>
                                <option value="" disabled>
                                    -- Select a task to bill --
                                </option>
                                {unbilledTasks.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Enter Fee for this Task (₹)</label>
                            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white" disabled={!selectedTaskId || !fee}>
                                Save & Bill
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- NEW MODAL 1: AssignFeeModal ---
const AssignFeeModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [unbilledTasks, setUnbilledTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [taskFee, setTaskFee] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && freelancer) {
            setIsLoading(true);
            const auth = getAuth();
            auth.currentUser.getIdToken().then((token) => {
                axios
                    .get(`${API_URL}/api/members/freelancers/${freelancer.firebase_uid}/unbilled-tasks`, { headers: { Authorization: `Bearer ${token}` } })
                    .then((res) => setUnbilledTasks(res.data))
                    .catch((err) => console.error('Failed to fetch unbilled tasks', err))
                    .finally(() => setIsLoading(false));
            });
        }
    }, [isOpen, freelancer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ task_id: selectedTaskId, task_fee: taskFee });
        setSelectedTaskId('');
        setTaskFee('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Bill a Task</h2>
                    <p className="text-sm text-slate-500 mb-4">For {freelancer?.name}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Select Task to Bill</label>
                            {isLoading ? (
                                <p>Loading tasks...</p>
                            ) : (
                                <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required>
                                    <option value="" disabled>
                                        -- Select an unbilled task --
                                    </option>
                                    {unbilledTasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.project_name} (Assigned: {new Date(task.assignment_date).toLocaleDateString()})
                                        </option>
                                    ))}
                                    {unbilledTasks.length === 0 && <option disabled>No unbilled tasks found</option>}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Enter Fee for this Task (₹)</label>
                            <input type="number" value={taskFee} onChange={(e) => setTaskFee(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white" disabled={!selectedTaskId || !taskFee}>
                                Save & Bill Task
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- NEW: FreelancerHistoryModal ---
// --- NEW MODAL 1: BillAssignmentModal ---
const BillAssignmentModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [unbilledAssignments, setUnbilledAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [fee, setFee] = useState('');
    useEffect(() => {
        if (isOpen && freelancer) {
            setSelectedAssignment('');
            setFee('');
            const auth = getAuth();
            auth.currentUser.getIdToken().then((token) => {
                axios.get(`${API_URL}/api/members/freelancers/${freelancer.firebase_uid}/unbilled-assignments`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
                    console.log(`[DEBUG] Unbilled assignments for ${freelancer.name}:`, res.data);
                    setUnbilledAssignments(res.data);
                });
            });
        }
    }, [isOpen, freelancer]);
    const handleSubmit = (e) => {
        e.preventDefault();
        const [type, id] = selectedAssignment.split('-');
        onSave({ freelancer_uid: freelancer.firebase_uid, assignment_type: type, assignment_id: id, fee });
    };
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
                <motion.div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold mb-4">Bill an Assignment for {freelancer?.name}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Select an Unbilled Assignment</label>
                            <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required>
                                <option value="" disabled>
                                    -- Select work to bill --
                                </option>
                                {unbilledAssignments.map((a) => (
                                    <option key={`${a.type}-${a.id}`} value={`${a.type}-${a.id}`}>
                                        {a.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Enter Fee for this Assignment (₹)</label>
                            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white" disabled={!selectedAssignment || !fee}>
                                Save & Bill
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- NEW MODAL 2: FreelancerHistoryModal ---
const FreelancerHistoryModal = ({ isOpen, freelancer, onClose }) => {
    const [history, setHistory] = useState({ billed_items: [], payments: [] });
    useEffect(() => {
        if (isOpen && freelancer) {
            const auth = getAuth();
            auth.currentUser.getIdToken().then((token) => {
                axios.get(`${API_URL}/api/members/freelancers/${freelancer.firebase_uid}/history`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
                    console.log(`[DEBUG] Financial history for ${freelancer.name}:`, res.data);
                    setHistory(res.data);
                });
            });
        }
    }, [isOpen, freelancer]);
    if (!isOpen) return null;
    const totalBilled = (history?.billed_items || []).reduce((sum, item) => sum + parseFloat(item.fee || 0), 0);
    const totalPaid = (history?.payments || []).reduce((sum, item) => sum + parseFloat(item.payment_amount || 0), 0);
    const balance = totalBilled - totalPaid;
    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Financial History: {freelancer?.name}</h2>
                        </div>
                        <button onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4 border-t border-b py-4">
                        <div>
                            <label className="text-xs text-slate-500">Total Billed</label>
                            <p className="font-bold text-lg">{formatCurrency(totalBilled)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Total Paid</label>
                            <p className="font-bold text-lg text-green-600">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Balance Due</label>
                            <p className={`font-bold text-lg ${balance > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCurrency(balance)}</p>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold mb-2">Billed Items</h3>
                            <div className="space-y-2">
                                {(history?.billed_items || []).map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="p-3 bg-slate-50 rounded-lg text-sm">
                                        <div className="flex justify-between font-medium">
                                            <span>{item.type === 'shoot' ? `${item.project_name} - ${item.service_name}` : item.project_name}</span>
                                            <span>{formatCurrency(item.fee)}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">Billed on: {new Date(item.billing_date).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Payment History</h3>
                            <div className="space-y-2">
                                {(history?.payments || []).map((payment) => (
                                    <div key={`payment-${payment.id}`} className="p-3 bg-emerald-50 rounded-lg text-sm">
                                        <div className="flex justify-between font-medium">
                                            <span>Payment</span>
                                            <span className="text-green-700">{formatCurrency(payment.payment_amount)}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">Date: {new Date(payment.payment_date).toLocaleDateString()}</div>
                                        {payment.notes && <div className="text-xs italic text-slate-500">Note: {payment.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const AddTaskModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [projectName, setProjectName] = useState('');
    const [taskFee, setTaskFee] = useState('');
    if (!isOpen) return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(freelancer.firebase_uid, { project_name: projectName, task_fee: taskFee });
        setProjectName('');
        setTaskFee('');
    };
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Add New Task</h2>
                    <p className="text-sm text-slate-500 mb-4">For {freelancer?.name}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Project / Task Description</label>
                            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700" required />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Task Fee (₹)</label>
                            <input type="number" value={taskFee} onChange={(e) => setTaskFee(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                                Save Task
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const MakePaymentModal = ({ isOpen, freelancer, onSave, onCancel }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [notes, setNotes] = useState('');
    if (!isOpen) return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(freelancer.firebase_uid, { payment_amount: paymentAmount, notes });
        setPaymentAmount('');
        setNotes('');
    };
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-1">Make a Payment</h2>
                    <p className="text-sm text-slate-500 mb-4">To {freelancer?.name}</p>
                    <div className="mb-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <label className="text-xs text-slate-500">Current Balance Due</label>
                        <p className="font-bold text-lg text-red-600">{formatCurrency(freelancer?.remaining_balance)}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500">Payment Amount (₹)</label>
                            <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" required />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Notes (Optional)</label>
                            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-100" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white">
                                Confirm Payment
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
// --- MODAL (For Salaried/Monthly Payroll History) ---
const PaymentHistoryModal = ({ isOpen, employee, onClose }) => {
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchHistory = async () => {
        if (!employee) return;
        setIsLoading(true);
        setError('');
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const response = await axios.get(`${API_URL}/api/members/${employee.firebase_uid}/salaries/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const sortedHistory = response.data.sort((a, b) => new Date(b.period_year, b.period_month - 1) - new Date(a.period_year, a.period_month - 1));
            setHistory(sortedHistory);

            const totals = sortedHistory.reduce(
                (acc, rec) => {
                    acc.totalDue += Number(rec.amount_due ?? 0);
                    acc.totalPaid += Number(rec.amount_paid ?? 0);
                    return acc;
                },
                { totalDue: 0, totalPaid: 0 },
            );
            setSummary(totals);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to fetch payment history.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && employee) {
            fetchHistory();
        }
    }, [isOpen, employee]);

    const handlePaySingleMonth = async (record) => {
        if (!window.confirm(`Are you sure you want to pay ${formatCurrency(record.amount_due - record.amount_paid)} for ${monthName(record.period_month)} ${record.period_year}?`)) return;
        setIsSubmitting(true);
        setError('');
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await axios.post(`${API_URL}/api/members/salaries/pay-single`, { salaryId: record.id }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchHistory();
        } catch (e) {
            setError(e?.response?.data?.error || 'Payment failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayAllDue = async () => {
        const remainingBalance = summary.totalDue - summary.totalPaid;
        if (!window.confirm(`Are you sure you want to pay the total remaining balance of ${formatCurrency(remainingBalance)}?`)) return;
        setIsSubmitting(true);
        setError('');
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await axios.post(`${API_URL}/api/members/salaries/pay-all-due`, { employeeUid: employee.firebase_uid }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchHistory();
        } catch (e) {
            setError(e?.response?.data?.error || 'Bulk payment failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const remainingBalance = summary.totalDue - summary.totalPaid;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold">Monthly Payment History</h2>
                            <p className="text-sm text-slate-500">For {employee?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-t border-b py-4">
                        <div>
                            <label className="text-xs text-slate-500">Total Amount Due</label>
                            <p className="font-bold text-lg">{formatCurrency(summary.totalDue)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Total Amount Paid</label>
                            <p className="font-bold text-lg text-green-600">{formatCurrency(summary.totalPaid)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Remaining Balance</label>
                            <p className={`font-bold text-lg ${remainingBalance > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCurrency(remainingBalance)}</p>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <p className="text-center p-4">Loading history...</p>
                        ) : error ? (
                            <p className="text-center p-4 text-red-500">{error}</p>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-xs uppercase">Period</th>
                                        <th className="p-3 text-xs uppercase">Due</th>
                                        <th className="p-3 text-xs uppercase">Paid</th>
                                        <th className="p-3 text-xs uppercase">Status</th>
                                        <th className="p-3 text-xs uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((rec) => {
                                        const isFullyPaid = Number(rec.amount_paid) >= Number(rec.amount_due);
                                        return (
                                            <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-700">
                                                <td className="p-3 text-sm">
                                                    {monthName(rec.period_month)} {rec.period_year}
                                                </td>
                                                <td className="p-3 text-sm font-semibold">{formatCurrency(rec.amount_due)}</td>
                                                <td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(rec.amount_paid)}</td>
                                                <td className="p-3 text-sm">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                                                    >
                                                        {isFullyPaid ? 'Paid' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    {!isFullyPaid && (
                                                        <button
                                                            onClick={() => handlePaySingleMonth(rec)}
                                                            disabled={isSubmitting}
                                                            className="bg-black text-white px-3 py-1 text-xs font-bold rounded hover:bg-gray-700 disabled:bg-slate-400"
                                                        >
                                                            {isSubmitting ? '...' : 'Pay Now'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {history.length === 0 && (
                                        <tr>
                                            <td className="p-4 text-center text-slate-500" colSpan={5}>
                                                No payment history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {!isLoading && remainingBalance > 0 && (
                        <div className="border-t pt-4 mt-auto flex justify-end">
                            <button onClick={handlePayAllDue} disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 font-bold rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                                {isSubmitting ? 'Processing...' : `Pay All Due (${formatCurrency(remainingBalance)})`}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const parseAndFormatRoles = (roles) => {
    if (!roles) return 'No role assigned';

    // If roles is already an array (correct backend behavior)
    if (Array.isArray(roles)) {
        if (roles.length === 0) return 'No role assigned';
        return (
            roles
                .map((r) => r.role_name || r.type_name || '')
                .filter(Boolean)
                .join(', ') || 'No role assigned'
        );
    }

    // If roles came as JSON string accidentally
    if (typeof roles === 'string') {
        try {
            const parsed = JSON.parse(roles);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return (
                    parsed
                        .map((r) => r.role_name || r.type_name || '')
                        .filter(Boolean)
                        .join(', ') || 'No role assigned'
                );
            }
        } catch (err) {
            console.error('Role parse error:', roles);
        }
    }

    return 'No role assigned';
};

// --- Main Page Component ---
function PayrollManagementPage() {
    const [activeTab, setActiveTab] = useState('salaried');
    const [searchQuery, setSearchQuery] = useState('');

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
    const [isBillAssignmentModalOpen, setIsBillAssignmentModalOpen] = useState(false);
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
    const [viewingEmployee, setViewingEmployee] = useState(null);
    const [freelancerSummaries, setFreelancerSummaries] = useState([]);
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [isBillTaskModalOpen, setIsBillTaskModalOpen] = useState(false);
    const [isMakePaymentModalOpen, setIsMakePaymentModalOpen] = useState(false);
    const [isFreelancerHistoryModalOpen, setIsFreelancerHistoryModalOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    

    const fetchData = async () => {
        const auth = getAuth();
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        setIsEmployeeLoading(true);
        axios
            .get(`${API_URL}/api/members`, { headers })
            .then((res) => {
                console.log('All employees fetched from DB:', res.data);
                setEmployees(res.data || []);
            })
            .catch((e) => setEmployeeError(e?.response?.data?.error || 'Failed to load employees.'))
            .finally(() => setIsEmployeeLoading(false));

        setIsMonthlyLoading(true);
        axios
            .get(`${API_URL}/api/members/salaries`, { headers })
            .then((res) => setMonthlyRecords(res.data || []))
            .catch((e) => setMonthlyError(e?.response?.data?.error || 'Failed to load monthly records.'))
            .finally(() => setIsMonthlyLoading(false));

        axios
            .get(`${API_URL}/api/members/freelancers/summaries`, { headers })
            .then((res) => {
                console.log('All freelancer summaries fetched from DB:', res.data);
                setFreelancerSummaries(res.data || []);
            })
            .catch((e) => console.error('Failed to load freelancer summaries', e));
    };

    console.log('Freelancer summaries fetched from DB:', freelancerSummaries);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchData();
        });
        return () => unsubscribe();
    }, []);

    // --- Handler Functions ---
    const handleUpdateBaseSalary = async (uid, salary) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await axios.put(`${API_URL}/api/members/${uid}/salary`, { salary }, { headers: { Authorization: `Bearer ${token}` } });
            setIsBaseSalaryModalOpen(false);
            fetchData();
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to update base salary.');
        }
    };

    const handleGenerate = async (month, year) => {
        if (!window.confirm(`Generate/update salary records for ${monthName(month)}, ${year}? This will affect ALL employee types.`)) return;
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const res = await axios.post(`${API_URL}/api/members/salaries/generate`, { month, year }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
            fetchData();
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to generate salaries.');
        }
    };

    const handleUpdateMonthlyRecord = async (id, formData) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await axios.put(`${API_URL}/api/members/salaries/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setIsMonthlyModalOpen(false);
            fetchData();
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to save record.');
        }
    };

    const handleViewSalariedHistory = (record) => {
        const employee = employees.find((emp) => emp.firebase_uid === record.firebase_uid);
        if (employee) {
            setViewingEmployee(employee);
            setIsPaymentHistoryModalOpen(true);
        } else {
            alert('Could not find employee details for this record.');
        }
    };

    const handleBillAssignment = async (data) => {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();
        axios
            .post(`${API_URL}/api/members/freelancers/billings`, data, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setIsBillAssignmentModalOpen(false);
                fetchData();
            })
            .catch((err) => alert(err.response?.data?.error || 'Failed to bill assignment.'));
    };

    const handleAssignTask = async (freelancer_uid, taskData) => {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();
        axios
            .post(`${API_URL}/api/members/freelancers/tasks`, { ...taskData, freelancer_uid }, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setIsAssignTaskModalOpen(false);
                fetchData();
            })
            .catch((err) => alert(err.response?.data?.error || 'Failed to assign task.'));
    };
    console.log('freelancerSummaries', freelancerSummaries);
    console.log('selectedFreelancer', selectedFreelancer);

    const handleBillTask = async (data) => {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();
        axios
            .put(`${API_URL}/api/members/freelancers/tasks/bill`, data, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setIsBillTaskModalOpen(false);
                fetchData();
            })
            .catch((err) => alert(err.response?.data?.error || 'Failed to bill task.'));
    };

    const handleViewHistory = (record) => {
        console.log('Attempting to view history for record:', record);
        // The monthly salary record object has `firebase_uid` which is the employee's ID.
        const employee = employees.find((emp) => emp.firebase_uid === record.firebase_uid);
        if (employee) {
            setViewingEmployee(employee);
            setIsHistoryModalOpen(true);
        } else {
            alert("Could not find employee details for this record. Mismatch between salary record's firebase_uid and employee list.");
        }
    };

    const handleSaveTask = async (freelancer_uid, taskData) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            // Note the new endpoint from your backend setup
            await axios.post(`${API_URL}/api/members/freelancers/tasks`, { ...taskData, freelancer_uid }, { headers: { Authorization: `Bearer ${token}` } });
            setAddTaskModalOpen(false);
            fetchData(); // Refresh all data to show the new balance
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to save task.');
        }
    };

    const openFreelancerModal = (freelancer, modalType) => {
        setSelectedFreelancer(freelancer);
        if (modalType === 'task') {
            setAddTaskModalOpen(true);
        } else if (modalType === 'payment') {
            setMakePaymentModalOpen(true);
        }
    };

    const handleSaveMonthlyPayment = async (record, formData) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Check if this is a NEW record (a placeholder we created on the frontend)
            if (record.status === 'N/A') {
                console.log('CREATING new salary record...');
                // API endpoint for CREATION. Assumes a POST request.
                // This is the most critical part. Your backend needs an endpoint to handle this.
                const payload = {
                    firebase_uid: record.firebase_uid, // The employee's ID
                    month: record.period_month, // The current period
                    year: record.period_year, // The current period
                    ...formData, // The data from the modal (amount_paid, status, notes)
                };
                await axios.post(`${API_URL}/api/members/salaries`, payload, { headers });
            } else {
                console.log('UPDATING existing salary record...');
                // API endpoint for UPDATING. Uses PUT with the record's specific ID.
                await axios.put(`${API_URL}/api/members/salaries/${record.id}`, formData, { headers });
            }

            setIsMonthlyModalOpen(false); // Close the modal on success
            fetchData(); // Refresh all data to show the change
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to save payment record. Please check the console.');
            console.error('Error saving payment record:', e);
        }
    };

    const handleAssignFee = async (data) => {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();
        axios
            .put(`${API_URL}/api/members/freelancers/tasks/bill`, data, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setAssignFeeModalOpen(false);
                fetchData();
            })
            .catch((err) => alert(err.response?.data?.error || 'Failed to bill task.'));
    };

    const handleMakePayment = async (freelancer_uid, paymentData) => {
  try {
    const freelancer = freelancerSummaries.find(
      (f) => f.firebase_uid === freelancer_uid
    );

    if (
      parseFloat(paymentData.payment_amount) >
      parseFloat(freelancer.remaining_balance)
    ) {
      alert("❌ Error: Payment amount cannot be greater than the balance due.");
      return;
    }

    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();

    const res = await axios.post(
      `${API_URL}/api/members/freelancers/payments`,
      { ...paymentData, freelancer_uid },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const msg = res.data?.message || "✅ Payment recorded successfully.";

    // ✅ Guarantee message appears before UI re-render
    await new Promise((resolve) => {
      alert(msg);
      setTimeout(resolve, 300);
    });

    setIsMakePaymentModalOpen(false);
    await fetchData();
  } catch (err) {
    console.error("Payment Error:", err);
    const errorMsg =
      err.response?.data?.error ||
      err.message ||
      "❌ Failed to record payment. Please try again.";

    await new Promise((resolve) => {
      alert(errorMsg);
      setTimeout(resolve, 300);
    });
  }
};

    const openModal = (freelancer, modalType) => {
        setSelectedFreelancer(freelancer);
        if (modalType === 'billAssignment') setIsBillAssignmentModalOpen(true);
        if (modalType === 'payment') setIsMakePaymentModalOpen(true);
        if (modalType === 'freelancerHistory') setIsFreelancerHistoryModalOpen(true);
    };

    // ✅ FIX: Corrected search logic to use the right field ('roles') and helper function
    const filteredEmployees = useMemo(() => {
        if (!searchQuery) return employees;
        return employees.filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || parseAndFormatRoles(emp.roles).toLowerCase().includes(searchQuery.toLowerCase()));
    }, [employees, searchQuery]);

    const filteredFreelancerSummaries = useMemo(() => {
        if (!searchQuery) return freelancerSummaries;
        return freelancerSummaries.filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [freelancerSummaries, searchQuery]);

    const salariedEmployees = filteredEmployees.filter((emp) => emp.employee_type === 1 || emp.employee_type === 2);
    const freelancerEmployees = filteredEmployees.filter((emp) => emp.employee_type === 0);

    const monthlyDisplayRecords = useMemo(() => {
        // Create a Map for instant lookups of salary records
        const salaryMap = new Map(monthlyRecords.map((rec) => [rec.firebase_uid, rec]));

        // Use the filtered list of ALL employees as the source of truth
        return filteredEmployees.map((employee) => {
            const salaryRecord = salaryMap.get(employee.firebase_uid);

            if (salaryRecord) {
                // If a salary record exists, combine it with employee data
                return {
                    ...employee, // contains name, roles, employee_type
                    ...salaryRecord, // contains amount_due, amount_paid, status, etc.
                    id: salaryRecord.id, // ensure salary record id is primary
                };
            } else {
                // If no salary record exists, create a placeholder row.
                // This is crucial for employees who haven't been generated a salary yet.
                return {
                    ...employee,
                    id: employee.firebase_uid, // Use firebase_uid as a fallback key
                    amount_due: '0.00',
                    amount_paid: '0.00',
                    status: 'N/A',
                    period_month: month,
                    period_year: year,
                    employee_name: employee.name, // ensure name is present
                };
            }
        });
    }, [filteredEmployees, monthlyRecords, month, year]);

    const enrichedMonthlyRecords = useMemo(() => {
        const employeeMap = new Map(employees.map((emp) => [emp.firebase_uid, emp]));
        return monthlyRecords.map((rec) => {
            const employeeDetails = employeeMap.get(rec.firebase_uid);
            return {
                ...rec,
                roles: employeeDetails?.roles,
                employee_type: employeeDetails?.employee_type,
            };
        });
    }, [monthlyRecords, employees]);

    const filteredMonthlyRecords = useMemo(() => {
        if (!searchQuery) return enrichedMonthlyRecords;
        return enrichedMonthlyRecords.filter(
            (rec) => rec.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) || parseAndFormatRoles(rec.roles).toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [enrichedMonthlyRecords, searchQuery]);

    const freelancerMonthlyRecords = useMemo(() => {
        return filteredMonthlyRecords.filter((rec) => rec.employee_type === 0);
    }, [filteredMonthlyRecords]);

    // Tab configuration
    const tabConfig = {
        salaried: { label: 'Salaried Employees', icon: User },
        freelancers: { label: 'Freelancers', icon: Briefcase },
        monthlyPayroll: { label: 'Monthly Payroll', icon: Calendar },
    };

    const breadcrumbLinkStyles = 'text-blue-600 dark:text-blue-500 hover:underline';

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 text-slate-900">
            <BaseSalaryModal isOpen={isBaseSalaryModalOpen} onSave={handleUpdateBaseSalary} onCancel={() => setIsBaseSalaryModalOpen(false)} employee={editingEmployee} />
            <MonthlySalaryModal isOpen={isMonthlyModalOpen} onSave={handleUpdateMonthlyRecord} onCancel={() => setIsMonthlyModalOpen(false)} record={editingMonthlyRecord} />
            <PaymentHistoryModal isOpen={isPaymentHistoryModalOpen} onClose={() => setIsPaymentHistoryModalOpen(false)} employee={viewingEmployee} />
            <BillAssignmentModal isOpen={isBillAssignmentModalOpen} onSave={handleBillAssignment} onCancel={() => setIsBillAssignmentModalOpen(false)} freelancer={selectedFreelancer} />
            <MakePaymentModal isOpen={isMakePaymentModalOpen} onSave={handleMakePayment} onCancel={() => setIsMakePaymentModalOpen(false)} freelancer={selectedFreelancer} />
            <FreelancerHistoryModal isOpen={isFreelancerHistoryModalOpen} onClose={() => setIsFreelancerHistoryModalOpen(false)} freelancer={selectedFreelancer} />
            <div className="max-w-7xl mx-auto isolate space-y-8">
                <header>
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/dashboard" className={breadcrumbLinkStyles}>
                                Dashboard
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 text-gray-500">
                            <span>Payroll Management</span>
                        </li>
                    </ul>
                </header>

                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {Object.entries(tabConfig).map(([key, { label, icon: Icon }]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveTab(key);
                                    setSearchQuery('');
                                }}
                                className={`${
                                    activeTab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                <Icon className="mr-2 h-5 w-5" /> {label}
                            </button>
                        ))}
                    </nav>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                        {/* Shared Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or role..."
                                className="w-full max-w-sm p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* --- Conditional Rendering for 'Salaried' Tab --- */}
                        {activeTab === 'salaried' && (
                            <div className="bg-white dark:bg-slate-800 dark:text-slate-400 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold mb-4">Salaried Employee Base Salaries</h2>
                                {isEmployeeLoading ? (
                                    <p className="text-center p-4">Loading...</p>
                                ) : employeeError ? (
                                    <p className="text-center p-4 text-red-500">{employeeError}</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="p-3 text-xs uppercase">Employee</th>
                                                    <th className="p-3 text-xs uppercase">Type</th>
                                                    <th className="p-3 text-xs uppercase">Base Salary</th>
                                                    <th className="p-3 text-xs uppercase text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salariedEmployees.map((emp) => (
                                                    <tr key={emp.firebase_uid} className="border-b border-slate-100 dark:border-slate-700">
                                                        <td className="p-3 text-sm">
                                                            <div className="font-medium">{emp.name}</div>
                                                            <div className="text-xs">
                                                                <RoleTooltip roles={emp.roles} />
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-sm">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${emp.employee_type === 2 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
                                                            >
                                                                {getEmployeeType(emp.employee_type)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-sm font-semibold">{formatCurrency(emp.salary)}</td>
                                                        <td className="p-3 text-sm text-right">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingEmployee(emp);
                                                                    setIsBaseSalaryModalOpen(true);
                                                                }}
                                                                className="p-2 text-slate-500 hover:text-indigo-600"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {salariedEmployees.length === 0 && (
                                                    <tr>
                                                        <td className="p-4 text-center text-slate-500" colSpan={4}>
                                                            No salaried employees found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- Conditional Rendering for 'Freelancers' Tab --- */}
                        {activeTab === 'freelancers' && (
                            <div className="bg-white dark:bg-slate-800 dark:text-slate-400 p-6 rounded-xl shadow-lg">
                                <h2 className="text-xl font-bold mb-4">Freelancer Accounts</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-3 text-xs uppercase">Freelancer</th>
                                                <th className="p-3 text-xs uppercase">Status</th>
                                                <th className="p-3 text-xs uppercase">Total Billed</th>
                                                <th className="p-3 text-xs uppercase">Total Paid</th>
                                                <th className="p-3 text-xs uppercase">Balance Due</th>
                                                <th className="p-3 text-xs uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFreelancerSummaries.map((emp) => (
                                                <tr key={emp.firebase_uid} className="border-b">
                                                    <td className="p-3">
                                                        <div className="font-medium">{emp.name}</div>
                                                        <div className="text-xs">
                                                            <RoleTooltip roles={emp.roles} />
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${Number(emp.remaining_balance) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                                                        >
                                                            {Number(emp.remaining_balance) > 0 ? 'Due' : 'Paid Up'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-semibold">{formatCurrency(emp.total_billed)}</td>
                                                    <td className="p-3 font-semibold text-green-600">{formatCurrency(emp.total_paid)}</td>
                                                    <td className={`p-3 font-bold ${Number(emp.remaining_balance) > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                                        {formatCurrency(emp.remaining_balance)}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openModal(emp, 'billAssignment')}
                                                                title="Bill an Assigned Work"
                                                                className="relative p-2 text-slate-500 hover:text-indigo-600"
                                                            >
                                                                <FilePlus size={18} />
                                                                {emp.unbilled_assignments_count > 0 && (
                                                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                                                                        {emp.unbilled_assignments_count}
                                                                    </span>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => openModal(emp, 'payment')}
                                                                title="Make Payment"
                                                                className="p-2 text-slate-500 hover:text-green-600 disabled:text-slate-300"
                                                                disabled={Number(emp.remaining_balance) <= 0}
                                                            >
                                                                <Wallet size={18} />
                                                            </button>
                                                            <button onClick={() => openModal(emp, 'freelancerHistory')} title="View History" className="p-2 text-slate-500 hover:text-blue-600">
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- Conditional Rendering for 'Monthly Payroll' Tab --- */}
                        {activeTab === 'monthlyPayroll' && (
                            <div className="bg-white dark:bg-slate-800 dark:text-slate-400 p-6 rounded-xl shadow-lg">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <h2 className="text-xl font-bold">Monthly Payroll</h2>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border rounded-lg flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold px-2 text-sm">Generate for:</h3>
                                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 rounded-lg bg-white dark:bg-slate-700 border">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                <option key={m} value={m}>
                                                    {monthName(m)}
                                                </option>
                                            ))}
                                        </select>
                                        <select value={year} onChange={(e) => setYear(e.target.value)} className="p-2 rounded-lg bg-white dark:bg-slate-700 border">
                                            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleGenerate(month, year)} className="flex items-center px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                            <PlusCircle size={16} className="mr-2" />
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                {isMonthlyLoading ? (
                                    <p className="text-center p-4">Loading...</p>
                                ) : monthlyError ? (
                                    <p className="text-center p-4 text-red-500">{monthlyError}</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="p-3 text-xs uppercase">Employee</th>
                                                    <th className="p-3 text-xs uppercase">Period</th>
                                                    <th className="p-3 text-xs uppercase">Due</th>
                                                    <th className="p-3 text-xs uppercase">Paid</th>
                                                    <th className="p-3 text-xs uppercase">Remaining</th>
                                                    <th className="p-3 text-xs uppercase">Status</th>
                                                    <th className="p-3 text-xs uppercase text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMonthlyRecords.map((rec) => {
                                                    const remaining = Number(rec.amount_due ?? 0) - Number(rec.amount_paid ?? 0);
                                                    const type = getEmployeeType(rec.employee_type);
                                                    return (
                                                        <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-700">
                                                            <td className="p-3 text-sm">
                                                                <div className="font-medium">{rec.employee_name}</div>
                                                                <div className="mt-0.5">
                                                                    <RoleTooltip roles={Array.isArray(rec.roles) ? rec.roles : []} />
                                                                </div>

                                                                <span
                                                                    className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                                                        type === 'Manager'
                                                                            ? 'bg-purple-100 text-purple-800'
                                                                            : type === 'In-House'
                                                                              ? 'bg-blue-100 text-blue-800'
                                                                              : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {type}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {monthName(rec.period_month)} {rec.period_year}
                                                            </td>
                                                            <td className="p-3 text-sm font-semibold">{formatCurrency(rec.amount_due)}</td>
                                                            <td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(rec.amount_paid)}</td>
                                                            <td className={`p-3 text-sm font-semibold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCurrency(remaining)}</td>
                                                            <td className="p-3 text-sm">
                                                                <span
                                                                    className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${rec.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                                                                >
                                                                    {rec.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-sm text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => handleViewSalariedHistory(rec)} className="p-2 text-slate-500 hover:text-blue-600" title="View History">
                                                                        <Eye size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMonthlyRecord(rec);
                                                                            setIsMonthlyModalOpen(true);
                                                                        }}
                                                                        className="p-2 text-slate-500 hover:text-indigo-600"
                                                                        title="Edit Record"
                                                                    >
                                                                        <Edit3 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredMonthlyRecords.length === 0 && (
                                                    <tr>
                                                        <td className="p-4 text-center text-slate-500" colSpan={7}>
                                                            No payroll records found. Try generating records or adjusting your search.
                                                        </td>
                                                    </tr>
                                                )}
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
