'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    FileText,
    Filter,
    IndianRupee,
    Loader2,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Printer,
    Receipt,
    Search,
    Trash2,
    Upload,
    WalletCards,
    X,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const GST_OPTIONS = [
    { value: 'with_gst', label: 'With GST' },
    { value: 'without_gst', label: 'Without GST' },
];

const TAX_OPTIONS = [
    { label: 'GST 0%', rate: 0 },
    { label: 'GST 5%', rate: 5 },
    { label: 'GST 12%', rate: 12 },
    { label: 'GST 18%', rate: 18 },
    { label: 'GST 28%', rate: 28 },
];

const today = () => new Date().toISOString().split('T')[0];

const createInitialForm = () => ({
    expense_date: today(),
    title: '',
    category_id: '',
    category_name_input: '',
    currency_code: 'INR',
    amount: '',
    expense_type: 'services',
    code_value: '',
    gst_treatment: 'with_gst',
    gst_number: '',
    source_supply_state_code: '',
    destination_supply_state_code: '',
    reverse_charge: false,
    tax_rate: '',
    tax_name: '',
    amount_is: 'exclusive',
    invoice_number: '',
    notes: '',
    party_id: '',
    customer_name: '',
    receipts: [],
});

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateForTable(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
}

function formatLabel(value) {
    if (!value) return '-';
    return String(value)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatTaxLabel(taxName, taxRate) {
    const cleanedName =
        typeof taxName === 'string'
            ? taxName
                  .replace(/\s*\[\s*\d+(?:\.\d+)?%\s*\]\s*/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
            : '';

    if (cleanedName) {
        return cleanedName;
    }

    if (taxRate !== null && taxRate !== undefined && taxRate !== '') {
        return `GST ${taxRate}%`;
    }

    return '-';
}

function toInputDate(value) {
    if (!value) return today();
    return String(value).split('T')[0];
}

function toPositiveNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function formatFileSize(bytes) {
    const numeric = Number(bytes || 0);
    return `${(numeric / (1024 * 1024)).toFixed(2)} MB`;
}

function isImageReceipt(receipt) {
    const mimeType = receipt?.mime_type || receipt?.file?.type || '';
    const fileName = receipt?.name || receipt?.file_name || '';
    return mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(fileName);
}

function isPdfReceipt(receipt) {
    const mimeType = receipt?.mime_type || receipt?.file?.type || '';
    const fileName = receipt?.name || receipt?.file_name || '';
    return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName);
}

function getReceiptPreviewUrl(receipt) {
    return receipt?.preview_url || receipt?.file_url || null;
}

async function uploadReceiptFiles(receipts, headers) {
    const uploadedReceipts = [];

    for (const receipt of receipts) {
        if (!receipt?.file) {
            uploadedReceipts.push({
                file_name: receipt.name,
                file_url: receipt.file_url,
                mime_type: receipt.mime_type || null,
                file_size: receipt.size || 0,
            });
            continue;
        }

        const formData = new FormData();
        formData.append('file', receipt.file);
        formData.append('uploadType', 'receipts');

        const response = await axios.post(`${API_URL}/api/uploads`, formData, { headers });

        uploadedReceipts.push({
            file_name: response.data.originalFileName || receipt.name,
            file_url: response.data.url,
            mime_type: response.data.mimeType || receipt.file.type || null,
            file_size: response.data.sizeInBytes || receipt.size || 0,
        });
    }

    return uploadedReceipts;
}

function ReceiptPreviewCard({ receipt, removable = false, onRemove = null, clickable = false }) {
    const isImage = isImageReceipt(receipt);
    const isPdf = isPdfReceipt(receipt);
    const previewUrl = isImage ? getReceiptPreviewUrl(receipt) : null;
    const fileName = receipt?.name || receipt?.file_name || 'Attachment';
    const fileUrl = receipt?.file_url || previewUrl;

    const content = (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex min-h-[155px] items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
                {isImage && previewUrl ? (
                    <img src={previewUrl} alt={fileName} className="max-h-[135px] rounded-xl object-contain" />
                ) : isPdf ? (
                    <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-500">PDF</div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary dark:bg-slate-800">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">File</div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{fileName}</div>
                    <div className="text-xs text-slate-500">{formatFileSize(receipt?.size || receipt?.file_size || 0)}</div>
                </div>
                {removable && onRemove ? (
                    <button type="button" onClick={onRemove} className="rounded-full p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                    </button>
                ) : clickable && fileUrl ? (
                    <ChevronRight className="h-4 w-4 flex-none text-slate-400" />
                ) : null}
            </div>
        </div>
    );

    if (clickable && fileUrl) {
        return (
            <a href={fileUrl} target="_blank" rel="noreferrer" className="block">
                {content}
            </a>
        );
    }

    return content;
}

async function getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Please sign in again to continue.');
    }

    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}

function FieldLabel({ children, required = false }) {
    return (
        <label className={`pt-2 text-[13px] font-medium ${required ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
            {children}
            {required ? <span>*</span> : null}
        </label>
    );
}

function RadioCard({ checked, onChange, label }) {
    return (
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-900 dark:text-white">
            <input type="radio" checked={checked} onChange={onChange} className="h-4.5 w-4.5 border-slate-300 text-primary focus:ring-primary" />
            <span>{label}</span>
        </label>
    );
}

function ReceiptUploader({ receipts, setForm }) {
    const inputRef = useRef(null);

    const addFiles = (files) => {
        const nextReceipts = Array.from(files || []).map((file) => ({
            id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
            file,
            name: file.name,
            size: file.size,
            preview_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));

        setForm((prev) => ({
            ...prev,
            receipts: [...prev.receipts, ...nextReceipts],
        }));
    };

    const removeReceipt = (receiptId) => {
        setForm((prev) => ({
            ...prev,
            receipts: prev.receipts.filter((receipt) => {
                if (receipt.id === receiptId && receipt.preview_url) {
                    URL.revokeObjectURL(receipt.preview_url);
                }

                return receipt.id !== receiptId;
            }),
        }));
    };

    return (
        <div className="space-y-3">
            <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();
                    addFiles(event.dataTransfer.files);
                }}
                className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary dark:bg-slate-800">
                    <Receipt className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Drag or Drop your Receipts</h3>
                <p className="mt-1.5 text-xs text-slate-500">Maximum file size allowed is 10MB</p>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 inline-flex items-center gap-2.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                    <Upload className="h-4.5 w-4.5" />
                    Upload your Files
                    <ChevronDown className="h-4 w-4 opacity-60" />
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = '';
                    }}
                />
            </div>

            {receipts.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900">
                    <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Attached receipts</p>
                    <div className="grid gap-3">
                        {receipts.map((receipt) => (
                            <ReceiptPreviewCard key={receipt.id} receipt={receipt} removable onRemove={() => removeReceipt(receipt.id)} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function CategorySelect({ categories, selectedCategoryId, inputValue, onInputChange, onSelect, onCreateCategory, createLoading = false, createError = '' }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    const selectedCategory = categories.find((category) => category.id === selectedCategoryId) || null;

    useEffect(() => {
        setSearch(inputValue ?? selectedCategory?.name ?? '');
    }, [inputValue, selectedCategory]);

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return [];

        return categories.filter((category) => [category.name, category.description].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
    }, [categories, search]);
    const trimmedSearch = search.trim();
    const canCreateCategory = trimmedSearch && !categories.some((category) => category.name?.trim().toLowerCase() === trimmedSearch.toLowerCase());
    const showDropdown = open && (filteredCategories.length > 0 || Boolean(createError));

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onFocus={() => setOpen(true)}
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setSearch(nextValue);
                            onInputChange(nextValue);
                            setOpen(true);

                            if (!selectedCategory || nextValue.trim() !== selectedCategory.name) {
                                onSelect(null);
                            }
                        }}
                        className="form-input h-11 rounded-none border-0 text-sm"
                        placeholder="Search or add category"
                    />
                </div>
            </div>

            {showDropdown ? (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950">
                    {createError ? <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div> : null}

                    {filteredCategories.length ? (
                        <div className="max-h-[260px] overflow-y-auto py-2">
                            {filteredCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(category);
                                        onInputChange(category.name || '');
                                        setSearch(category.name || '');
                                        setOpen(false);
                                    }}
                                    className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    <div className="font-medium">{category.name}</div>
                                    {category.description ? <div className="mt-1 text-xs text-slate-400">{category.description}</div> : null}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function DetailRow({ label, value, fullWidth = false }) {
    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
            <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <div className="whitespace-pre-wrap break-words">{value || '-'}</div>
            </div>
        </div>
    );
}

function ExpenseViewDrawer({ record, loading, onClose, onEdit }) {
    const categoryLabel = record?.category_name || '';
    const titleLabel = record?.title || '';
    const hasTax = Boolean(record?.tax_name) || (record?.tax_rate !== null && record?.tax_rate !== undefined && record?.tax_rate !== '');
    const hasTaxAmount = record?.tax_amount !== null && record?.tax_amount !== undefined && Number(record.tax_amount) > 0;
    const taxDisplay = hasTax ? formatTaxLabel(record?.tax_name, record?.tax_rate) : '';
    const taxAmountDisplay = hasTaxAmount ? `${formatCurrency(record.tax_amount)} ( ${formatLabel(record?.amount_is || '')} )` : '';
    const hasAttachments = Array.isArray(record?.attachments) && record.attachments.length > 0;
    const baseAmount = record?.subtotal !== null && record?.subtotal !== undefined ? Number(record.subtotal) : Number(record.total_amount || 0) - Number(record.tax_amount || 0);
    const totalAmount = Number(record?.total_amount || 0);

    return (
        <div className="fixed inset-0 z-[120]">
            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-[700px] overflow-hidden bg-white shadow-2xl dark:bg-slate-950">
                <div className="flex h-full flex-col">
                    {/* Header + Action bar combined */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-2 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Expense Details</h2>
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                            <button
                                type="button"
                                onClick={() => record && onEdit(record)}
                                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex min-h-[260px] items-center justify-center text-slate-500">
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Loading expense details...
                            </div>
                        ) : record ? (
                            <div>
                                {/* Content */}
                                <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                                    {/* Left column */}
                                    <div className="space-y-5">
                                        {/* Expense Amount header */}
                                        <div>
                                            <div className="text-xs font-medium text-slate-400">Expense Amount</div>
                                            <div className="mt-1 flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-red-500">{formatCurrency(totalAmount)}</span>
                                                <span className="text-sm text-slate-400">on {formatDateForTable(record.expense_date)}</span>
                                            </div>
                                            {hasTaxAmount ? (
                                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                                    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                                                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Actual Amount</div>
                                                        <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(baseAmount)}</div>
                                                    </div>
                                                    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                                                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">GST Amount</div>
                                                        <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(record.tax_amount || 0)}</div>
                                                    </div>
                                                    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                                                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total Amount</div>
                                                        <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(totalAmount)}</div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Title and category */}
                                        {titleLabel || categoryLabel ? (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {titleLabel ? (
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-400">Title</div>
                                                        <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{titleLabel}</div>
                                                    </div>
                                                ) : null}

                                                {categoryLabel ? (
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-400">Category</div>
                                                        <div className="mt-1">
                                                            <span className="inline-block rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                                {categoryLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {/* Detail rows */}
                                        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                                            {hasTax ? (
                                                <div className="sm:col-span-2">
                                                    <div className="text-xs font-medium text-slate-400">Tax</div>
                                                    <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{taxDisplay}</div>
                                                </div>
                                            ) : null}

                                            {hasTaxAmount ? (
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400">Tax Amount</div>
                                                    <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{taxAmountDisplay}</div>
                                                </div>
                                            ) : null}

                                            <div>
                                                <div className="text-xs font-medium text-slate-400">Ref #</div>
                                                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{record.invoice_number || '-'}</div>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <div className="text-xs font-medium text-slate-400">GST Treatment</div>
                                                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{formatLabel(record.gst_treatment)}</div>
                                            </div>

                                            {record.gst_number ? (
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400">GSTIN / UIN</div>
                                                    <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{record.gst_number}</div>
                                                </div>
                                            ) : null}

                                            {record.notes ? (
                                                <div className="sm:col-span-2">
                                                    <div className="text-xs font-medium text-slate-400">Notes</div>
                                                    <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-100">{record.notes}</div>
                                                </div>
                                            ) : null}

                                            {record.party_name ? (
                                                <div className="sm:col-span-2">
                                                    <div className="text-xs font-medium text-slate-400">Vender Name</div>
                                                    <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{record.party_name}</div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Right column - Receipt area */}
                                    <div>
                                        {hasAttachments ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-xs font-medium text-slate-400">Receipts</div>
                                                    <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                                                        {record.attachments.length} file{record.attachments.length > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                                <div className="grid gap-3">
                                                    {record.attachments.map((attachment) => (
                                                        <ReceiptPreviewCard key={attachment.id} receipt={attachment} clickable />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center dark:border-slate-700 dark:bg-slate-900">
                                                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-slate-800">
                                                    <Receipt className="h-5 w-5" />
                                                </div>
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No receipts uploaded</h4>
                                                <p className="mt-1 text-xs text-slate-400">Images and PDFs will appear here once attached.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[260px] items-center justify-center text-slate-500">Expense details not available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExpenseDrawer({ mode, form, setForm, categories, parties, saving, error, onCancel, onSave, onSaveAndNew, onQuickAddParty, onCreateCategory, categorySaving, categoryError }) {
    const selectedCategory = categories.find((category) => category.id === form.category_id) || null;
    const codeLabel = form.expense_type === 'services' ? 'SAC' : 'HSN';
    const filteredParties = useMemo(() => {
        const query = form.customer_name?.trim().toLowerCase();
        if (!query) return parties.slice(0, 6);

        return parties.filter((party) => party.name?.toLowerCase().includes(query)).slice(0, 6);
    }, [parties, form.customer_name]);

    const updateField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const hasGst = form.gst_treatment === 'with_gst';

    const handleGstTreatmentChange = (value) => {
        setForm((prev) => ({
            ...prev,
            gst_treatment: value,
            gst_number: value === 'with_gst' ? prev.gst_number : '',
            tax_rate: value === 'with_gst' ? prev.tax_rate : '',
            tax_name: value === 'with_gst' ? prev.tax_name : '',
            amount_is: value === 'with_gst' ? prev.amount_is : 'exclusive',
        }));
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" onClick={onCancel} />
            <div className="absolute right-0 top-0 h-full w-full max-w-[1180px] overflow-hidden bg-white shadow-2xl dark:bg-slate-950">
                <div className="flex h-full flex-col">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-[28px] font-bold text-slate-900 dark:text-white">{mode === 'edit' ? 'Edit Expense' : 'Record Expense'}</h2>
                            <p className="mt-1 text-sm text-slate-500">Record taxable and non-billable business expenses.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex h-11 w-11 items-center justify-center self-start rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {error ? <div className="mx-7 mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

                    <div className="flex-1 overflow-y-auto">
                        <div className="grid gap-7 px-7 py-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-7">
                                <div className="grid gap-y-4 md:grid-cols-[170px_minmax(0,1fr)] md:gap-x-8">
                                    <FieldLabel required>Date</FieldLabel>
                                    <input
                                        type="date"
                                        value={form.expense_date}
                                        max={today()}
                                        onChange={(event) => updateField('expense_date', event.target.value)}
                                        className="form-input h-11 rounded-xl text-sm"
                                    />

                                    <FieldLabel required>Title</FieldLabel>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(event) => updateField('title', event.target.value)}
                                        className="form-input h-11 rounded-xl text-sm"
                                        placeholder="e.g. Laptop purchase"
                                    />

                                    <FieldLabel required>Category</FieldLabel>
                                    <div className="space-y-3">
                                        <CategorySelect
                                            categories={categories}
                                            selectedCategoryId={form.category_id}
                                            inputValue={form.category_name_input}
                                            onInputChange={(value) => updateField('category_name_input', value)}
                                            onSelect={(category) => {
                                                if (!category) {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        category_id: '',
                                                    }));
                                                    return;
                                                }

                                                setForm((prev) => ({
                                                    ...prev,
                                                    category_id: category.id,
                                                    category_name_input: category.name || '',
                                                    expense_type: category.default_type || prev.expense_type,
                                                }));
                                            }}
                                            onCreateCategory={onCreateCategory}
                                            createLoading={categorySaving}
                                            createError={categoryError}
                                        />
                                    </div>

                                    <FieldLabel required>Amount</FieldLabel>
                                    <div className="grid grid-cols-[72px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                        <select
                                            value={form.currency_code}
                                            onChange={(event) => updateField('currency_code', event.target.value)}
                                            className="border-0 border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <option value="INR">INR</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(event) => updateField('amount', event.target.value)}
                                            className="form-input h-11 rounded-none border-0 text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                                    <div className="grid gap-y-4 md:grid-cols-[170px_minmax(0,1fr)] md:gap-x-8">
                                        <FieldLabel required>Expense Type</FieldLabel>
                                        <div className="flex flex-wrap gap-6 pt-1.5">
                                            <RadioCard checked={form.expense_type === 'goods'} onChange={() => updateField('expense_type', 'goods')} label="Goods" />
                                            <RadioCard checked={form.expense_type === 'services'} onChange={() => updateField('expense_type', 'services')} label="Services" />
                                        </div>

                                        <FieldLabel>{codeLabel}</FieldLabel>
                                        <input
                                            type="text"
                                            value={form.code_value}
                                            onChange={(event) => updateField('code_value', event.target.value)}
                                            className="form-input h-11 rounded-xl text-sm"
                                            placeholder={codeLabel}
                                        />

                                        <FieldLabel required>GST</FieldLabel>
                                        <div className="flex flex-wrap gap-6 pt-1.5">
                                            <RadioCard checked={hasGst} onChange={() => handleGstTreatmentChange('with_gst')} label="With GST" />
                                            <RadioCard checked={form.gst_treatment === 'without_gst'} onChange={() => handleGstTreatmentChange('without_gst')} label="Without GST" />
                                        </div>

                                        {hasGst ? (
                                            <>
                                                <FieldLabel>GST Number</FieldLabel>
                                                <input
                                                    type="text"
                                                    value={form.gst_number}
                                                    onChange={(event) => updateField('gst_number', event.target.value.toUpperCase())}
                                                    className="form-input h-11 rounded-xl text-sm"
                                                    placeholder="Enter GST number"
                                                    maxLength={15}
                                                />

                                                {/* <FieldLabel>Reverse Charge</FieldLabel>
                                    <label className="inline-flex items-center gap-3 pt-2 text-[15px] text-slate-900 dark:text-white">
                                        <input
                                            type="checkbox"
                                            checked={form.reverse_charge}
                                            onChange={(event) => updateField('reverse_charge', event.target.checked)}
                                            className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span>This transaction is applicable for reverse charge</span>
                                    </label> */}

                                                <FieldLabel>Tax</FieldLabel>
                                                <select
                                                    value={form.tax_rate}
                                                    onChange={(event) => {
                                                        const nextValue = event.target.value;
                                                        const selectedTax = TAX_OPTIONS.find((option) => String(option.rate) === nextValue);
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            tax_rate: nextValue,
                                                            tax_name: selectedTax ? selectedTax.label : '',
                                                        }));
                                                    }}
                                                    className="form-select h-11 rounded-xl text-sm"
                                                >
                                                    <option value="">Select a Tax</option>
                                                    {TAX_OPTIONS.map((option) => (
                                                        <option key={option.rate} value={option.rate}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <FieldLabel>Amount Is</FieldLabel>
                                                <div className="flex flex-wrap gap-6 pt-1.5">
                                                    <RadioCard checked={form.amount_is === 'inclusive'} onChange={() => updateField('amount_is', 'inclusive')} label="Tax Inclusive" />
                                                    <RadioCard checked={form.amount_is === 'exclusive'} onChange={() => updateField('amount_is', 'exclusive')} label="Tax Exclusive" />
                                                </div>
                                            </>
                                        ) : null}

                                        <FieldLabel required>Invoice#</FieldLabel>
                                        <input
                                            type="text"
                                            value={form.invoice_number}
                                            onChange={(event) => updateField('invoice_number', event.target.value)}
                                            className="form-input h-11 rounded-xl text-sm"
                                        />

                                        <FieldLabel>Notes</FieldLabel>
                                        <div>
                                            <textarea
                                                value={form.notes}
                                                onChange={(event) => updateField('notes', event.target.value)}
                                                className="form-textarea min-h-[78px] rounded-xl text-sm"
                                                maxLength={500}
                                                placeholder="Max. 500 characters"
                                            />
                                            <div className="mt-1.5 text-right text-[11px] text-slate-400">{form.notes.length}/500</div>
                                        </div>

                                        <div className="md:col-span-2 h-px bg-slate-200 dark:bg-slate-800" />

                                        <FieldLabel>Vendor Name</FieldLabel>
                                        <div className="grid grid-cols-[minmax(0,1fr)_56px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={form.customer_name}
                                                    onChange={(event) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            customer_name: event.target.value,
                                                            party_id: null,
                                                        }))
                                                    }
                                                    className="form-input h-11 rounded-none border-0 text-sm"
                                                    placeholder="vendor name"
                                                />

                                                {form.customer_name?.trim() && filteredParties.length ? (
                                                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950">
                                                        {filteredParties.map((party) => (
                                                            <button
                                                                key={party.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setForm((prev) => ({
                                                                        ...prev,
                                                                        customer_name: party.name,
                                                                        party_id: party.id,
                                                                    }))
                                                                }
                                                                className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                                                            >
                                                                {party.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                            {/* <button
                                    type="button"
                                    onClick={() => onQuickAddParty(form.customer_name)}
                                    className="inline-flex items-center justify-center bg-primary text-white transition hover:bg-primary/90"
                                    title="Quick add customer"
                                >
                                    <Search className="h-5 w-5" />
                                </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ReceiptUploader receipts={form.receipts} setForm={setForm} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-7 py-5 dark:border-slate-800">
                        <button type="button" onClick={onSave} disabled={saving} className="btn btn-primary flex items-center gap-2 rounded-xl px-5 disabled:cursor-not-allowed disabled:opacity-60">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onSaveAndNew}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            Save and New
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <div className="ml-auto text-right">
                            <div className="text-xs uppercase tracking-wide text-slate-400">Selected Account</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedCategory?.name || 'No category selected'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExpenseList({ records, search, setSearch, onCreate, onView, onEdit, onDelete }) {
    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return records;

        return records.filter((record) =>
            [record.category_name, record.invoice_number, record.party_name, record.notes, record.title].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)),
        );
    }, [records, search]);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-[20px] font-bold text-slate-900 dark:text-white">
                    <span>All Expenses</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses" className="form-input h-12 rounded-xl pl-10 md:w-[240px]" />
                    </div>
                    <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-primary/90">
                        <Plus className="h-5 w-5" />
                        New
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Expense Account</th>
                            <th className="px-6 py-4">Reference#</th>
                            <th className="px-6 py-4">Vendor Name</th>
                            {/* <th className="px-6 py-4">Status</th> */}
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="w-[128px] px-6 py-4 text-right">
                                <Search className="ml-auto h-4 w-4" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredRecords.length ? (
                            filteredRecords.map((record) => {
                                const status = record.party_name ? 'BILLABLE' : 'NON-BILLABLE';

                                return (
                                    <tr
                                        key={record.id}
                                        className="group bg-white text-[15px] text-slate-900 transition hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                                    >
                                        <td className="whitespace-nowrap px-6 py-5">{formatDateForTable(record.expense_date)}</td>
                                        <td className="px-6 py-5">
                                            <button type="button" onClick={() => onView(record)} className="font-semibold text-primary transition hover:text-primary/80 hover:underline">
                                                {record.category_name || record.title || 'Expense'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">{record.invoice_number || '-'}</td>
                                        <td className="px-6 py-5">{record.party_name || '-'}</td>
                                        {/* <td className="px-6 py-5">
                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {status}
                                            </span>
                                        </td> */}
                                        <td className="px-6 py-5 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(record.total_amount)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onView(record)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                                                    title="View expense"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(record)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                                                    title="Edit expense"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(record.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/30"
                                                    title="Delete expense"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-14 text-center text-sm text-slate-500">
                                    {search ? 'No expenses matched your search.' : 'No expenses found. Create your first expense from the New button.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function PersonalExpensePage() {
    const { currentUser, loading: authLoading } = useAuth();

    const [records, setRecords] = useState([]);
    const [meta, setMeta] = useState({ categories: [], parties: [], states: [] });
    const [form, setForm] = useState(createInitialForm);
    const [editorMode, setEditorMode] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [pageError, setPageError] = useState('');
    const [formError, setFormError] = useState('');
    const [viewingId, setViewingId] = useState(null);
    const [viewRecord, setViewRecord] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [categorySaving, setCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setPageError('');
            const headers = await getAuthHeaders();

            const [recordsResponse, metaResponse] = await Promise.all([axios.get(`${API_URL}/api/personal-expenses`, { headers }), axios.get(`${API_URL}/api/personal-expenses/meta`, { headers })]);

            setRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
            setMeta({
                categories: Array.isArray(metaResponse.data?.categories) ? metaResponse.data.categories : [],
                parties: Array.isArray(metaResponse.data?.parties) ? metaResponse.data.parties : [],
                states: Array.isArray(metaResponse.data?.states) ? metaResponse.data.states : [],
            });
        } catch (error) {
            setRecords([]);
            setMeta({ categories: [], parties: [], states: [] });
            setPageError(error.response?.data?.error || error.message || 'Failed to load expenses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && currentUser) {
            loadData();
        }

        if (!authLoading && !currentUser) {
            setLoading(false);
            setPageError('Please sign in to manage expenses.');
        }
    }, [authLoading, currentUser, loadData]);

    const totalSpend = useMemo(() => records.reduce((sum, record) => sum + Number(record.total_amount || 0), 0), [records]);

    const thisMonthSpend = useMemo(() => {
        const monthKey = new Date().toISOString().slice(0, 7);
        return records.reduce((sum, record) => {
            if (String(record.expense_date || '').slice(0, 7) !== monthKey) return sum;
            return sum + Number(record.total_amount || 0);
        }, 0);
    }, [records]);

    const resetEditor = useCallback(() => {
        setEditorMode(null);
        setEditingId(null);
        setFormError('');
        setForm(createInitialForm());
    }, []);

    const closeView = useCallback(() => {
        setViewingId(null);
        setViewRecord(null);
        setViewLoading(false);
    }, []);

    const openCreate = () => {
        setEditorMode('create');
        setEditingId(null);
        setFormError('');
        setCategoryError('');
        setForm(createInitialForm());
    };

    const openEdit = (record) => {
        closeView();
        setEditorMode('edit');
        setEditingId(record.id);
        setFormError('');
        setCategoryError('');
        setForm({
            expense_date: toInputDate(record.expense_date),
            category_id: record.category_id || '',
            category_name_input: record.category_name || record.title || '',
            currency_code: record.currency_code || 'INR',
            amount: record.amount !== null && record.amount !== undefined ? String(record.amount) : '',
            expense_type: record.expense_type || 'goods',
            code_value: record.code_value || '',
            gst_treatment: record.gst_treatment || 'with_gst',
            gst_number: record.gst_number || '',
            source_supply_state_code: record.source_supply_state_code || '',
            destination_supply_state_code: record.destination_supply_state_code || '',
            reverse_charge: Boolean(record.reverse_charge),
            tax_rate: record.tax_rate !== null && record.tax_rate !== undefined ? String(record.tax_rate) : '',
            tax_name: record.tax_name || '',
            amount_is: record.amount_is || 'inclusive',
            invoice_number: record.invoice_number || '',
            notes: record.notes || '',
            party_id: record.party_id || '',
            customer_name: record.party_name || '',
            title: record.title || '',
            receipts: Array.isArray(record.attachments)
                ? record.attachments.map((attachment) => ({
                      id: attachment.id,
                      name: attachment.file_name,
                      size: attachment.file_size || 0,
                      file_url: attachment.file_url,
                      mime_type: attachment.mime_type || null,
                  }))
                : [],
        });
    };

    const openView = async (record) => {
        try {
            setViewingId(record.id);
            setViewRecord(record);
            setViewLoading(true);
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/personal-expenses/${record.id}`, { headers });
            setViewRecord(response.data || record);
        } catch (error) {
            setPageError(error.response?.data?.error || error.message || 'Failed to load expense details.');
        } finally {
            setViewLoading(false);
        }
    };

    const validateForm = () => {
        const hasGst = form.gst_treatment === 'with_gst';

        if (!form.expense_date) return 'Date is required.';
        if (form.expense_date > today()) return 'Date cannot be in the future.';
        if (!form.title.trim()) return 'Title is required.';
        if (!form.category_id && !form.category_name_input.trim()) return 'Category is required.';
        if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than zero.';
        if (!form.expense_type) return 'Expense type is required.';
        if (!form.gst_treatment) return 'GST treatment is required.';
        if (hasGst && form.gst_number && !/^[0-9A-Z]{15}$/.test(form.gst_number.trim().toUpperCase())) return 'GST number must be 15 uppercase letters or digits.';
        if (!form.invoice_number.trim()) return 'Invoice number is required.';
        if (form.notes.trim().length > 500) return 'Notes must be 500 characters or less.';
        if (form.code_value.length > 50) return 'HSN/SAC code must be 50 characters or less.';

        return '';
    };

    const buildPayload = () => {
        const selectedCategory = meta.categories.find((category) => category.id === form.category_id);
        const hasGst = form.gst_treatment === 'with_gst';
        const numericTaxRate = hasGst && form.tax_rate !== '' ? Number(form.tax_rate) : null;

        return {
            expense_date: form.expense_date,
            category_id: form.category_id,
            title: form.title.trim() || selectedCategory?.name || 'Expense',
            currency_code: form.currency_code,
            amount: Number(form.amount),
            expense_type: form.expense_type,
            code_type: form.code_value ? (form.expense_type === 'services' ? 'sac' : 'hsn') : null,
            code_value: form.code_value.trim() || null,
            gst_treatment: form.gst_treatment,
            gst_number: hasGst ? form.gst_number.trim().toUpperCase() || null : null,
            source_supply_state_code: null,
            destination_supply_state_code: null,
            reverse_charge: form.reverse_charge,
            tax_name: hasGst ? form.tax_name || (numericTaxRate !== null ? `GST ${numericTaxRate}%` : null) : null,
            tax_rate: numericTaxRate,
            amount_is: hasGst ? form.amount_is : null,
            invoice_number: form.invoice_number.trim(),
            notes: form.notes.trim() || null,
            party_id: form.party_id || null,
            itemize_json: null,
        };
    };

    const submitExpense = async (mode = 'close') => {
        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSaving(true);
            setFormError('');
            setPageError('');
            let resolvedPartyId = form.party_id || null;
            let resolvedCategoryId = form.category_id || null;
            const typedCustomerName = form.customer_name.trim();
            const typedCategoryName = form.category_name_input.trim();

            if (!resolvedCategoryId && typedCategoryName) {
                const existingCategory = meta.categories.find((category) => category.name?.toLowerCase() === typedCategoryName.toLowerCase());
                if (existingCategory) {
                    resolvedCategoryId = existingCategory.id;
                    setForm((prev) => ({
                        ...prev,
                        category_id: existingCategory.id,
                        category_name_input: existingCategory.name,
                        expense_type: existingCategory.default_type || prev.expense_type,
                    }));
                } else {
                    const createdCategory = await handleCreateCategory(typedCategoryName, { silent: true });
                    if (!createdCategory) {
                        setSaving(false);
                        return;
                    }
                    resolvedCategoryId = createdCategory.id;
                }
            }

            if (typedCustomerName && !resolvedPartyId) {
                const existingParty = meta.parties.find((party) => party.name?.toLowerCase() === typedCustomerName.toLowerCase());
                if (existingParty) {
                    resolvedPartyId = existingParty.id;
                    setForm((prev) => ({ ...prev, party_id: existingParty.id, customer_name: existingParty.name }));
                } else {
                    resolvedPartyId = await handleQuickAddParty(typedCustomerName, { silent: true });
                    if (!resolvedPartyId) {
                        setSaving(false);
                        return;
                    }
                }
            }

            const headers = await getAuthHeaders();
            const attachments = await uploadReceiptFiles(form.receipts || [], headers);
            const payload = {
                ...buildPayload(),
                category_id: resolvedCategoryId,
                party_id: resolvedPartyId,
                attachments,
            };

            if (editingId) {
                const response = await axios.put(`${API_URL}/api/personal-expenses/${editingId}`, payload, { headers });
                setRecords((prev) => prev.map((record) => (record.id === editingId ? response.data : record)));
                toast.success('Expense updated');
            } else {
                const response = await axios.post(`${API_URL}/api/personal-expenses`, payload, { headers });
                setRecords((prev) => [response.data, ...prev]);
                toast.success('Expense created');
            }

            if (mode === 'new') {
                setForm(createInitialForm());
                setEditingId(null);
                setEditorMode('create');
            } else {
                resetEditor();
            }
        } catch (error) {
            setFormError(error.response?.data?.error || error.message || 'Failed to save expense.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            const headers = await getAuthHeaders();
            await axios.delete(`${API_URL}/api/personal-expenses/${expenseId}`, { headers });
            setRecords((prev) => prev.filter((record) => record.id !== expenseId));
            toast.success('Expense deleted');

            if (editingId === expenseId) {
                resetEditor();
            }
            if (viewingId === expenseId) {
                closeView();
            }
        } catch (error) {
            setPageError(error.response?.data?.error || error.message || 'Failed to delete expense.');
        }
    };

    const handleQuickAddParty = async (typedName, options = {}) => {
        const { silent = false } = options;
        const partyName = String(typedName || '').trim();
        if (!partyName) {
            setFormError('Customer name is required.');
            return null;
        }

        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(
                `${API_URL}/api/personal-expenses/parties`,
                {
                    name: partyName.trim(),
                    party_type: 'customer',
                },
                { headers },
            );

            setMeta((prev) => ({
                ...prev,
                parties: [...prev.parties, response.data].sort((a, b) => a.name.localeCompare(b.name)),
            }));
            setForm((prev) => ({ ...prev, party_id: response.data.id, customer_name: response.data.name }));
            if (!silent) {
                toast.success('Customer added');
            }
            return response.data.id;
        } catch (error) {
            setFormError(error.response?.data?.error || error.message || 'Failed to add customer.');
            return null;
        }
    };

    const handleCreateCategory = async (name, options = {}) => {
        const { silent = false } = options;
        try {
            setCategorySaving(true);
            setCategoryError('');
            const headers = await getAuthHeaders();
            const response = await axios.post(
                `${API_URL}/api/personal-expenses/categories`,
                {
                    name: name.trim(),
                    description: null,
                    default_type: form.expense_type || 'goods',
                },
                { headers },
            );

            const newCategory = response.data;
            setMeta((prev) => ({
                ...prev,
                categories: [...prev.categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
            }));
            setForm((prev) => ({
                ...prev,
                category_id: newCategory.id,
                category_name_input: newCategory.name || prev.category_name_input,
                expense_type: newCategory.default_type || prev.expense_type,
            }));
            if (!silent) {
                toast.success('Category added');
            }
            return newCategory;
        } catch (error) {
            setCategoryError(error.response?.data?.error || error.message || 'Failed to create category.');
            return null;
        } finally {
            setCategorySaving(false);
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
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

                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
                        <WalletCards className="text-primary" />
                        Company Expense
                    </h1>
                    <p className="mt-1 text-slate-500">Manage and track all company expense entries.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Spend</div>
                        <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <IndianRupee className="h-5 w-5 text-emerald-500" />
                            {formatCurrency(totalSpend)}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">This Month</div>
                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(thisMonthSpend)}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Records</div>
                        <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                            <FileText className="h-5 w-5 text-violet-500" />
                            {records.length}
                        </div>
                    </div>
                </div>
            </div>

            {pageError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div> : null}

            {loading ? (
                <div className="panel flex min-h-[280px] items-center justify-center text-slate-500">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Loading expenses...
                </div>
            ) : (
                <ExpenseList records={records} search={search} setSearch={setSearch} onCreate={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} />
            )}

            {!loading && editorMode
                ? createPortal(
                      <ExpenseDrawer
                          mode={editorMode}
                          form={form}
                          setForm={setForm}
                          categories={meta.categories}
                          parties={meta.parties}
                          states={meta.states}
                          saving={saving}
                          error={formError}
                          onCancel={resetEditor}
                          onSave={() => submitExpense('close')}
                          onSaveAndNew={() => submitExpense('new')}
                          onQuickAddParty={handleQuickAddParty}
                          onCreateCategory={handleCreateCategory}
                          categorySaving={categorySaving}
                          categoryError={categoryError}
                      />,
                      document.body,
                  )
                : null}

            {!loading && viewingId ? createPortal(<ExpenseViewDrawer record={viewRecord} loading={viewLoading} onClose={closeView} onEdit={openEdit} />, document.body) : null}
        </div>
    );
}
