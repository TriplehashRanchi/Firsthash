'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { User, Edit3, Trash2, Eye, X, Briefcase, CalendarDays, FolderArchive } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

 const getAuthToken = async () => {
        const user = getAuth().currentUser;
        if (!user) throw new Error("User not authenticated.");
        return await user.getIdToken();
    };

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
                                <Link href={`/manager/show-details/${project.projectId}`} className="block p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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
                    <h3 className="text-xl font-bold text-slate-800 dark:text-gray-200">Edit Client</h3>
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
    const [companyId, setCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // FIX #1: Initialize with an empty array, NOT static data.
    const [allClients, setAllClients] = useState([]);
    const [recordsData, setRecordsData] = useState([]);
    
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState({ columnAccessor: 'created_at', direction: 'desc' });


    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


     const fetchAllData = async (cId) => {
        if (!cId) return;
        // Keep loading true if it's the initial fetch, otherwise don't show full-page loader for a simple refresh
        // setLoading(true); 
        try {
            const response = await axios.get(`${API_URL}/api/clients/with-projects`, { params: { company_id: cId } });
            setAllClients(response.data);
        } catch (err) {
            setError('Failed to refresh client data.');
        } finally {
            setLoading(false); // Ensure loading is always turned off
        }
    };

     useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // --- THIS IS THE FIX ---
                    // 1. Get the auth token from the currently logged-in user.
                    const token = await user.getIdToken();

                    // 2. Create the authorization header.
                    const headers = { Authorization: `Bearer ${token}` };

                    // 3. Pass the headers with the axios request.
                    const response = await axios.get(`${API_URL}/api/company/for-employee/${user.uid}`, { headers });
                    
                    const fetchedCompanyId = response.data?.id;
                    if (fetchedCompanyId) {
                        setCompanyId(fetchedCompanyId);
                        await fetchAllData(fetchedCompanyId);
                    } else { throw new Error("Company ID not found."); }
                } catch (err) { setError("Could not find the company you belong to."); setLoading(false); }
            } else { setError("User not logged in."); setLoading(false); }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let data = [...allClients];
        if (search) { data = data.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()))); }
        data = sortBy(data, sortStatus.columnAccessor);
        if (sortStatus.direction === 'desc') data.reverse();
        setRecordsData(data.slice((page - 1) * pageSize, page * pageSize));
    }, [allClients, search, sortStatus, page, pageSize]);

    // --- FINALIZED CRUD HANDLERS WITH AUTH TOKEN ---

    const handleSaveClient = async (updatedClientData) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            const dataToSave = {
                name: `${updatedClientData.firstName || ''} ${updatedClientData.lastName || ''}`.trim(),
                email: updatedClientData.email,
                phone: updatedClientData.phone,
            };
            
            // Call the OLD, working endpoint, but include the auth header
             await axios.put(`${API_URL}/api/clients/from-manager/${updatedClientData.id}`, updatedClientData);


            await fetchAllData(companyId);
            setIsEditModalOpen(false);
            alert('Client updated successfully!');
        } catch (err) {
            console.error("Save error:", err);
            alert("Error: Could not save client changes.");
        }
    };

    const handleDeleteClient = async (clientToDelete) => {
        if (window.confirm(`Are you sure you want to delete ${clientToDelete.firstName}?`)) {
            try {
                const token = await getAuth().currentUser.getIdToken();
                const headers = { Authorization: `Bearer ${token}` };

                await axios.delete(`${API_URL}/api/clients/${clientToDelete.id}`, { headers });
                
                await fetchAllData(companyId);
                alert('Client deleted successfully!');
            } catch (err) {
                console.error("Delete error:", err);
                alert("Error: Could not delete the client.");
            }
        }
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