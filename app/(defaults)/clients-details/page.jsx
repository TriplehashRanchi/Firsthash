'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { User, Edit3, Trash2, Eye, X, Briefcase, CalendarDays, FolderArchive } from 'lucide-react';
import Link from 'next/link';

// --- Data: Every client is guaranteed to have projects ---
const initialRowData = [
    {
        id: 1,
        firstName: 'Caroline',
        lastName: 'Jensen',
        email: 'carolinejensen@zidant.com',
        phone: '+1 (821) 447-3782',
        projects: [
            { projectId: 'PJ101', name: 'Anika & Rohan Wedding', event: 'Wedding', date: '2024-12-15' },
            { projectId: 'PJ102', name: 'Family Portraits 2023', event: 'Portrait Session', date: '2023-11-20' },
        ]
    },
    {
        id: 2,
        firstName: 'Celeste',
        lastName: 'Grant',
        email: 'celestegrant@polarax.com',
        phone: '+1 (838) 515-3408',
        projects: [
            { projectId: 'PJ103', name: 'Aarav 1st Birthday', event: 'Birthday', date: '2025-01-20' }
        ]
    },
    {
        id: 3,
        firstName: 'Tillman',
        lastName: 'Forbes',
        email: 'tillmanforbes@manglo.com',
        phone: '+1 (969) 496-2892',
        projects: [
             { projectId: 'PJ108', name: 'Corporate Headshots', event: 'Corporate', date: '2024-11-30' }
        ]
    },
    {
        id: 4,
        firstName: 'Daisy',
        lastName: 'Whitley',
        email: 'daisywhitley@applideck.com',
        phone: '+1 (861) 564-2877',
        projects: [
            { projectId: 'PJ104', name: 'Priya & Sameer Sangeet', event: 'Pre-Wedding', date: '2025-02-18' },
            { projectId: 'PJ105', name: 'Product Shoot - Summer Collection', event: 'Commercial', date: '2024-05-10' },
            { projectId: 'PJ106', name: 'Maternity Shoot', event: 'Maternity', date: '2024-09-01' },
        ]
    },
    {
        id: 5,
        firstName: 'Weber',
        lastName: 'Bowman',
        email: 'weberbowman@volax.com',
        phone: '+1 (962) 466-3483',
        projects: [
            { projectId: 'PJ107', name: 'Annual Gala Dinner', event: 'Corporate Event', date: '2024-12-05' }
        ]
    },
];

// --- Modal for Listing Projects ---
const ProjectListModal = ({ client, isOpen, onClose }) => {
    if (!isOpen || !client) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Projects for {client.firstName} {client.lastName}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"><X size={24} /></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-5">
                    <ul className="space-y-3">
                        {client.projects.map((project) => (
                            <li key={project.projectId}>
                                <Link href={`/project-review/${project.projectId}`} className="block p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">{project.name}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5"><Briefcase size={14} /> {project.event}</span>
                                                <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {project.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0"><span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">View Details</span></div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Modal for Editing a Client ---
const EditClientModal = ({ client, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        // Initialize form data when the client prop is available
        if (client) {
            setFormData({ ...client });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[51] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Client</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">First Name</label>
                                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="form-input w-full" required />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Last Name</label>
                                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="form-input w-full" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="form-input w-full" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="form-input w-full" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 p-5 border-t dark:border-slate-700">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientDataTable = () => {
    // --- State Management ---
    const [allClients, setAllClients] = useState(sortBy(initialRowData, 'firstName'));
    const [recordsData, setRecordsData] = useState([]);
    
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState({ columnAccessor: 'firstName', direction: 'asc' });

    // Modals state
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // --- Data Processing useEffect ---
    useEffect(() => {
        let filteredClients = [...allClients];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredClients = filteredClients.filter((item) =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchLower)
                ) ||
                item.projects.some(p => p.name.toLowerCase().includes(searchLower))
            );
        }

        // Apply sorting
        const sortedData = sortBy(filteredClients, sortStatus.columnAccessor);
        if (sortStatus.direction === 'desc') {
            sortedData.reverse();
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData(sortedData.slice(from, to));
        
    }, [allClients, search, sortStatus, page, pageSize]);

    // --- CRUD Handlers ---
    const handleDeleteClient = (clientToDelete) => {
        if (window.confirm(`Are you sure you want to delete ${clientToDelete.firstName}?`)) {
            setAllClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
        }
    };
    
    const handleSaveClient = (updatedClient) => {
        setAllClients(prevClients => 
            prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
        );
        setIsEditModalOpen(false); // Close modal on save
    };

    // --- Modal Open/Close Handlers ---
    const openProjectModal = (client) => {
        setSelectedClient(client);
        setIsProjectModalOpen(true);
    };
    
    const openEditModal = (client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };

    return (
        <>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Clients</h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'firstName', title: 'User', sortable: true,
                                render: ({ firstName, lastName }) => (
                                    <div className="flex items-center w-max">
                                        <div className="w-9 h-9 grid place-content-center rounded-full bg-slate-200 dark:bg-slate-700 ltr:mr-2 rtl:ml-2">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>{firstName + ' ' + lastName}</div>
                                    </div>
                                ),
                            },
                            { accessor: 'email', sortable: true },
                            { accessor: 'phone', title: 'Phone No.', sortable: true },
                            {
                                accessor: 'projects', title: 'Projects', sortable: true,
                                render: (client) => (
                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openProjectModal(client)}>
                                        {client.projects.length} {client.projects.length > 1 ? 'Projects' : 'Project'}
                                    </button>
                                ),
                            },
                            {
                                accessor: 'actions', title: 'Actions', textAlignment: 'center',
                                render: (client) => (
                                    <div className="flex justify-center gap-3">
                                        <button type="button" className="text-blue-500 hover:text-blue-700" onClick={() => openEditModal(client)}>
                                            <Edit3 size={18} />
                                        </button>
                                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteClient(client)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        totalRecords={allClients.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>

            <ProjectListModal client={selectedClient} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
            <EditClientModal client={selectedClient} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveClient} />
        </>
    );
};

export default ClientDataTable;