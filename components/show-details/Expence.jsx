'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  FilePlus2,
  X,
  Edit3,
  Trash2,
  WalletCards,
  TrendingUp,
  Landmark,
  PiggyBank // A fun icon for the total
} from 'lucide-react';

// --- Helper Component for Category Badges (Updated for a slightly softer look) ---
const CategoryBadge = ({ category }) => {
  const colors = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-600',
    'Travel': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/20',
    'Personnel': 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 ring-1 ring-inset ring-sky-200 dark:ring-sky-500/20',
    'Equipment': 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 ring-1 ring-inset ring-fuchsia-200 dark:ring-fuchsia-500/20',
    'Post-Production': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-500/20',
    'Venue & Permits': 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-200 dark:ring-rose-500/20',
    'Software': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-500/20',
  };
  const colorClass = colors[category] || colors.default;
  return (<span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>{category}</span>);
};

// --- Helper Component for the Add/Edit Form Modal (Unchanged, already good) ---
const ExpenseFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({ productName: '', category: '', expense: '' });

  useEffect(() => {
    if (isOpen) {
        if (isEditing) setFormData({ productName: initialData.productName, category: initialData.category, expense: initialData.expense.toString() });
        else setFormData({ productName: '', category: '', expense: '' });
    }
  }, [initialData, isEditing, isOpen]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); if (formData.productName && formData.category && formData.expense) onSubmit(formData); else alert('Please fill all fields.'); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-300 dark:border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-slate-700">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 flex items-center"><FilePlus2 className="mr-3 text-purple-500" />{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Expense Item</label>
            <input id="productName" type="text" name="productName" value={formData.productName} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., Flight tickets for crew" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Category</label>
            <input id="category" type="text" name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., Travel, Personnel, Equipment" required />
          </div>
          <div>
            <label htmlFor="expense" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Amount (₹)</label>
            <input id="expense" type="number" name="expense" value={formData.expense} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., 15000.00" step="0.01" min="0" required />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity shadow-lg">{isEditing ? 'Update Expense' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- The Main Reusable Expence Component ---
export default function Expence({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense, sectionTitleStyles }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const totalExpenses = (expenses || []).reduce((total, expense) => total + expense.expense, 0);
  
  const closeForm = () => { setIsFormOpen(false); setEditingExpense(null); };
  const handleEdit = (expense) => { setEditingExpense(expense); setIsFormOpen(true); };
  const handleDelete = (id) => { if (confirm('Are you sure you want to delete this expense?')) { onDeleteExpense(id); } };

  const handleFormSubmit = (formData) => {
    if (editingExpense) onUpdateExpense({ ...formData, id: editingExpense.id, expense: parseFloat(formData.expense) });
    else onAddExpense(formData);
    closeForm();
  };

  return (
    <>
      <div className="md:flex justify-between items-center mb-8">
        <h3 className={sectionTitleStyles}>
          <TrendingUp className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400" />
          Project Expenses
        </h3>
        <button onClick={() => setIsFormOpen(true)} className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-0.5">
          <PlusCircle size={20} /> Add Expense
        </button>
      </div>

      <ExpenseFormModal isOpen={isFormOpen} onClose={closeForm} onSubmit={handleFormSubmit} initialData={editingExpense} />
        
      <div className="space-y-3">
        {/* Empty State */}
        {(expenses || []).length === 0 && (
          <div className="text-center py-16 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <WalletCards size={48} className="mx-auto text-slate-400 dark:text-slate-500" />
            <h4 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">No Expenses Logged</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click "Add Expense" to start tracking project costs.</p>
          </div>
        )}
        
        {/* Expenses List */}
        {(expenses || []).map((expense) => (
          <div key={expense.id} className="group grid grid-cols-6 gap-4 items-center bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transform transition-all duration-300 hover:-translate-y-1">
            {/* Item and Category */}
            <div className="col-span-6 sm:col-span-3">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{expense.productName}</p>
              <div className="mt-1.5">
                <CategoryBadge category={expense.category} />
              </div>
            </div>
            
            {/* Amount */}
            <div className="col-span-3 sm:col-span-2 text-left sm:text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">₹{expense.expense.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
            </div>
            
            {/* Actions (visible on hover) */}
            <div className="col-span-3 sm:col-span-1 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => handleEdit(expense)} title="Edit" className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(expense.id)} title="Delete" className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      {(expenses || []).length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-2xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-slate-300 flex items-center gap-3"><PiggyBank size={24} />Total Project Cost</h4>
              <p className="text-sm text-slate-400 mt-1">Sum of all recorded expenses for this project.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                ₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                across {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}