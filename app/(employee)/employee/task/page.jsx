// app/(employee)/task/page.jsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Eye, X, Loader2, CalendarDays, ClipboardList, ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/* ----------------------------- helpers ----------------------------- */
const getAuthHeaders = async () => {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) return {};
  const token = await u.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const formatDate = (d) => {
  if (!d) return '—';
  try {
    // works with ISO and MySQL date/time strings
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

const statusLabel = (s) => {
  if (!s) return 'To Do';
  const map = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    completed: 'Completed',
    rejected: 'Rejected',
    ongoing: 'Ongoing',
  };
  return map[s] || String(s).replace(/_/g, ' ');
};

const StatusBadge = ({ status }) => {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize';
  const styles = {
    to_do: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-rose-100 text-rose-800',
    ongoing: 'bg-indigo-100 text-indigo-800',
    default: 'bg-gray-100 text-gray-800',
  };
  return <span className={`${base} ${styles[status] || styles.default}`}>{statusLabel(status)}</span>;
};

const PriorityBadge = ({ priority }) => {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase';
  const styles = {
    high: 'bg-rose-100 text-rose-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-emerald-100 text-emerald-800',
    default: 'bg-gray-100 text-gray-800',
  };
  const p = (priority || 'medium').toLowerCase();
  return <span className={`${base} ${styles[p] || styles.default}`}>{p}</span>;
};

const Loading = ({ text = 'Loading...' }) => (
  <div className="w-full flex items-center justify-center py-16 text-gray-600">
    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
    <span>{text}</span>
  </div>
);

const ErrorBox = ({ msg }) => (
  <div className="w-full rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">{msg}</div>
);

/* ------------------------------ Drawer ----------------------------- */
const Drawer = ({ open, onClose, children, title }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
      </div>
    </>
  );
};

