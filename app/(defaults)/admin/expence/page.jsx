'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    BarChart3, TrendingUp, TrendingDown, Scale, DollarSign, ListChecks, Landmark,
    Tag, CalendarDays, Edit3, Trash2, PlusCircle, X, Check, ShieldCheck, Filter, ArrowUpDown,
    FileText, Percent, Info
} from 'lucide-react';

// --- (Initial Data - MODIFIED to link expenses to revenue) ---
const initialCompanyData = {
    companyName: "Creative Visions Inc.",
    reportingPeriod: { startDate: "2024-01-01", endDate: "2024-12-31" },
    revenue: [
        { id: 'rev001', source: "Anika & Rohan's Wedding", amount: 34447, date: "2024-11-15", category: "Wedding Photography" },
        { id: 'rev002', source: "Corporate Headshots - Acme Corp", amount: 15000, date: "2024-10-20", category: "Corporate" },
        { id: 'rev003', source: "Product Shoot - BoldWear", amount: 22000, date: "2024-10-05", category: "Commercial" },
        { id: 'rev004', source: "Family Portrait Session", amount: 8500, date: "2024-11-28", category: "Portraits" },
        { id: 'rev005', source: "Event Coverage - TechConf 2024", amount: 50000, date: "2024-09-12", category: "Corporate" },
    ],
    expenses: [
        { id: 'exp001', itemName: "New Camera Lens", amount: 18000, date: "2024-10-20", category: "Equipment", linkedRevenueId: null },
        { id: 'exp002', itemName: "Adobe Creative Cloud", amount: 4800, date: "2024-11-01", category: "Software", linkedRevenueId: null },
        { id: 'exp003', itemName: "Studio Rent - November", amount: 25000, date: "2024-11-05", category: "Overheads", linkedRevenueId: null },
        { id: 'exp004', itemName: "Travel for Rohan's Wedding", amount: 3500, date: "2024-11-14", category: "Project Cost", linkedRevenueId: 'rev001' },
        { id: 'exp005', itemName: "Facebook & Instagram Ads", amount: 10000, date: "2024-10-18", category: "Marketing", linkedRevenueId: null },
        { id: 'exp006', itemName: "Assistant Photographer Fee", amount: 7000, date: "2024-09-12", category: "Project Cost", linkedRevenueId: 'rev005' },
    ]
};


// --- Helper Functions & Components ---

// Currency Formatter
const formatCurrency = (value) => `₹ ${Number(value).toLocaleString('en-IN')}`;

