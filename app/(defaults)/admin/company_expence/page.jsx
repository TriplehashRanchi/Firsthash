'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CalendarDays,
    Eye,
    FileText,
    IndianRupee,
    Loader2,
    Pencil,
    PlusCircle,
    Search,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const today = () => new Date().toISOString().split('T')[0];

const initialForm = {
    product_name: '',
    rupees: '',
    purchase_date: today(),
    notes: '',
};

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

async function getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Please sign in again to continue.');
    }
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}

function ExpenseModal({
    open,
    mode,
    form,
    onChange,
    onClose,
    onSubmit,
    saving,
    companyName,
    error,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {mode === 'edit' ? 'Edit Company Expense' : 'Add Company Expense'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fill the expense details and save. The modal closes after a successful submit.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
                    {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Company Name</label>
                        <input
                            type="text"
                            value={companyName || ''}
                            disabled
                            className="form-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800"
                        />
                    </div>

                    <div>
                        <label htmlFor="product_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Product Name
                        </label>
                        <input
                            id="product_name"
                            name="product_name"
                            type="text"
                            value={form.product_name}
                            onChange={onChange}
                            className="form-input"
                            placeholder="Laptop stand, office rent, printer ink"
                            maxLength={255}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="rupees" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Rupees
                            </label>
                            <input
                                id="rupees"
                                name="rupees"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.rupees}
                                onChange={onChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="purchase_date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Purchase Date
                            </label>
                            <input
                                id="purchase_date"
                                name="purchase_date"
                                type="date"
                                value={form.purchase_date}
                                onChange={onChange}
                                className="form-input"
                                max={today()}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={onChange}
                            className="form-textarea min-h-[140px]"
                            placeholder="Optional vendor details, reason, approval note"
                            maxLength={5000}
                        />
                        <div className="mt-1 text-right text-xs text-slate-400">{form.notes.length}/5000</div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="btn btn-outline-primary">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                            {mode === 'edit' ? 'Update Expense' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ExpenseViewModal({ open, record, onClose }) {
    if (!open || !record) return null;

    const fields = [
        { label: 'Company Name', value: record.company_name || '-' },
        { label: 'Product Name', value: record.product_name || '-' },
        { label: 'Amount', value: formatCurrency(record.rupees) },
        { label: 'Purchase Date', value: formatDate(record.purchase_date) },
        { label: 'Created By', value: record.created_by_name || '-' },
        { label: 'Notes', value: record.notes || '-' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expense Details</h2>
                        <p className="mt-1 text-sm text-slate-500">View the full Company expense record.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
                    {fields.map((field) => (
                        <div key={field.label} className={field.label === 'Notes' ? 'md:col-span-2' : ''}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                            <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <div className="whitespace-pre-wrap break-words">{field.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-5 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="btn btn-outline-primary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PersonalExpensePage() {
    const { company, currentUser, loading: authLoading } = useAuth();
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [pageError, setPageError] = useState('');
    const [modalError, setModalError] = useState('');

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            setPageError('');
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/personal-expenses`, { headers });
            setRecords(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setRecords([]);
            setPageError(err.response?.data?.error || err.message || 'Failed to load company expenses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && currentUser) {
            loadRecords();
        }
        if (!authLoading && !currentUser) {
            setLoading(false);
            setRecords([]);
            setPageError('Please sign in to manage company expenses.');
        }
    }, [authLoading, currentUser, loadRecords]);

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return records;

        return records.filter((record) =>
            [record.company_name, record.product_name, record.notes, record.created_by_name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [records, search]);

    const totalAmount = useMemo(() => records.reduce((sum, item) => sum + Number(item.rupees || 0), 0), [records]);

    const monthKey = new Date().toISOString().slice(0, 7);
    const monthlyAmount = useMemo(
        () =>
            records.reduce((sum, item) => {
                if (String(item.purchase_date || '').slice(0, 7) !== monthKey) return sum;
                return sum + Number(item.rupees || 0);
            }, 0),
        [records, monthKey]
    );

    const closeModal = () => {
        if (saving) return;
        setModalMode(null);
        setEditingId(null);
        setModalError('');
        setForm(initialForm);
    };

    const openAddModal = () => {
        setModalError('');
        setEditingId(null);
        setForm(initialForm);
        setModalMode('add');
    };

    const openEditModal = (record) => {
        setModalError('');
        setViewingRecord(null);
        setEditingId(record.id);
        setForm({
            product_name: record.product_name || '',
            rupees: record.rupees ?? '',
            purchase_date: record.purchase_date ? String(record.purchase_date).split('T')[0] : today(),
            notes: record.notes || '',
        });
        setModalMode('edit');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!company?.id) return 'Company details are not loaded yet. Try again in a moment.';

        const productName = form.product_name.trim();
        const rupeesValue = Number(form.rupees);
        const purchaseDate = form.purchase_date;
        const notesValue = form.notes.trim();

        if (!productName) return 'Product name is required.';
        if (productName.length > 255) return 'Product name must be 255 characters or less.';
        if (!Number.isFinite(rupeesValue) || rupeesValue <= 0) return 'Rupees must be greater than zero.';
        if (!purchaseDate) return 'Purchase date is required.';
        if (purchaseDate > today()) return 'Purchase date cannot be in the future.';
        if (notesValue.length > 5000) return 'Notes must be 5000 characters or less.';

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setModalError(validationError);
            return;
        }

        try {
            setSaving(true);
            setModalError('');
            setPageError('');

            const payload = {
                product_name: form.product_name.trim(),
                rupees: Number(form.rupees),
                purchase_date: form.purchase_date,
                notes: form.notes.trim(),
            };
            const headers = await getAuthHeaders();

            if (editingId) {
                const response = await axios.put(`${API_URL}/api/personal-expenses/${editingId}`, payload, { headers });
                setRecords((prev) => prev.map((item) => (item.id === editingId ? response.data : item)));
                toast.success('Expense updated');
            } else {
                const response = await axios.post(`${API_URL}/api/personal-expenses`, payload, { headers });
                setRecords((prev) => [response.data, ...prev]);
                toast.success('Expense added');
            }

            closeModal();
        } catch (err) {
            setModalError(err.response?.data?.error || err.message || 'Failed to save company expense.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this company expense?')) return;

        try {
            setPageError('');
            const headers = await getAuthHeaders();
            await axios.delete(`${API_URL}/api/personal-expenses/${id}`, { headers });
            setRecords((prev) => prev.filter((item) => item.id !== id));
            if (viewingRecord?.id === id) {
                setViewingRecord(null);
            }
            toast.success('Expense deleted');
        } catch (err) {
            setPageError(err.response?.data?.error || err.message || 'Failed to delete company expense.');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <ul className="mb-2 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/admin/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
                            Dashboard
                        </Link>
                    </li>
                    <li className="text-gray-500 before:mr-2 before:content-['/'] dark:text-gray-500">
                        <span className="text-gray-600 dark:text-gray-400">Company Expense</span>
                    </li>
                </ul>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                            <Wallet className="text-emerald-500" />
                            Company Expense
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Add Your company expense & manage your expenses with ease.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        {/* <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-200">
                            <span className="font-semibold">Company Name:</span> {company?.name || 'Loading...'}
                        </div> */}
                        <button
                            type="button"
                            onClick={openAddModal}
                            disabled={!company?.id}
                            className="btn btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Expense
                        </button>
                    </div>
                </div>
            </div>

            {pageError ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div> : null}

            {loading ? (
                <div className="panel flex min-h-[240px] items-center justify-center text-gray-500">
                    <Loader2 className="mr-3 animate-spin" />
                    Loading Company expenses...
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="panel border border-slate-200/70">
                            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <IndianRupee className="h-4 w-4 text-emerald-500" />
                                Total Spend
                            </p>
                            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="panel border border-slate-200/70">
                            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <CalendarDays className="h-4 w-4 text-blue-500" />
                                This Month
                            </p>
                            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyAmount)}</p>
                        </div>
                        <div className="panel border border-slate-200/70">
                            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <FileText className="h-4 w-4 text-violet-500" />
                                Records
                            </p>
                            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{records.length}</p>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Expense List</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Add new expense from the button above. Use view for quick details and edit for changes.
                                </p>
                            </div>

                            <div className="relative w-full lg:w-[320px]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search product, company, creator..."
                                    className="form-input pl-10"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/70">
                                    <tr className="text-left text-slate-600 dark:text-slate-300">
                                        {/* <th className="p-3 font-semibold">Company Name</th> */}
                                        <th className="p-3 font-semibold">Product Name</th>
                                        <th className="p-3 font-semibold">Rupees</th>
                                        <th className="p-3 font-semibold">Purchase Date</th>
                                        <th className="p-3 font-semibold">Notes</th>
                                        <th className="p-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length ? (
                                        filteredRecords.map((record) => (
                                            <tr key={record.id} className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40">
                                                {/* <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{record.company_name || '-'}</td> */}
                                                <td className="p-3 font-medium text-slate-900 dark:text-white">{record.product_name}</td>
                                                <td className="p-3 font-semibold text-emerald-600">{formatCurrency(record.rupees)}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-300">{formatDate(record.purchase_date)}</td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{record.notes}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingRecord(record)}
                                                            className="btn btn-outline-info btn-sm"
                                                            title="View expense"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(record)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Edit expense"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(record.id)}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Delete expense"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-slate-500">
                                                {search ? 'No company expense records match your search.' : 'No company expense records found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <ExpenseModal
                open={modalMode === 'add' || modalMode === 'edit'}
                mode={modalMode}
                form={form}
                onChange={handleChange}
                onClose={closeModal}
                onSubmit={handleSubmit}
                saving={saving}
                companyName={company?.name}
                error={modalError}
            />

            <ExpenseViewModal open={!!viewingRecord} record={viewingRecord} onClose={() => setViewingRecord(null)} />
        </div>
    );
}
