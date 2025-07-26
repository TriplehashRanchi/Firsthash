'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, ShieldCheck } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function EmployeeRolesPage({ searchParams }) {
  const GLOBAL_ID = '00000000-0000-0000-0000-000000000000';
  const PREDEFINED_ROLE_IDS_MAX = 13;
  const companyId = searchParams.company_id || GLOBAL_ID;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for CREATE
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState(0);

  // State for UPDATE (inline)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


  // helper: fetch fresh token + add to headers
  const withAuth = async (opts = {}) => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Admin not logged in');
    const token = await user.getIdToken();
    return {
      ...opts,
      headers: {
        ...(opts.headers||{}),
        Authorization: `Bearer ${token}`,
        'Content-Type': opts.body ? 'application/json' : undefined
      }
    };
  };

  // Load (READ)
  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const init = await withAuth();
      const res = await fetch(`${API_URL}/api/roles?company_id=${companyId}`, init);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data.map(r => ({
        ...r,
        is_predefined: r.id <= PREDEFINED_ROLE_IDS_MAX
      })));
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, [companyId]);

  // Improved API call handler
  const handleApiCall = async (url, init, successMsg) => {
    try {
      const authInit = await withAuth(init);
      const res = await fetch(url, authInit);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText);
      }
      if (successMsg) toast.success(successMsg);
      // refresh list
      await loadRoles();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      return false;
    }
  };

  // Create
  const handleCreate = async e => {
    e.preventDefault();
    if(!newName.trim()) return toast.error('Name required');
    await handleApiCall(
      `${API_URL}/api/roles`,
      { method: 'POST', body: JSON.stringify({
          type_name: newName,
          role_code: Number(newCode),
          company_id: companyId
      })},
      'Role created'
    );
    setNewName(''); setNewCode(0);
  };

  // Begin inline edit
  const startEdit = role => {
    setEditingId(role.id);
    setEditName(role.type_name);
    setEditCode(role.role_code);
  };

  // Cancel inline edit
  const cancelEdit = () => setEditingId(null);

  // Save inline update
  const saveEdit = async id => {
    if (!editName.trim()) return toast.error('Name required');
    await handleApiCall(
      `${API_URL}/api/roles/${id}`,
      { method: 'PUT', body: JSON.stringify({
          type_name: editName,
          role_code: Number(editCode)
      })},
      'Role updated'
    );
    setEditingId(null);
  };

  // Delete
  const handleDelete = async id => {
    if (!confirm('Delete this role?')) return;
    await handleApiCall(
      `${API_URL}/api/roles/${id}`,
      { method: 'DELETE' },
      'Role deleted'
    );
  };

  return (
    // ✅ FULL-WIDTH LAYOUT
    <div className="min-h-screen bg-white w-full">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
         <ul class="flex space-x-2 rtl:space-x-reverse mb-6"><li><a class="text-blue-600 hover:underline dark:text-blue-400" href="/dashboard">Dashboard</a></li><li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-gray-500 dark:text-gray-500"><span class="text-gray-600 dark:text-gray-400">Create Role</span></li></ul>

        {/* CREATE FORM */}
        <div className="bg-white p-6 ">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Role</h2>
            <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block mb-1 font-medium text-gray-600">New Title</label>
                <input
                    className="w-full p-3 border rounded"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    placeholder="e.g., Lead Animator"
                />
                </div>
                <div>
                <label className="block mb-1 font-medium text-gray-600">Role Code</label>
                <select
                    className="w-full p-3 border rounded"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                >
                    <option value={0}>Manager (0)</option>
                    <option value={1}>On Production (1)</option>
                    <option value={2}>Post Production (2)</option>
                </select>
                </div>
            </div>
            <button
                type="submit"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded"
            >
                <PlusCircle size={20} />
                Add Role
            </button>
            </form>
        </div>

        {/* DATA DISPLAY */}
        <div className="bg-white p-6 ">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Existing Roles</h2>
            {loading && <p className="text-center text-gray-500">Loading…</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            {!loading && !error && (
            <ul className="space-y-3">
              {roles.map(r =>
                editingId === r.id ? (
                  // INLINE EDIT MODE
                  <li key={r.id} className="flex flex-col border-b-1 bg-indigo-50 p-4 rounded-lg space-y-3 shadow-md">
                    <input
                      className="border-gray-300 p-2 rounded-lg"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <select
                      className="border-gray-300 p-2 rounded-lg"
                      value={editCode}
                      onChange={e => setEditCode(e.target.value)}
                    >
                      <option value={0}>Manager (0)</option>
                      <option value={1}>On Production (1)</option>
                      <option value={2}>Post Production (2)</option>
                    </select>
                    <div className="flex space-x-2">
                      <button onClick={() => saveEdit(r.id)} className="inline-flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg"><Save size={16} /> Save</button>
                      <button onClick={cancelEdit} className="inline-flex items-center gap-1 px-4 py-2 border rounded-lg bg-white"><X size={16} /> Cancel</button>
                    </div>
                  </li>
                ) : (
                  // VIEW MODE
                  <li key={r.id} className="flex justify-between items-center border-b-2 border-gray p-2  hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">{r.type_name}</span>
                      {/* <em className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ID: {r.id}</em> */}
                      {r.is_predefined && (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          <ShieldCheck size={14} /> Predefined
                        </span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => startEdit(r)} disabled={r.is_predefined} className="p-2 bg-yellow-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600"> <Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} disabled={r.is_predefined} className="p-2 bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"><Trash2 size={16} /></button>
                    </div>
                  </li>
                )
              )}
               {roles.length === 0 && <p className="text-center text-gray-500">No roles found.</p>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}