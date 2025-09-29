'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, ShieldCheck, Loader, FileText, Tag } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const CreateRoleModal = ({ isOpen, onClose, companyId, onRoleCreated }) => {
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState(1); // Default to 'On Production'
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        if (!isOpen) {
            setNewName('');
            setNewCode(1);
            setIsSubmitting(false);
        }
    }, [isOpen]);

   
    const withAuth = async (opts = {}) => {
        const user = getAuth().currentUser;
        if (!user) throw new Error('Admin not logged in');
        const token = await user.getIdToken();
        return {
            ...opts,
            headers: {
                ...(opts.headers||{}),
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return toast.error('Role name is required');
        
        setIsSubmitting(true);
        const toastId = toast.loading('Creating role...');
        
        try {
            const init = await withAuth({
                method: 'POST',
                body: JSON.stringify({
                    type_name: newName,
                    role_code: Number(newCode),
                    company_id: companyId
                })
            });
            const res = await fetch(`${API_URL}/api/roles`, init);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || res.statusText);
            }
            
            toast.success('Role created successfully!', { id: toastId });
            onRoleCreated();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Add New Role</h2>
                        <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    
                    {/* Form Body */}
                    <form onSubmit={handleCreate} className="p-8 space-y-6">
                        {/* Role Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role Title</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                    placeholder="e.g., Lead Animator"
                                />
                            </div>
                        </div>

                        {/* Category Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                             <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                >
                                    <option value={1}>On Production</option>
                                    <option value={2}>Post Production</option>
                                    {/* <option value={0}>Manager</option> */}
                                </select>
                            </div>
                        </div>
                        
                        {/* Footer with Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-gray-200">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="inline-flex items-center justify-center gap-2 w-40 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-indigo-400 transition-all transform hover:scale-105"
                            >
                                {isSubmitting ? <Loader size={20} className="animate-spin" /> : <PlusCircle size={20} />}
                                <span>Create Role</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Main Page Component ---
export default function EmployeeRolesPage({ searchParams }) {
  const GLOBAL_ID = '00000000-0000-0000-0000-000000000000';
  const {company} = useAuth()
  const PREDEFINED_ROLE_IDS_MAX = 13;
  const companyId = company.id || GLOBAL_ID;



  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [error, setError] = useState(null);
  
  // State for inline UPDATE
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState(0);

  // State for controlling the create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const withAuth = async (opts = {}) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Admin not logged in');
    const token = await user.getIdToken();
    return {
      ...opts,
      headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': opts.body ? 'application/json' : undefined }
    };
  };

  const loadRoles = async () => {
    if(!loading) setLoading(true); // Ensure loading is true when called
    setError(null);
    try {
      const init = await withAuth();
      const res = await fetch(`${API_URL}/api/roles?company_id=${companyId}`, init);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data.map(r => ({ ...r, is_predefined: r.id <= PREDEFINED_ROLE_IDS_MAX })));
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [companyId]);

  const handleApiCall = async (url, init, successMsg) => {
    try {
      const authInit = await withAuth(init);
      const res = await fetch(url, authInit);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText);
      }
      if (successMsg) toast.success(successMsg);
      await loadRoles();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      return false;
    }
  };

  const startEdit = role => {
    setEditingId(role.id);
    setEditName(role.type_name);
    setEditCode(role.role_code);
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async id => {
    if (!editName.trim()) return toast.error('Name required');
    await handleApiCall(`${API_URL}/api/roles/${id}`, { method: 'PUT', body: JSON.stringify({ type_name: editName, role_code: Number(editCode) }) }, 'Role updated');
    setEditingId(null);
  };
  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
    await handleApiCall(`${API_URL}/api/roles/${id}`, { method: 'DELETE' }, 'Role deleted');
  };

  return (
    <>
      <div className="min-h-screen w-full">
        <div className="w-full mx-auto p-2 sm:p-6 lg:p-4 space-y-2">
          <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a className="text-blue-600 hover:underline" href="/dashboard">Dashboard</a></li>
            <li className="before:content-['/'] ltr:before:mr-2 text-gray-500"><span>Manage Roles</span></li>
          </ul>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl dark:text-gray-200 font-semibold text-gray-700">Existing Roles</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800"
                >
                    <PlusCircle size={20} />
                    Add New Role
                </button>
            </div>
            
            {loading && <div className="flex justify-center p-10"><Loader className="animate-spin text-indigo-500" size={32}/></div>}
            {error && <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">Error: {error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100 ">
                        <tr>
                            <th className="px-4 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-600 uppercase">Role Title</th>
                            <th className="px-4 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                            <th className="px-4 py-3 dark:text-gray-200 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:bg-gray-900">
                        {roles.map(r =>
                            editingId === r.id ? (
                            // Inline Edit Row
                            <tr key={r.id} className="bg-indigo-50">
                                <td className="px-4 py-3"><input className="w-full p-2 border-gray-300 rounded-md" value={editName} onChange={e => setEditName(e.target.value)} /></td>
                                <td className="px-4 py-3">
                                    <select className="w-full p-2 border-gray-300  rounded-md" value={editCode} onChange={e => setEditCode(e.target.value)}>
                                        <option value={1}>On Production (1)</option>
                                        <option value={2}>Post Production (2)</option>
                                        {/* <option value={0}>Manager (0)</option> */}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => saveEdit(r.id)} className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"><Save size={16} /></button>
                                        <button onClick={cancelEdit} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><X size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                            ) : (
                            // View Row
                            <tr key={r.id} className="hover:bg-gray-50 hover:dark:bg-gray-700">
                                <td className="px-4 dark:text-gray-200 py-3 font-semibold text-gray-800 flex items-center gap-3">
                                  {r.type_name}
                                  {r.is_predefined && (<span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium"><ShieldCheck size={14} /> Predefined</span>)}
                                </td>
                                <td className="px-4 py-3 dark:text-gray-200 text-gray-600">{r.role_code === 1 ? 'On Production' : r.role_code === 2 ? 'Post Production' : 'Manager'}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => startEdit(r)} disabled={r.is_predefined} className="p-2 text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(r.id)} disabled={r.is_predefined} className="p-2 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                            )
                        )}
                        {roles.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-10">No custom roles found.</td></tr>}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* The Create Role Modal is rendered here */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={companyId}
        onRoleCreated={loadRoles} // Pass the loadRoles function to refresh the list after creation
      />
    </>
  );
}