/* ------------------------------- Page ------------------------------ */
export default function TaskPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setErr('');

      const auth = getAuth();
      if (!auth.currentUser) {
        setErr('Please sign in to view your work.');
        setLoading(false);
        return;
      }

      const headers = await getAuthHeaders();

      // ✅ use the new employee endpoints
      const [tRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/api/employee/tasks/assigned`, { headers, validateStatus: () => true }),
        axios.get(`${API_URL}/api/employee/projects/assigned`, { headers, validateStatus: () => true }),
      ]);

      console.log(" TASKS", tRes.data);
      console.log(" PROJECTS", pRes.data);
      if (tRes.status === 200 && Array.isArray(tRes.data)) {
        setTasks(tRes.data);
      } else if (tRes.status === 403) {
        setErr(tRes.data?.error || 'Access denied to tasks.');
        setTasks([]);
      } else {
        setTasks([]);
      }

      if (pRes.status === 200 && Array.isArray(pRes.data)) {
        setProjects(pRes.data);
      } else if (pRes.status === 403) {
        setErr((prev) => prev || pRes.data?.error || 'Access denied to projects.');
        setProjects([]);
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error(e);
      setErr('Failed to connect to the server.');
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) fetchAll();
      else {
        setLoading(false);
        setErr('Please sign in to view your work.');
      }
    });
    return () => unsub();
  }, [fetchAll]);

  const filteredTasks = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const okStatus = statusFilter === 'all' ? true : (t.status || 'to_do') === statusFilter;
      const text = `${t.title || ''} ${t.description || ''} ${t.project_name || ''}`.toLowerCase();
      return okStatus && (s ? text.includes(s) : true);
    });
  }, [tasks, search, statusFilter]);

  const filteredProjects = useMemo(() => {
    const s = search.trim().toLowerCase();
    return projects.filter((p) => {
      const text = `${p.name || ''} ${p.clientName || ''}`.toLowerCase();
      return s ? text.includes(s) : true;
    });
  }, [projects, search]);

  const openProjectDetails = async (projectId) => {
    setActiveProjectId(projectId);
    setDetails(null);
    setDetailsLoading(true);
    setDetailsOpen(true);
    try {
      const headers = await getAuthHeaders();

      // ✅ employee-safe details endpoint
      const pr = await axios.get(`${API_URL}/api/employee/projects/${projectId}/view`, {
        headers,
        validateStatus: () => true,
      });

      if (pr.status === 200) setDetails(pr.data);
      else setDetails(null);
    } catch (e) {
      console.error(e);
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Work</h1>
        <p className="text-sm text-gray-500">Everything you’re assigned to — tasks and projects. View-only.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center px-3 py-2 border rounded-lg w-full sm:w-80 bg-white">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task or project..."
              className="w-full outline-none text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border rounded-lg bg-white text-sm"
            >
              <option value="all">All task statuses</option>
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>
      </div>

      {loading && <Loading text="Loading your work..." />}
      {!loading && err && <ErrorBox msg={err} />}

      {/* Assigned Projects */}
      {!loading && !err && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Assigned Projects</h2>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Project</th>
                  <th className="px-4 py-3 text-left font-medium">Client</th>
                  <th className="px-4 py-3 text-left font-medium">Dates</th>
                  <th className="px-4 py-3 text-left font-medium">Counts</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No projects assigned to you.
                    </td>
                  </tr>
                )}
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                    </td>
                    <td className="px-4 py-3">{p.clientName || '—'}</td>
                    <td className="px-4 py-3">
                      <div>{formatDate(p.minDate)} — {formatDate(p.maxDate)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      <div>Shoots: {p.shoots ?? 0}</div>
                      <div>Deliverables: {p.deliverablesCompleted ?? 0}/{p.deliverablesTotal ?? 0}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openProjectDetails(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-gray-100"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* My Tasks */}
      {!loading && !err && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Task</th>
                  <th className="px-4 py-3 text-left font-medium">Project</th>
                  <th className="px-4 py-3 text-left font-medium">Due</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {statusFilter === 'all' && !search ? 'You have no assigned tasks.' : 'No tasks match your filters.'}
                    </td>
                  </tr>
                )}

                {filteredTasks.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{t.title || 'Untitled task'}</div>
                      {t.description && <div className="text-xs text-gray-500 line-clamp-1">{t.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{t.project_name || t.project_id}</div>
                      <div className="text-xs text-gray-500">Project</div>
                    </td>
                    <td className="px-4 py-3">{formatDate(t.due_date)}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer: project details */}
      <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Project Details">
        {!activeProjectId ? (
          <div className="text-sm text-gray-500">No project selected.</div>
        ) : (
          <>
            {detailsLoading && <Loading text="Loading project details..." />}
            {!detailsLoading && !details && (
              <div className="text-sm text-gray-500">Couldn’t load project details.</div>
            )}
            {!detailsLoading && details && (
              <>
                <section className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Overview</h4>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div><span className="text-gray-500">Project:</span> <span className="font-medium">{details.projectName || details.name}</span></div>
                    <div><span className="text-gray-500">Client:</span> {details.clientName || '—'}</div>
                    <div><span className="text-gray-500">Status:</span> {statusLabel(details.projectStatus || details.status)}</div>
                    <div><span className="text-gray-500">Total:</span> ₹{Number(details.overallTotalCost ?? details.totalCost ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                </section>

                {Array.isArray(details?.shoots?.shootList) && details.shoots.shootList.length > 0 && (
                  <section className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Shoots</h4>
                    <div className="space-y-2">
                      {details.shoots.shootList.map((s) => (
                        <div key={s.id} className="border rounded p-2 text-sm">
                          <div className="font-medium">{s.title} — {s.city}</div>
                          <div className="text-gray-500">
                            <CalendarDays className="inline-block w-4 h-4 mr-1 align[-2px]" />
                            {formatDate(s.date)} {s.time ? `• ${s.time}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {Array.isArray(details?.deliverables?.deliverableItems) && details.deliverables.deliverableItems.length > 0 && (
                  <section className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Deliverables</h4>
                    <div className="space-y-1 text-sm">
                      {details.deliverables.deliverableItems.map((d) => (
                        <div key={d.id} className="flex items-center justify-between border-b py-1">
                          <div>{d.title}</div>
                          <div className="text-xs text-gray-500">{statusLabel(d.status || '')}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
