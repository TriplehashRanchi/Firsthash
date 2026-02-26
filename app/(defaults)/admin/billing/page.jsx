'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    FileText, 
    CalendarDays, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Eye, 
    Loader2, 
    Search, 
    ChevronLeft, 
    ChevronRight,
    Plus,
    Filter,
    X,
    Folder,
    Activity,
    CreditCard,
    TrendingUp,
    Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import Swal from 'sweetalert2';
import CreateInvoiceModal from '@/components/billing/CreateInvoiceModal';
import InvoiceDetailDrawer from '@/components/billing/InvoiceDetailDrawer';

// --- Constants ---
const InvoiceStatus = {
    ALL: 'all',
    PAID: 'paid',
    PENDING: 'pending',
};

const statusConfig = {
    [InvoiceStatus.ALL]: {
        label: 'All Invoices',
        icon: <FileText size={14} className="mr-1.5" />,
        base: 'bg-blue-500 dark:bg-blue-500',
        hover: 'hover:bg-blue-600 dark:hover:bg-blue-600',
        text: 'text-white',
        pillBg: 'bg-blue-100 dark:bg-blue-400/20',
        pillText: 'text-blue-700 dark:text-blue-300',
        activePillBg: 'bg-white/20 dark:bg-blue-400/30',
        activePillText: 'text-white dark:text-blue-100',
        focusRing: 'focus:ring-blue-400',
    },
    [InvoiceStatus.PAID]: {
        label: 'Paid',
        icon: <CheckCircle size={14} className="mr-1.5 text-green-300" />,
        base: 'bg-green-500 dark:bg-green-500',
        hover: 'hover:bg-green-600 dark:hover:bg-green-600',
        text: 'text-white',
        pillBg: 'bg-green-100 dark:bg-green-400/20',
        pillText: 'text-green-700 dark:text-green-300',
        activePillBg: 'bg-white/20 dark:bg-green-400/30',
        activePillText: 'text-white dark:text-green-100',
        focusRing: 'focus:ring-green-400',
    },
    [InvoiceStatus.PENDING]: {
        label: 'Pending',
        icon: <Clock size={14} className="mr-1.5 text-yellow-700 dark:text-yellow-600" />,
        base: 'bg-yellow-400 dark:bg-yellow-500',
        hover: 'hover:bg-yellow-500 dark:hover:bg-yellow-600',
        text: 'text-yellow-800 dark:text-yellow-900',
        pillBg: 'bg-yellow-100 dark:bg-yellow-400/20',
        pillText: 'text-yellow-700 dark:text-yellow-300',
        activePillBg: 'bg-black/10 dark:bg-yellow-700/40',
        activePillText: 'text-yellow-800 dark:text-yellow-100',
        focusRing: 'focus:ring-yellow-400',
    },
};

// --- Styles ---
const pageWrapperStyles = 'min-h-screen p-4 sm:p-6 lg:p-8';
const headerContainerStyles = 'mb-6';
const pageTitleStyles = 'text-2xl font-bold text-slate-800 dark:text-slate-100';
const cardStyles = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:shadow-md';
const filterTabsContainerStyles = 'flex flex-wrap gap-2 items-center bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50';
const tabButtonBaseStyles = 'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
const inactiveTabStyles = 'bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400';
const tableWrapperStyles = 'overflow-x-auto bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl';
const tableStyles = 'min-w-full';
const thStyles = 'px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50';
const tdStyles = 'px-5 py-4 whitespace-nowrap text-sm border-b border-slate-100 dark:border-slate-700/50';
const rowHoverStyles = 'hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer';

