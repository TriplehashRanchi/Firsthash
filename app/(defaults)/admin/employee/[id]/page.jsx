// File: app/boarding/employee/[id]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2, X, AlertTriangle } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';


 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RoleDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState(0);
  const [isPredefined, setIsPredefined] = useState(false);

 

  // — FETCH ROLE ON MOUNT —
  useEffect(() => {
    if (!id) return;

    (async () => {
      const user = getAuth().currentUser;
      if (!user) {
        toast.error('Admin not logged in');
        router.push('/boarding/employee');
        return;
      }

      let token;
      try {
        token = await user.getIdToken();
      } catch (err) {
        console.error('Error fetching token:', err);
        toast.error('Authentication error');
        router.push('/boarding/employee');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/roles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        setRole(data);
        setName(data.type_name);
        setCode(data.role_code);
        setIsPredefined(data.role_code <= 2);
      } catch (err) {
        toast.error('Role not found or you lack permissions');
        router.push('/boarding/employee');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);


  const save = async () => {
    if (isPredefined) {
      toast.error("Predefined roles cannot be modified.");
      return;
    }
    const user = getAuth().currentUser;
    if (!user) {
      toast.error('Admin not logged in');
      return;
    }
    let token;
    try {
      token = await user.getIdToken();
    } catch (err) {
      console.error('Error fetching token:', err);
      toast.error('Authentication error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type_name: name, role_code: Number(code) })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      toast.success('Role updated successfully');
      router.push('/boarding/employee');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Update failed');
    }
  };

  // — DELETE ROLE —
  const del = async () => {
    if (isPredefined) {
      toast.error("Predefined roles cannot be deleted.");
      return;
    }
    if (!confirm('Delete this role?')) return;

    const user = getAuth().currentUser;
    if (!user) {
      toast.error('Admin not logged in');
      return;
    }
    let token;
    try {
      token = await user.getIdToken();
    } catch (err) {
      console.error('Error fetching token:', err);
      toast.error('Authentication error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/roles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      toast.success('Role deleted');
      router.push('/boarding/employee');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Delete failed');
    }
  };

  if (!role) return <p className="min-h-screen flex items-center justify-center text-gray-500">Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Role #{id}</h1>

        {isPredefined && (
          <div className="flex items-center gap-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
            <AlertTriangle size={24} />
            <p>This is a predefined role and cannot be edited or deleted.</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 disabled:bg-gray-100"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isPredefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Code</label>
            <select
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 disabled:bg-gray-100"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={isPredefined}
            >
              {/* <option value={0}>Manager (0)</option> */}
              <option value={1}>On Production (1)</option>
              <option value={2}>Post Production (2)</option>
              <option value={3}>VFX Artist (3)</option>
              <option value={4}>Sound Engineer (4)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4">
          <button
            onClick={del}
            disabled={isPredefined}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={save}
            disabled={isPredefined}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Save
          </button>
          <button
            onClick={() => router.push('/boarding/employee')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}