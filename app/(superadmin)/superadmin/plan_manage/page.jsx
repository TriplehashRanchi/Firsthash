'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL of your API (adjust if needed)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function PlanManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration_days: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  // Authentication header (ensure token is stored in localStorage under this key)
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`,
    },
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/plans`);
      setPlans(res.data);
    } catch (err) {
      setError('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setFormData({ name: '', price: '', duration_days: '' });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
    });
    setIsEditing(true);
    setEditingPlanId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this plan?')) return;
    try {
      await axios.delete(`${API_URL}/api/plans/${id}`, config);
      toast.success('Plan deactivated');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to deactivate plan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days, 10),
      };
      if (isEditing) {
        await axios.put(
          `${API_URL}/api/plans/${editingPlanId}`,
          payload,
          config
        );
        toast.success('Plan updated');
      } else {
        await axios.post(
          `${API_URL}/api/plans`,
          payload,
          config
        );
        toast.success('Plan created');
      }
      setShowForm(false);
      fetchPlans();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  if (loading) return <div>Loading plans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Plan Manager</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Plan Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              name="duration_days"
              placeholder="Duration (days)"
              value={formData.duration_days}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {isEditing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Duration (days)</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{plan.name}</td>
              <td className="py-2 px-4 border-b">{plan.price}</td>
              <td className="py-2 px-4 border-b">{plan.duration_days}</td>
              <td className="py-2 px-4 border-b space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