export default function BillingListPage() {
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalReceived: 0,
        totalRemaining: 0,
        totalCollectable: 0
    });
    
    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState(InvoiceStatus.ALL);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    const router = useRouter();
    const { currentUser } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const fetchInvoices = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setError(null);

        try {
            const token = await currentUser.getIdToken();
            const params = {
                page,
                limit,
            };
            
            if (statusFilter !== InvoiceStatus.ALL) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const response = await axios.get(`${API_URL}/api/billing/invoices`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            // Robust response parsing
            let fetchedInvoices = [];
            let fetchedSummary = {
                totalInvoices: 0, totalAmount: 0, paidAmount: 0, 
                pendingAmount: 0, totalReceived: 0, totalRemaining: 0, totalCollectable: 0
            };
            let fetchedPagination = { totalPages: 1, totalItems: 0 };

            if (response.data) {
                // Parse items
                if (Array.isArray(response.data)) {
                    fetchedInvoices = response.data;
                } else if (Array.isArray(response.data.items)) {
                    fetchedInvoices = response.data.items;
                } else if (Array.isArray(response.data.data)) {
                    fetchedInvoices = response.data.data;
                } else if (Array.isArray(response.data.invoices)) {
                    fetchedInvoices = response.data.invoices;
                }

                // Parse summary
                let rawSummary = response.data.summary || (response.data.data && response.data.data.summary);
                if (rawSummary) {
                    // If it's an array (e.g. raw SQL results), grab the first item
                    if (Array.isArray(rawSummary)) {
                        rawSummary = rawSummary[0] || {};
                    }
                    fetchedSummary = {
                        totalInvoices: Number(rawSummary.invoiceCount || rawSummary.totalInvoices || 0),
                        totalAmount: Number(rawSummary.totalInvoiceAmount || rawSummary.totalAmount || 0),
                        paidAmount: Number(rawSummary.paidInvoiceAmount || rawSummary.paidAmount || 0),
                        pendingAmount: Number(rawSummary.pendingInvoiceAmount || rawSummary.pendingAmount || 0),
                        totalReceived: Number(rawSummary.totalReceivedAmount || rawSummary.totalReceived || 0),
                        totalRemaining: Number(rawSummary.totalRemainingAmount || rawSummary.totalRemaining || 0),
                        totalCollectable: Number(rawSummary.totalCollectableAmount || rawSummary.totalCollectable || 0)
                    };
                }

                // Parse pagination
                if (response.data.pagination) {
                    fetchedPagination = {
                        totalPages: response.data.pagination.totalPages || 1,
                        totalItems: response.data.pagination.total || response.data.pagination.totalItems || 0
                    };
                }
            }
            
            setInvoices(fetchedInvoices);
            setSummary(fetchedSummary);
            setTotalPages(fetchedPagination.totalPages || 1);
            setTotalItems(fetchedPagination.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            // Fallback for development if API is not yet ready
            // setError('Could not load billing data. Please try again later.');
            setInvoices([
                { id: 101, amount: 25000, status: 'paid', dateReceived: '2026-02-20', projectName: 'Wedding - Sharma', clientName: 'Rahul Sharma', projectReceivedAmount: 25000, projectRemainingAmount: 75000, projectCollectableAmount: 25000, fileUrl: '#' },
                { id: 102, amount: 15000, status: 'pending', createdAt: '2026-02-25', projectName: 'Corporate - TechCorp', clientName: 'Amit Singh', projectReceivedAmount: 50000, projectRemainingAmount: 15000, projectCollectableAmount: 15000, fileUrl: null },
            ]);
            setSummary({
                totalInvoices: 2, totalAmount: 40000, paidAmount: 25000, 
                pendingAmount: 15000, totalReceived: 75000, totalRemaining: 90000, totalCollectable: 40000
            });
            setTotalPages(1);
            setTotalItems(2);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, page, limit, statusFilter, searchQuery, dateFrom, dateTo, API_URL]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchInvoices]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);
    
    const handleInvoiceCreated = () => {
        closeCreateModal();
        fetchInvoices();
    };

    const openInvoiceDetail = (id) => {
        setSelectedInvoiceId(id);
        setIsDrawerOpen(true);
    };

    const closeInvoiceDetail = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedInvoiceId(null), 300); // Clear after animation
    };

    const handleMarkAsPaid = async (e, id) => {
        e.stopPropagation(); // Prevent row click opening drawer
        try {
            const token = await currentUser.getIdToken();
            await axios.put(`${API_URL}/api/billing/invoices/${id}/mark-as-paid`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire({
                icon: 'success',
                title: 'Marked as Paid',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            fetchInvoices();
        } catch (err) {
            Swal.fire('Error', 'Failed to update invoice status', 'error');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // --- Renderers ---
    const renderKPICards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className={cardStyles}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Invoiced</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(summary.totalAmount)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <FileText size={24} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{summary.totalInvoices} total invoices generated</span>
                </div>
            </div>

            <div className={cardStyles}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Amount Paid</p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.paidAmount)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Received successfully</span>
                </div>
            </div>

            <div className={cardStyles}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Amount Pending</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.pendingAmount)}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                        <Clock size={24} />
                    </div>
                </div>
                 <div className="mt-4 flex items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Awaiting payment</span>
                </div>
            </div>

            <div className={cardStyles}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Project Collectable</p>
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(summary.totalCollectable)}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Recv: <span className="font-semibold">{formatCurrency(summary.totalReceived)}</span></span>
                    <span>Rem: <span className="font-semibold">{formatCurrency(summary.totalRemaining)}</span></span>
                </div>
            </div>
        </div>
    );

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                        <div className="flex justify-center items-center">
                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                            <p className="ml-3 text-sm font-medium text-slate-500">Loading Billing Data...</p>
                        </div>
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr>
                    <td colSpan="8" className="px-6 py-20 text-center text-red-500">
                        <AlertTriangle size={32} className="mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-medium">{error}</p>
                    </td>
                </tr>
            );
        }

        if (invoices.length === 0) {
            return (
                <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                        <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-1">No invoices found</p>
                        <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                    </td>
                </tr>
            );
        }

        return invoices.map((invoice) => (
            <tr key={invoice.id} onClick={() => openInvoiceDetail(invoice.id)} className={rowHoverStyles}>
                <td className={`${tdStyles} font-medium text-slate-800 dark:text-slate-200`}>
                    INV-{invoice.id.toString().padStart(4, '0')}
                </td>
                <td className={`${tdStyles} text-slate-600 dark:text-slate-400`}>
                    {formatDate(invoice.dateReceived || invoice.createdAt)}
                </td>
                <td className={tdStyles}>
                    {(() => {
                        const statusKey = invoice.status?.toLowerCase() || InvoiceStatus.PENDING;
                        const config = statusConfig[statusKey] || statusConfig[InvoiceStatus.PENDING];
                        return (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.pillBg} ${config.pillText}`}>
                                {statusKey === 'paid' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                {config.label}
                            </span>
                        );
                    })()}
                </td>
                <td className={`${tdStyles} font-semibold text-slate-900 dark:text-slate-100`}>
                    {formatCurrency(invoice.amount)}
                </td>
                <td className={tdStyles}>
                    <p className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{invoice.projectName}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{invoice.clientName}</p>
                </td>
                <td className={tdStyles}>
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between w-32">
                            <span className="text-slate-500">Recv:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(invoice.projectReceivedAmount)}</span>
                        </div>
                        <div className="flex justify-between w-32">
                            <span className="text-slate-500">Rem:</span>
                            <span className="font-medium text-amber-600 dark:text-amber-400">{formatCurrency(invoice.projectRemainingAmount)}</span>
                        </div>
                    </div>
                </td>
                <td className={`${tdStyles} font-medium text-purple-600 dark:text-purple-400`}>
                    {formatCurrency(invoice.projectCollectableAmount)}
                </td>
                <td className={`${tdStyles} text-right`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                        {invoice.fileUrl && (
                            <a href={invoice.fileUrl} target="_blank" rel="noreferrer" 
                               className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                               title="Download PDF">
                                <Download size={16} />
                            </a>
                        )}
                         
                        <button onClick={() => openInvoiceDetail(invoice.id)} 
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="View Details">
                            <Eye size={16} />
                        </button>
                        
                        {invoice.status !== 'paid' && (
                            <button onClick={(e) => handleMarkAsPaid(e, invoice.id)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md transition-colors"
                                title="Mark as Paid">
                                Mark Paid
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className={pageWrapperStyles}>
            {/* Header */}
            <div className={headerContainerStyles}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <ul className="flex space-x-2 text-sm text-slate-500 mb-2">
                            <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                            <li className="before:content-['/'] before:mr-2 before:text-slate-400 text-slate-800 dark:text-slate-200 font-medium">Billing & Invoices</li>
                        </ul>
                        <h1 className={pageTitleStyles}>Billing Overview</h1>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <Plus size={18} className="mr-2" />
                        Create Invoice
                    </button>
                </div>
                
                {renderKPICards()}

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className={filterTabsContainerStyles}>
                        {Object.values(InvoiceStatus).map((statusValue) => {
                            const config = statusConfig[statusValue];
                            const isActive = statusFilter === statusValue;
                            return (
                                <button
                                    key={statusValue}
                                    onClick={() => handleStatusChange(statusValue)}
                                    className={`${tabButtonBaseStyles} ${isActive ? `${config.base} ${config.text} shadow-sm` : inactiveTabStyles} ${config.focusRing}`}
                                >
                                    {isActive && config.icon}
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="flex gap-2 items-center text-sm">
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-200 w-full sm:w-auto"
                            />
                            <span className="text-slate-400 text-xs">to</span>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-200 w-full sm:w-auto"
                            />
                        </div>

                        <div className="relative min-w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search project, client, inv..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={tableWrapperStyles}>
                <table className={tableStyles}>
                    <thead>
                        <tr>
                            <th scope="col" className={thStyles}>Invoice No</th>
                            <th scope="col" className={thStyles}>Date</th>
                            <th scope="col" className={thStyles}>Status</th>
                            <th scope="col" className={thStyles}>Amount</th>
                            <th scope="col" className={thStyles}>Project / Client</th>
                            <th scope="col" className={thStyles}>Proj Status</th>
                            <th scope="col" className={thStyles}>Collectable</th>
                            <th scope="col" className={`${thStyles} text-right`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-5 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(page * limit, totalItems)}</span> of{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> invoices
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center justify-center p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mx-2">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="inline-flex items-center justify-center p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals & Drawers */}
            {isCreateModalOpen && (
                <CreateInvoiceModal 
                    isOpen={isCreateModalOpen} 
                    onClose={closeCreateModal} 
                    onSuccess={handleInvoiceCreated} 
                />
            )}

            <InvoiceDetailDrawer
                isOpen={isDrawerOpen}
                invoiceId={selectedInvoiceId}
                onClose={closeInvoiceDetail}
                onInvoiceUpdated={fetchInvoices}
            />
        </div>
    );
}
