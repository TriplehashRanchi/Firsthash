// --- app/superadmin/coupons/page.jsx ---
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', valid_till: '', max_uses: '', plan_id: '', is_active: true });

  const config = { headers: { Authorization: `Bearer ${localStorage.getItem('superadmin_token')}` } };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/api/coupons`, config),
        axios.get(`${API_URL}/api/plans`, config),
      ]);
      setCoupons(cRes.data);
      setPlans(pRes.data);
    } catch (e) {
      setError('Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const reset = () => {
    setForm({ code: '', discount_type: 'percentage', discount_value: '', valid_till: '', max_uses: '', plan_id: '', is_active: true });
    setIsEditing(false);
    setEditingId(null);
  };

  const onEdit = (c) => {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      valid_till: c.valid_till.slice(0, 10),
      max_uses: c.max_uses,
      plan_id: c.plan_id,
      is_active: c.is_active,
    });
    setIsEditing(true);
    setEditingId(c.id);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!confirm('Deactivate?')) return;
    try { await axios.delete(`${API_URL}/api/coupons/${id}`, config); toast.success('Deactivated'); fetchAll(); }
    catch { toast.error('Fail'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, discount_value: parseFloat(form.discount_value), max_uses: parseInt(form.max_uses), plan_id: parseInt(form.plan_id) };
      if (isEditing) await axios.put(`${API_URL}/api/coupons/${editingId}`, payload, config);
      else await axios.post(`${API_URL}/api/coupons`, payload, config);
      toast.success(isEditing ? 'Updated' : 'Created');
      setShowForm(false);
      fetchAll();
    } catch { toast.error('Error'); }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl">Coupon Manager</h2>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-green-600 px-4 py-2 text-white rounded">Add Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
          {/* code, type, value, date, max, plan, active */}
          <input name="code" placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required className="border p-2 rounded" />
          <select name="discount_type" value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="border p-2 rounded">
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
          <input name="discount_value" type="number" placeholder="Value" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} required className="border p-2 rounded" />
          <input name="valid_till" type="date" value={form.valid_till} onChange={e => setForm({ ...form, valid_till: e.target.value })} required className="border p-2 rounded" />
          <input name="max_uses" type="number" placeholder="Max Uses" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} required className="border p-2 rounded" />
          <select name="plan_id" value={form.plan_id} onChange={e => setForm({ ...form, plan_id: e.target.value })} required className="border p-2 rounded">
            <option value="">Select Plan</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {isEditing && <label className="flex items-center space-x-2"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>}
          <div className="col-span-full flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{isEditing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      <table className="min-w-full bg-white">
        <thead><tr><th className="p-2 border-b">Code</th><th className="p-2 border-b">Type</th><th className="p-2 border-b">Value</th><th className="p-2 border-b">Valid Till</th><th className="p-2 border-b">Max</th><th className="p-2 border-b">Plan</th><th className="p-2 border-b">Status</th><th className="p-2 border-b">Actions</th></tr></thead>
        <tbody>
          {coupons.map(c => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="p-2 border-b">{c.code}</td>
              <td className="p-2 border-b">{c.discount_type}</td>
              <td className="p-2 border-b">{c.discount_value}</td>
              <td className="p-2 border-b">{new Date(c.valid_till).toLocaleDateString()}</td>
              <td className="p-2 border-b">{c.max_uses}</td>
              <td className="p-2 border-b">{plans.find(p => p.id === c.plan_id)?.name}</td>
              <td className="p-2 border-b">{c.is_active ? 'Active' : 'Inactive'}</td>
              <td className="p-2 border-b space-x-2">
                <button onClick={() => onEdit(c)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                <button onClick={() => onDelete(c.id)} className="px-2 py-1 bg-red-500 text-white rounded">Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