// --- Stat Card Component (Unchanged) ---
const StatCard = ({ icon: Icon, title, value, detail, colorClass }) => (
    <motion.div
        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-start space-x-4"
        whileHover={{ translateY: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{detail}</p>
        </div>
    </motion.div>
);

// --- Expense/Revenue Modal Form (Unchanged) ---
const ExpenseModal = ({ isOpen, expense, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    React.useEffect(() => {
        setFormData(expense || { itemName: '', amount: '', date: new Date().toISOString().split('T')[0], category: '' });
    }, [expense, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, amount: parseFloat(formData.amount) });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                        {expense ? 'Edit Expense' : 'Add New Expense'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" name="itemName" value={formData.itemName || ''} onChange={handleChange} placeholder="Expense Item Name" required className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="Amount (₹)" required className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} required className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <input type="text" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Category" required className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onCancel} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
                                <X size={16} className="mr-1" /> Cancel
                            </button>
                            <button type="submit" className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
                                <Check size={16} className="mr-1" /> Save Expense
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- The Main Dashboard Page Component ---
function CompanyDashboardPage() {
    const [activeTab, setActiveTab] = useState('revenue'); // Set to 'revenue' to show changes
    const [companyData, setCompanyData] = useState(initialCompanyData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // --- Data Processing & Calculations with useMemo ---
    const { totalRevenue, totalExpenses, netProfit, profitMargin, avgRevenue } = useMemo(() => {
        const revenue = companyData.revenue.reduce((sum, item) => sum + item.amount, 0);
        const expenses = companyData.expenses.reduce((sum, item) => sum + item.amount, 0);
        const profit = revenue - expenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const avgRev = companyData.revenue.length > 0 ? revenue / companyData.revenue.length : 0;
        return { totalRevenue: revenue, totalExpenses: expenses, netProfit: profit, profitMargin: margin, avgRevenue: avgRev };
    }, [companyData]);

    const chartData = useMemo(() => {
        const monthlyData = {};
        [...companyData.revenue, ...companyData.expenses].forEach(item => {
            const month = new Date(item.date).toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { month, revenue: 0, expenses: 0 };
            }
            if ('source' in item) { // It's a revenue item
                monthlyData[month].revenue += item.amount;
            } else { // It's an expense item
                monthlyData[month].expenses += item.amount;
            }
        });
        return Object.values(monthlyData);
    }, [companyData]);

    // NEW: Process revenue data to include linked expenses and profit
    const processedRevenueData = useMemo(() => {
        return companyData.revenue.map(revenueItem => {
            const linkedExpenses = companyData.expenses
                .filter(expense => expense.linkedRevenueId === revenueItem.id)
                .reduce((sum, expense) => sum + expense.amount, 0);

            const profit = revenueItem.amount - linkedExpenses;

            return {
                ...revenueItem,
                expense: linkedExpenses,
                profit: profit,
            };
        });
    }, [companyData.revenue, companyData.expenses]);


    // --- CRUD Handlers for Expenses ---
    const handleOpenModal = (expense = null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingExpense(null);
        setIsModalOpen(false);
    };

    const handleSaveExpense = (expenseData) => {
        if (editingExpense) { // Update
            setCompanyData(prev => ({
                ...prev,
                expenses: prev.expenses.map(exp => exp.id === editingExpense.id ? { ...editingExpense, ...expenseData } : exp)
            }));
        } else { // Add new
            const newExpense = { ...expenseData, id: `exp${Date.now()}` };
            setCompanyData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
        }
        handleCloseModal();
    };

    const handleDeleteExpense = (expenseId) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            setCompanyData(prev => ({
                ...prev,
                expenses: prev.expenses.filter(exp => exp.id !== expenseId)
            }));
        }
    };


    // --- Common Page Styles ---  
    const pageContainerStyles = "min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900/95 text-slate-900 dark:text-slate-50";
    const mainContentWrapperStyles = "max-w-7xl mx-auto isolate";
    const sectionTitleStyles = "text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center";

    const tabConfig = {
        overview: { label: 'Dashboard', icon: BarChart3 },
        revenue: { label: 'Revenue Details', icon: ListChecks },
        expenses: { label: 'Expense Details', icon: ListChecks },
    };

    const renderTabContent = () => {
        // MODIFIED: Shared component for Revenue/Expense tables with new columns
        const DataTable = ({ data, type, onEdit, onDelete }) => {
            const [filter, setFilter] = useState('');
            const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

            const sortedAndFilteredData = useMemo(() => {
                let sorted = [...data].sort((a, b) => {
                    const valA = a[sortConfig.key];
                    const valB = b[sortConfig.key];
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                });
                if (filter) {
                    sorted = sorted.filter(item =>
                        Object.values(item).some(val =>
                            String(val).toLowerCase().includes(filter.toLowerCase())
                        )
                    );
                }
                return sorted;
            }, [data, filter, sortConfig]);

            const requestSort = (key) => {
                let direction = 'asc';
                if (sortConfig.key === key && sortConfig.direction === 'asc') {
                    direction = 'desc';
                }
                setSortConfig({ key, direction });
            };
            
            // MODIFIED: Header configuration with new columns for Revenue
            const headerConfig = type === 'revenue'
                ? [
                      { key: 'source', label: 'Source' }, 
                      { key: 'category', label: 'Category' }, 
                      { key: 'date', label: 'Date' }, 
                      { key: 'amount', label: 'Total Amount' },
                      { key: 'expense', label: 'Expense' },
                      { key: 'profit', label: 'Profit' }
                  ]
                : [
                      { key: 'itemName', label: 'Item Name' }, 
                      { key: 'category', label: 'Category' }, 
                      { key: 'date', label: 'Date' }, 
                      { key: 'amount', label: 'Amount' }
                  ];

            return (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">{type === 'revenue' ? 'All Revenue' : 'All Expenses'}</h3>
                        <div className="relative w-full sm:w-64">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="w-full p-2 pl-9 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    {headerConfig.map(({ key, label }) => (
                                        <th key={key} className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(key)}>
                                            <div className="flex items-center gap-2">
                                                {label}
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                    ))}
                                    {onEdit && <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredData.map(item => (
                                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        {/* MODIFIED: Cell rendering logic to handle new columns and styles */}
                                        {headerConfig.map(({ key }) => {
                                            const value = item[key];
                                            let cellContent;

                                            if (key === 'amount' && type === 'revenue') { // Total Amount
                                                cellContent = <span className='text-blue-600 font-semibold'>{formatCurrency(value)}</span>;
                                            } else if (key === 'amount' && type === 'expense') { // Amount for Expense Table
                                                cellContent = <span className='text-blue-600 font-semibold'>{formatCurrency(value)}</span>;
                                            } else if (key === 'expense') { // Expense column in Revenue Table
                                                cellContent = <span className='text-red-600 font-semibold'>{formatCurrency(value || 0)}</span>;
                                            } else if (key === 'profit') { // Profit column in Revenue Table
                                                cellContent = <span className={value >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatCurrency(value)}</span>;
                                            } else {
                                                cellContent = value;
                                            }
                                            
                                            return (
                                                <td key={`${item.id}-${key}`} className="p-3 text-sm whitespace-nowrap">
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                        {onEdit && (
                                            <td className="p-3">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => onEdit(item)} className="p-2 text-slate-500 hover:text-indigo-600"><Edit3 size={16} /></button>
                                                    <button onClick={() => onDelete(item.id)} className="p-2 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        switch (activeTab) {
            case 'overview':
                 return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <StatCard icon={TrendingUp} title="Total Revenue" value={formatCurrency(totalRevenue)} detail={`${companyData.revenue.length} transactions`} colorClass="bg-gradient-to-br from-green-500 to-emerald-600" />
                            <StatCard icon={TrendingDown} title="Total Expenses" value={formatCurrency(totalExpenses)} detail={`${companyData.expenses.length} transactions`} colorClass="bg-gradient-to-br from-red-500 to-orange-600" />
                            <StatCard icon={Scale} title="Net Profit" value={formatCurrency(netProfit)} detail={`${profitMargin.toFixed(1)}% Margin`} colorClass="bg-gradient-to-br from-indigo-500 to-purple-600" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Chart */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                <h3 className={sectionTitleStyles}>Monthly Performance</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                            <XAxis dataKey="month" tick={{ fill: 'rgb(100 116 139)' }} fontSize={12} />
                                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: 'rgb(100 116 139)' }} fontSize={12} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                                    borderColor: '#334155',
                                                    borderRadius: '0.75rem'
                                                }}
                                                labelStyle={{ color: '#f1f5f9' }}
                                                formatter={(value) => [formatCurrency(value), null]}
                                            />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            {/* KPI Panel */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                <h3 className={sectionTitleStyles}>Key Metrics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300"><Percent size={14} className="mr-2" /> Profit Margin</div>
                                        <div className="text-md font-bold text-slate-800 dark:text-slate-100">{profitMargin.toFixed(1)}%</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300"><DollarSign size={14} className="mr-2" /> Avg. Revenue Value</div>
                                        <div className="text-md font-bold text-slate-800 dark:text-slate-100">{formatCurrency(avgRevenue)}</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300"><FileText size={14} className="mr-2" /> Total Transactions</div>
                                        <div className="text-md font-bold text-slate-800 dark:text-slate-100">{companyData.revenue.length + companyData.expenses.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'revenue':
                return <DataTable data={processedRevenueData} type="revenue" />;
            case 'expenses':
                return <DataTable data={companyData.expenses} type="expense" onEdit={handleOpenModal} onDelete={handleDeleteExpense} />;
            default:
                return null;
        }
    }

    return (
        <div className={pageContainerStyles}>
            <ExpenseModal isOpen={isModalOpen} expense={editingExpense} onSave={handleSaveExpense} onCancel={handleCloseModal} />
            <div className={mainContentWrapperStyles}>
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">Financial Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{companyData.companyName}</p>
                        </div>
                        <div className="flex-shrink-0 mt-4 sm:mt-0">
                            {activeTab === 'expenses' && (
                                <button onClick={() => handleOpenModal()} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <PlusCircle size={16} className="mr-2" />
                                    Add Expense
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                        {Object.entries(tabConfig).map(([tabKey, { label, icon: Icon }]) => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 outline-none
                                    ${activeTab === tabKey
                                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                                    }`}
                            >
                                <Icon size={16} className="mr-2" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <main>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default CompanyDashboardPage;