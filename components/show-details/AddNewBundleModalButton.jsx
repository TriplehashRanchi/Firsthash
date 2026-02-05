'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { createTaskBundle, createTaskBundleItem } from '@/lib/taskBundlesApi';

const emptyItem = () => ({ title: '', priority: 'medium', due_in_days: '', sort_order: 0 });

const AddNewBundleModalButton = ({ onCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        is_active: true,
    });
    const [items, setItems] = useState([emptyItem()]);

    const closeModal = () => {
        setIsOpen(false);
        setForm({ name: '', description: '', is_active: true });
        setItems([emptyItem()]);
    };

    const addItemRow = () => {
        setItems((prev) => [...prev, { ...emptyItem(), sort_order: prev.length }]);
    };

    const removeItemRow = (index) => {
        setItems((prev) => {
            const next = prev.filter((_, idx) => idx !== index);
            return next.length ? next : [emptyItem()];
        });
    };

    const updateItem = (index, patch) => {
        setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            alert('Bundle name is required.');
            return;
        }

        const validItems = items.map((item, idx) => ({ ...item, sort_order: idx })).filter((item) => item.title.trim() !== '');

        if (validItems.length === 0) {
            alert('Please add at least one item.');
            return;
        }

        setSaving(true);
        try {
            const bundle = await createTaskBundle({
                name: form.name.trim(),
                description: form.description.trim() || null,
                is_active: !!form.is_active,
            });

            if (!bundle?.id) {
                throw new Error('Bundle was created, but ID was missing. Please refresh and try again.');
            }

            await Promise.all(
                validItems.map((item) =>
                    createTaskBundleItem(bundle.id, {
                        title: item.title.trim(),
                        priority: 'medium',
                        due_in_days: null,
                        sort_order: Number(item.sort_order) || 0,
                        parent_item_id: null,
                    }),
                ),
            );

            if (typeof onCreated === 'function') {
                await onCreated();
            }
            closeModal();
        } catch (error) {
            console.error('Failed to create task bundle:', error);
            alert(error.message || 'Could not create bundle.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-indigo-200 text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
            >
                <Plus size={14} />
                Add New Bundle
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Create Task Bundle</h3>
                            <button onClick={closeModal} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <div className="md:col-span-5">
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Bundle Name</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Pre-wedding Standard"
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional"
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-end">
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 pb-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bundle Items</p>
                                    <button
                                        onClick={addItemRow}
                                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
                                    >
                                        <Plus size={12} /> Add Item
                                    </button>
                                </div>

                                <div className="p-3 space-y-2">
                                    {items.map((item, index) => (
                                        <div key={`item-${index}`} className="grid grid-cols-12 gap-2 items-center">
                                            <input
                                                value={item.title}
                                                onChange={(e) => updateItem(index, { title: e.target.value })}
                                                placeholder={`Item ${index + 1} title`}
                                                className="col-span-6 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm"
                                            />
                                            {/* <select
                                                value={item.priority}
                                                onChange={(e) => updateItem(index, { priority: e.target.value })}
                                                className="col-span-3 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.due_in_days}
                                                onChange={(e) => updateItem(index, { due_in_days: e.target.value })}
                                                placeholder="Due days"
                                                className="col-span-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
                                            /> */}
                                            <button
                                                onClick={() => removeItemRow(index)}
                                                className="col-span-1 inline-flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-800 text-rose-500 py-2"
                                                title="Remove item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white"
                            >
                                {saving ? 'Creating...' : 'Create Bundle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddNewBundleModalButton;
