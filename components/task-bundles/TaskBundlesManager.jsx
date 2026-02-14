'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Layers, ToggleLeft, ToggleRight, Loader2, X, Save } from 'lucide-react';
import {
    createTaskBundle,
    createTaskBundleItem,
    deleteTaskBundle,
    deleteTaskBundleItem,
    listTaskBundleItems,
    listTaskBundles,
    updateTaskBundle,
    updateTaskBundleItem,
} from '@/lib/taskBundlesApi';

const PRIORITIES = ['low', 'medium', 'high'];

const toBoolean = (value) => value === 1 || value === true;

const sortItems = (items = []) =>
    [...items].sort((a, b) => {
        const byOrder = (a.sort_order || 0) - (b.sort_order || 0);
        if (byOrder !== 0) return byOrder;
        return String(a.title || '').localeCompare(String(b.title || ''));
    });

const emptyBundleForm = { name: '', description: '', is_active: true };
const emptyItemForm = { title: '', priority: 'medium', due_in_days: '', sort_order: 1, parent_item_id: '' };

const ItemRow = ({ item, itemsById, onSave, onDelete }) => {
    const [draft, setDraft] = useState({
        title: item.title || '',
        priority: item.priority || 'medium',
        due_in_days: item.due_in_days ?? '',
        sort_order: item.sort_order ?? 1,
        parent_item_id: item.parent_item_id ?? '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDraft({
            title: item.title || '',
            priority: item.priority || 'medium',
            due_in_days: item.due_in_days ?? '',
            sort_order: item.sort_order ?? 1,
            parent_item_id: item.parent_item_id ?? '',
        });
    }, [item]);

    const handleSubmit = async () => {
        if (!draft.title.trim()) {
            alert('Item title is required.');
            return;
        }

        if (draft.parent_item_id && Number(draft.parent_item_id) === item.id) {
            alert('An item cannot be its own parent.');
            return;
        }

        if (draft.due_in_days !== '' && !Number.isInteger(Number(draft.due_in_days))) {
            alert('Due in days must be an integer or empty.');
            return;
        }

        const payload = {
            title: draft.title.trim(),
            priority: PRIORITIES.includes(draft.priority) ? draft.priority : 'medium',
            due_in_days: draft.due_in_days === '' ? null : Number(draft.due_in_days),
            sort_order: Number(draft.sort_order) || 0,
            parent_item_id: draft.parent_item_id === '' ? null : Number(draft.parent_item_id),
        };

        setSaving(true);
        try {
            await onSave(item.id, payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900/40">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                    value={draft.title}
                    onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                    className="md:col-span-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="Item title"
                />
                <select
                    value={draft.priority}
                    onChange={(e) => setDraft((prev) => ({ ...prev, priority: e.target.value }))}
                    className="md:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm capitalize"
                >
                    {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
                {/* <input
                    type="number"
                    value={draft.due_in_days}
                    onChange={(e) => setDraft((prev) => ({ ...prev, due_in_days: e.target.value }))}
                    className="md:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="Due days"
                /> */}
                <input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft((prev) => ({ ...prev, sort_order: e.target.value }))}
                    className="md:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="Sort order"
                />
                <select
                    value={draft.parent_item_id}
                    onChange={(e) => setDraft((prev) => ({ ...prev, parent_item_id: e.target.value }))}
                    className="md:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                    <option value="">No parent</option>
                    {Object.values(itemsById)
                        .filter((row) => row.id !== item.id)
                        .map((row) => (
                            <option key={row.id} value={row.id}>
                                {row.title}
                            </option>
                        ))}
                </select>
                 <div className="w-full md:w-[140px] flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-3 py-2 text-sm font-medium"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50 px-3 py-2 text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        
                    </button>
                </div>
            </div>
            <div className="mt-3 flex justify-end">
               
            </div>
            {item.parent_item_id ? <p className="mt-2 text-xs text-slate-500">Parent: {itemsById[item.parent_item_id]?.title || 'Unknown'}</p> : null}
        </div>
    );
};

const TaskBundlesManager = () => {
    const [bundles, setBundles] = useState([]);
    const [loadingBundles, setLoadingBundles] = useState(true);
    const [bundleForm, setBundleForm] = useState(emptyBundleForm);
    const [savingBundle, setSavingBundle] = useState(false);
    const [editingBundle, setEditingBundle] = useState(null);
    const [bundleModalOpen, setBundleModalOpen] = useState(false);

    const [itemsModalOpen, setItemsModalOpen] = useState(false);
    const [activeBundle, setActiveBundle] = useState(null);
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [newItem, setNewItem] = useState(emptyItemForm);
    const [savingNewItem, setSavingNewItem] = useState(false);

    const sortedBundles = useMemo(
        () =>
            [...bundles].sort((a, b) => {
                const activeDelta = Number(toBoolean(b.is_active)) - Number(toBoolean(a.is_active));
                if (activeDelta !== 0) return activeDelta;
                return String(a.name || '').localeCompare(String(b.name || ''));
            }),
        [bundles],
    );

    const itemsById = useMemo(() => Object.fromEntries(items.map((item) => [item.id, item])), [items]);

    const fetchBundles = useCallback(async () => {
        setLoadingBundles(true);
        try {
            const data = await listTaskBundles();
            setBundles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load task bundles:', error);
            alert(error.message || 'Could not load task bundles.');
        } finally {
            setLoadingBundles(false);
        }
    }, []);

    const fetchItemsForBundle = useCallback(async (bundleId) => {
        setLoadingItems(true);
        try {
            const data = await listTaskBundleItems(bundleId);
            setItems(sortItems(Array.isArray(data) ? data : []));
        } catch (error) {
            console.error('Failed to load bundle items:', error);
            alert(error.message || 'Could not load bundle items.');
        } finally {
            setLoadingItems(false);
        }
    }, []);

    useEffect(() => {
        fetchBundles();
    }, [fetchBundles]);

    const openCreateBundle = () => {
        setEditingBundle(null);
        setBundleForm(emptyBundleForm);
        setBundleModalOpen(true);
    };

    const openEditBundle = (bundle) => {
        setEditingBundle(bundle);
        setBundleForm({
            name: bundle.name || '',
            description: bundle.description || '',
            is_active: toBoolean(bundle.is_active),
        });
        setBundleModalOpen(true);
    };

    const closeBundleModal = () => {
        setBundleModalOpen(false);
        setEditingBundle(null);
        setBundleForm(emptyBundleForm);
    };

    const saveBundle = async () => {
        if (!bundleForm.name.trim()) {
            alert('Bundle name is required.');
            return;
        }

        setSavingBundle(true);
        try {
            const payload = {
                name: bundleForm.name.trim(),
                description: bundleForm.description.trim() || null,
                is_active: bundleForm.is_active,
            };

            if (editingBundle) {
                await updateTaskBundle(editingBundle.id, payload);
            } else {
                await createTaskBundle(payload);
            }

            closeBundleModal();
            await fetchBundles();
        } catch (error) {
            console.error('Failed to save task bundle:', error);
            alert(error.message || 'Could not save task bundle.');
        } finally {
            setSavingBundle(false);
        }
    };

    const handleToggleActive = async (bundle) => {
        try {
            await updateTaskBundle(bundle.id, { is_active: !toBoolean(bundle.is_active) });
            await fetchBundles();
        } catch (error) {
            console.error('Failed to update bundle status:', error);
            alert(error.message || 'Could not update bundle status.');
        }
    };

    const handleDeleteBundle = async (bundle) => {
        if (!window.confirm(`Delete "${bundle.name}" bundle?`)) return;
        try {
            await deleteTaskBundle(bundle.id);
            if (editingBundle?.id === bundle.id) {
                setEditingBundle(null);
                setBundleForm(emptyBundleForm);
            }
            await fetchBundles();
        } catch (error) {
            console.error('Failed to delete task bundle:', error);
            alert(error.message || 'Could not delete bundle.');
        }
    };

    const openItemsEditor = async (bundle) => {
        setActiveBundle(bundle);
        setItemsModalOpen(true);
        setNewItem(emptyItemForm);
        await fetchItemsForBundle(bundle.id);
    };

    const closeItemsEditor = () => {
        setItemsModalOpen(false);
        setActiveBundle(null);
        setItems([]);
    };

    const addBundleItem = async () => {
        if (!activeBundle) return;
        if (!newItem.title.trim()) {
            alert('Item title is required.');
            return;
        }
        if (newItem.due_in_days !== '' && !Number.isInteger(Number(newItem.due_in_days))) {
            alert('Due in days must be an integer or empty.');
            return;
        }

        setSavingNewItem(true);
        try {
            await createTaskBundleItem(activeBundle.id, {
                title: newItem.title.trim(),
                priority: PRIORITIES.includes(newItem.priority) ? newItem.priority : 'medium',
                due_in_days: newItem.due_in_days === '' ? null : Number(newItem.due_in_days),
                sort_order: Number(newItem.sort_order) || 0,
                parent_item_id: newItem.parent_item_id === '' ? null : Number(newItem.parent_item_id),
            });
            setNewItem((prev) => ({ ...emptyItemForm, sort_order: (Number(prev.sort_order) || 0) + 1 }));
            await fetchItemsForBundle(activeBundle.id);
            await fetchBundles();
        } catch (error) {
            console.error('Failed to add bundle item:', error);
            alert(error.message || 'Could not add bundle item.');
        } finally {
            setSavingNewItem(false);
        }
    };

    const saveItem = async (itemId, payload) => {
        if (!activeBundle) return;
        await updateTaskBundleItem(activeBundle.id, itemId, payload);
        await fetchItemsForBundle(activeBundle.id);
    };

    const removeItem = async (itemId) => {
        if (!activeBundle) return;
        if (!window.confirm('Delete this item?')) return;
        try {
            await deleteTaskBundleItem(activeBundle.id, itemId);
            await fetchItemsForBundle(activeBundle.id);
            await fetchBundles();
        } catch (error) {
            console.error('Failed to delete bundle item:', error);
            alert(error.message || 'Could not delete item.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Task Bundles</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Create reusable task templates and nested checklist items.</p>
                    </div>
                    <button
                        onClick={openCreateBundle}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Bundle
                    </button>
                </div>

                <div className="mt-6 space-y-3">
                    {loadingBundles ? (
                        <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                            Loading bundles...
                        </div>
                    ) : sortedBundles.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 dark:text-slate-400">No bundles created yet.</div>
                    ) : (
                        sortedBundles.map((bundle) => (
                            <div key={bundle.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{bundle.name}</h3>
                                            <span
                                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                    toBoolean(bundle.is_active)
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {toBoolean(bundle.is_active) ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bundle.description || 'No description provided.'}</p>
                                        <p className="text-xs text-slate-400 mt-1">{bundle.items_count || 0} items</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openItemsEditor(bundle)}
                                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                                        >
                                            <Layers className="w-3.5 h-3.5" />
                                            Manage Items
                                        </button>
                                        <button
                                            onClick={() => openEditBundle(bundle)}
                                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(bundle)}
                                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                                        >
                                            {toBoolean(bundle.is_active) ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                            {toBoolean(bundle.is_active) ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBundle(bundle)}
                                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {itemsModalOpen && activeBundle ? (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{activeBundle.name} Items</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Add and reorder root/sub-items for this bundle.</p>
                            </div>
                            <button
                                onClick={closeItemsEditor}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[calc(90vh-76px)] overflow-y-auto">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/70">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Add New Item</h4>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                    <input
                                        value={newItem.title}
                                        onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Title"
                                        className="md:col-span-5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    />
                                    <select
                                        value={newItem.priority}
                                        onChange={(e) => setNewItem((prev) => ({ ...prev, priority: e.target.value }))}
                                        className="md:col-span-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm capitalize"
                                    >
                                        {PRIORITIES.map((priority) => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={newItem.due_in_days}
                                        onChange={(e) => setNewItem((prev) => ({ ...prev, due_in_days: e.target.value }))}
                                        placeholder="Due days"
                                        className="md:col-span-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        value={newItem.sort_order}
                                        onChange={(e) => setNewItem((prev) => ({ ...prev, sort_order: e.target.value }))}
                                        placeholder="Order"
                                        className="md:col-span-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    />
                                    <select
                                        value={newItem.parent_item_id}
                                        onChange={(e) => setNewItem((prev) => ({ ...prev, parent_item_id: e.target.value }))}
                                        className="md:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                                    >
                                        <option value="">No parent</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={addBundleItem}
                                        disabled={savingNewItem}
                                        className="md:col-span-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-3 py-2 text-sm font-medium"
                                    >
                                        {savingNewItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add
                                    </button>
                                </div>
                            </div>

                            {loadingItems ? (
                                <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                                    Loading items...
                                </div>
                            ) : items.length === 0 ? (
                                <div className="py-10 text-center text-slate-500 dark:text-slate-400">No items yet. Add your first template task above.</div>
                            ) : (
                                <div className="space-y-3">
                                    {sortItems(items).map((item) => (
                                        <ItemRow key={item.id} item={item} itemsById={itemsById} onSave={saveItem} onDelete={removeItem} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {bundleModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 ">
                    <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/90 shadow-[0_18px_45px_rgba(15,23,42,0.22)]">

                        <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-r from-indigo-50/50 via-white/60 to-cyan-50/45 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                    {editingBundle ? 'Edit Bundle' : 'New Bundle'}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">Create reusable task templates and nested checklist items.</p>
                            </div>
                            <button
                                onClick={closeBundleModal}
                                disabled={savingBundle}
                                className="p-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 disabled:opacity-50 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <input
                                    value={bundleForm.name}
                                    onChange={(e) => setBundleForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Bundle name"
                                    className="md:col-span-5 rounded-xl border border-slate-300/90 dark:border-slate-600 bg-white/80 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                                />
                                <input
                                    value={bundleForm.description}
                                    onChange={(e) => setBundleForm((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description (optional)"
                                    className="md:col-span-5 rounded-xl border border-slate-300/90 dark:border-slate-600 bg-white/80 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                                />
                                <label className="md:col-span-2 inline-flex items-center gap-2 rounded-xl border border-slate-300/90 dark:border-slate-600 bg-white/80 dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={bundleForm.is_active}
                                        onChange={(e) => setBundleForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    Active
                                </label>
                            </div>
                            {editingBundle ? (
                                <p className="text-xs text-slate-500">
                                    Editing: <span className="font-medium">{editingBundle.name}</span>
                                </p>
                            ) : null}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={closeBundleModal}
                                    disabled={savingBundle}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveBundle}
                                    disabled={savingBundle}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                                >
                                    {savingBundle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default TaskBundlesManager;
