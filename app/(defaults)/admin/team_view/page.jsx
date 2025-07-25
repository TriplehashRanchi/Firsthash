"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Icon Components
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconCalendar from '@/components/icon/icon-calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const TYPE_LABELS = { 0: 'Freelancer', 1: 'In-house' };

// --- Reusable UI Components (Unchanged) ---

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    const styles = {
        success: { bg: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        error: { bg: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    };
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-50 ${styles[type].bg}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                {styles[type].icon}
            </svg>
            {message}
        </div>
    );
};

const ConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold mt-4 text-gray-800">Delete Member</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="mt-6 flex justify-center space-x-3">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>
);

const IconButton = ({ as: Component = 'button', children, text, ...props }) => (
    <Component className="group relative" {...props}>
        {children}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {text}
        </div>
    </Component>
);

const AttendanceModal = ({ isOpen, onClose, record, onRecordChange, onSave, isSaving, memberName }) => {
    if (!isOpen) return null;
    const handleStatusToggle = (checked) => {
        onRecordChange('a_status', checked ? 1 : 0);
        if (!checked) {
            onRecordChange('in_time', '');
            onRecordChange('out_time', '');
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Mark Attendance</h2>
                        <p className="text-gray-600 mt-1">For {memberName} on {new Date(record.a_date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">×</button>
                </div>
                <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <span className={`font-semibold ${record.a_status === 1 ? 'text-green-700' : 'text-gray-700'}`}>{record.a_status === 1 ? 'Present' : 'Absent'}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={record.a_status === 1} onChange={e => handleStatusToggle(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${record.a_status === 1 ? 'opacity-100' : 'opacity-50'}`}>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Clock In</label>
                            <input type="time" value={record.in_time} onChange={e => onRecordChange('in_time', e.target.value)} disabled={record.a_status !== 1} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Clock Out</label>
                            <input type="time" value={record.out_time} onChange={e => onRecordChange('out_time', e.target.value)} disabled={record.a_status !== 1} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={onSave} disabled={isSaving} className="px-4 py-2 w-28 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center">
                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---

export default function TeamViewPage() {
    const [members, setMembers] = useState([]);
    const [rolesList, setRolesList] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, uid: null });

    useEffect(() => {
        fetchMembers();
        fetchRoles();
    }, []);

    async function fetchMembers() {
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    try {
      const token = await user.getIdToken();
      const { data } = await axios.get(`${API_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    }
  }

    async function fetchRoles() {
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    try {
      const token = await user.getIdToken();
      const { data } = await axios.get(`${API_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolesList(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    }
  }

    async function toggleAuth(uid, checked) {
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    try {
      const token = await user.getIdToken();
      const status = checked ? 'active' : 'inactive';
      await axios.patch(
        `${API_URL}/api/members/${uid}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(prev =>
        prev.map(m => (m.firebase_uid === uid ? { ...m, status } : m))
      );
      setToast({ message: 'Member status updated.', type: 'success' });
    } catch (err) {
      console.error('Error toggling auth:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    }
  }

    const handleDeleteRequest = (uid) => setConfirmDelete({ isOpen: true, uid });

    async function deleteMember() {
    const { uid } = confirmDelete;
    setConfirmDelete({ isOpen: false, uid: null });
    if (!uid) return;
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    try {
      const token = await user.getIdToken();
      await axios.delete(`${API_URL}/api/members/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(prev => prev.filter(m => m.firebase_uid !== uid));
      setToast({ message: 'Member deleted successfully.', type: 'success' });
    } catch (err) {
      console.error('Error deleting member:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    }
  }

    async function showAttendance(uid, name) {
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    try {
      const token = await user.getIdToken();
      const { data } = await axios.get(`${API_URL}/api/attendance?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let rec =
        data.find(r => r.firebase_uid === uid) ||
        { firebase_uid: uid, a_date: today, in_time: '', out_time: '', a_status: 0 };
      setTodayRecord({ ...rec, in_time: rec.in_time || '', out_time: rec.out_time || '' });
      setSelectedMember({ firebase_uid: uid, name });
      setShowAttendanceModal(true);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    }
  }

    
    const handleTodayChange = (field, value) => setTodayRecord(prev => ({ ...prev, [field]: value }));
    
    async function saveAttendance() {
    if (!todayRecord) return;
    const user = getAuth().currentUser;
    if (!user) {
      setToast({ message: 'Admin not logged in', type: 'error' });
      return;
    }
    setSavingAttendance(true);
    try {
      const token = await user.getIdToken();
      const payload = [
        {
          ...todayRecord,
          in_time: todayRecord.in_time || null,
          out_time: todayRecord.out_time || null
        }
      ];
      await axios.post(`${API_URL}/api/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: 'Attendance saved', type: 'success' });
      setShowAttendanceModal(false);
      fetchMembers(); // refresh list if needed
    } catch (err) {
      console.error('Error saving attendance:', err);
      const msg = err.response?.data?.error || err.message;
      setToast({ message: msg, type: 'error' });
    } finally {
      setSavingAttendance(false);
    }
  }

    
    return (
        <div className="p-8 bg-white min-h-screen">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {confirmDelete.isOpen && (
                <ConfirmationModal onConfirm={deleteMember} onCancel={() => setConfirmDelete({ isOpen: false, uid: null })} />
            )}
            <AttendanceModal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} record={todayRecord} onRecordChange={handleTodayChange} onSave={saveAttendance} isSaving={savingAttendance} memberName={selectedMember?.name}/>

           <ul class="flex space-x-2 rtl:space-x-reverse mb-6"><li><a class="text-blue-600 hover:underline dark:text-blue-400" href="/dashboard">Dashboard</a></li><li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500"><span class="text-gray-600 dark:text-gray-400">View Team</span></li></ul>

            <div className="bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-black border-b border-gray-200">
                            <tr className='bg-black'>
                                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3  bg-gray-100 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-black uppercase tracking-wider">Roles</th>
                                <th className="px-6 py-3  bg-gray-100 text-left text-xs font-medium text-black uppercase tracking-wider">Auth</th>
                                <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {members.map(m => {
                                // ===== ERROR FIX STARTS HERE =====
                                // Safely parse role_ids, ensuring it's always an array.
                                let roleIdsArray = [];
                                if (Array.isArray(m.role_ids)) {
                                    roleIdsArray = m.role_ids;
                                } else if (typeof m.role_ids === 'string' && m.role_ids.trim().startsWith('[')) {
                                    // Handle JSON string case, e.g., '[1,5]'
                                    try {
                                        roleIdsArray = JSON.parse(m.role_ids);
                                    } catch (e) {
                                        console.error("Failed to parse role_ids:", m.role_ids, e);
                                    }
                                } else if (m.role_ids === null || m.role_ids === undefined) {
                                     // This handles cases where the user has no roles and the value is null.
                                     roleIdsArray = [];
                                } else {
                                     // Fallback for unexpected formats, though less likely.
                                     console.warn("Unexpected format for role_ids:", m.role_ids);
                                }
                                
                                // Now, we can safely map over roleIdsArray.
                                const assignedRoleNames = roleIdsArray
                                    .map(id => rolesList.find(role => role.id === id)?.type_name)
                                    .filter(Boolean); // Filter out any undefined names if a role is not found
                                // ===== ERROR FIX ENDS HERE =====
                                
                                return (
                                <tr key={m.firebase_uid} className="hover:bg-gray-100 bg-white transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{TYPE_LABELS[m.employee_type]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            {assignedRoleNames.length > 0 ? (
                                                assignedRoleNames.map((roleName) => (
                                                    <span key={roleName} className="px-2.5 py-1 text-xs font-semibold leading-none text-gray-100 bg-gray-700 rounded-full">
                                                        {roleName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Not assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={m.status === 'active'} onChange={e => toggleAuth(m.firebase_uid, e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center space-x-4">
                                            <IconButton as={Link} href={`/admin/team_view/view/${m.firebase_uid}`} text="View"><IconEye/></IconButton>
                                            <IconButton as={Link} href={`/admin/team_view/edit/${m.firebase_uid}`} text="Edit"><IconEdit/></IconButton>
                                            <IconButton onClick={() => showAttendance(m.firebase_uid, m.name)} text="Attendance"><IconCalendar/></IconButton>
                                            <IconButton onClick={() => handleDeleteRequest(m.firebase_uid)} text="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600 hover:text-red-800"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134h-3.868c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}