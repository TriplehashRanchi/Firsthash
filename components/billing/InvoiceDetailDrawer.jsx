'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, FileText, Download, CheckCircle, Clock, IndianRupee, 
    User, Briefcase, Activity, AlertTriangle, Loader2 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function InvoiceDetailDrawer({ isOpen, invoiceId, onClose, onInvoiceUpdated }) {
    const { currentUser } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchInvoiceDetail();
        } else {
            // Reset state when closed
            setInvoice(null);
        }
    }, [isOpen, invoiceId]);

    const fetchInvoiceDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await currentUser?.getIdToken();
            const res = await axios.get(`${API_URL}/api/billing/invoices/${invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoice(res.data);
        } catch (err) {
            console.error(err);
            // Mock data for development if API is not yet ready
            // setInvoice({
            //     id: invoiceId,
            //     projectId: 'p1',
            //     projectName: 'Wedding - Sharma Family',
            //     clientName: 'Rahul Sharma',
            //     clientPhone: '+91 9876543210',
            //     clientEmail: 'rahul@example.com',
            //     amount: 25000,
            //     status: 'pending',
            //     dateReceived: '2026-02-26T00:00:00.000Z',
            //     createdAt: '2026-02-26T11:40:00.000Z',
            //     description: 'Second installment',
            //     fileUrl: 'https://example.com/invoice.pdf',
            //     projectTotalCost: 120000,
            //     projectInvoicedAmount: 60000,
            //     projectReceivedAmount: 35000,
            //     projectRemainingAmount: 85000,
            //     projectCollectableAmount: 60000,
            //     history: [
            //         { id: invoiceId, amount: 25000, status: 'pending', dateReceived: '2026-02-26T00:00:00.000Z', description: 'Second installment', isCurrent: true },
            //         { id: 99, amount: 35000, status: 'paid', dateReceived: '2025-12-10T00:00:00.000Z', description: 'Advance payment', isCurrent: false, fileUrl: '#' }
            //     ]
            // });
            setError('Failed to load invoice details.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        try {
            setIsMarkingPaid(true);
            const token = await currentUser?.getIdToken();
            await axios.put(`${API_URL}/api/billing/invoices/${invoiceId}/mark-as-paid`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Marked as Paid',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            
            // Refetch drawer details and notify parent to update list
            fetchInvoiceDetail();
            if (onInvoiceUpdated) onInvoiceUpdated();
        } catch (err) {
             Swal.fire('Error', 'Failed to update invoice status', 'error');
        } finally {
            setIsMarkingPaid(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                            Invoice Details
                        </h2>
                    </div>
                    {invoice && invoice.status !== 'paid' && (
                        <button 
                            onClick={handleMarkAsPaid}
                            disabled={isMarkingPaid}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                        >
                            {isMarkingPaid ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                            Mark Paid
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
                            <p>Loading details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-red-500 px-6 text-center">
                            <AlertTriangle size={36} className="mb-4 opacity-80" />
                            <p className="font-medium text-lg mb-2">Error</p>
                            <p className="text-sm">{error}</p>
                            <button onClick={fetchInvoiceDetail} className="mt-4 text-sm text-blue-600 hover:underline">Retry</button>
                        </div>
                    ) : invoice ? (
                        <div className="p-6 space-y-6">
                            
                            {/* Primary Info Card */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Invoice ID</p>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">INV-{invoice.id.toString().padStart(4, '0')}</h3>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                    }`}>
                                        {invoice.status === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(invoice.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Date Received / Created</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDateTime(invoice.dateReceived || invoice.createdAt)}</p>
                                    </div>
                                </div>
                                {invoice.description && (
                                    <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/30">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Description</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{invoice.description}</p>
                                    </div>
                                )}
                                {invoice.fileUrl && (
                                    <div className="mt-4">
                                        <a href={invoice.fileUrl} target="_blank" rel="noreferrer" 
                                           className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                                            <Download size={16} className="mr-2" />
                                            Download PDF
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Client & Project Specs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                        <User size={16} className="text-slate-400" />
                                        Client Details
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{invoice.clientName}</p>
                                    {(invoice.clientPhone || invoice.clientEmail) && (
                                        <div className="mt-2 text-xs text-slate-500 space-y-1">
                                            {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
                                            {invoice.clientEmail && <p className="truncate">{invoice.clientEmail}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                        <Briefcase size={16} className="text-slate-400" />
                                        Project
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{invoice.projectName}</p>
                                </div>
                            </div>

                            {/* Billing Progress Card */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    <Activity size={16} className="text-blue-500" />
                                    Project Billing Summary
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Amount Received</span>
                                            <span className="font-medium text-green-600">{formatCurrency(invoice.projectReceivedAmount)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                            <div className="bg-green-500 h-1.5 rounded-full" 
                                                 style={{ width: `${Math.min(100, (invoice.projectReceivedAmount / (invoice.projectTotalCost || 1)) * 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Total Cost</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(invoice.projectTotalCost)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Amount Remaining</p>
                                            <p className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(invoice.projectRemainingAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Collectable Now</p>
                                            <p className="font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(invoice.projectCollectableAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5">Total Invoiced</p>
                                            <p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(invoice.projectInvoicedAmount)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice History Timeline */}
                            {invoice.history && invoice.history.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                                        <Clock size={16} className="mr-2 text-slate-400" />
                                        Project Invoice History
                                    </h4>
                                    <div className="relative pl-3 space-y-6 before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                        {invoice.history.map((histItem, idx) => (
                                            <div key={idx} className={`relative pl-6 ${histItem.isCurrent ? 'opacity-100' : 'opacity-70'} transition-opacity hover:opacity-100`}>
                                                {/* dot */}
                                                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 ${
                                                    histItem.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'
                                                } ${histItem.isCurrent ? 'ring-4 ring-blue-100 dark:ring-blue-900/50 scale-125' : ''}`}></div>
                                                
                                                <div className={`border rounded-lg p-3 ${
                                                    histItem.isCurrent 
                                                        ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' 
                                                        : 'bg-white border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {formatDateTime(histItem.dateReceived || histItem.createdAt)}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                            histItem.status === 'paid' ? 'text-green-700 bg-green-100 dark:bg-green-900/30' : 'text-amber-700 bg-amber-100 dark:bg-amber-900/30'
                                                        }`}>
                                                            {histItem.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                                            {formatCurrency(histItem.amount)}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {histItem.isCurrent && (
                                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium dark:bg-blue-900/40 dark:text-blue-300">Current</span>
                                                            )}
                                                            {histItem.fileUrl && (
                                                                <a href={histItem.fileUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500" title="View PDF">
                                                                    <FileText size={14} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {histItem.description && (
                                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{histItem.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
