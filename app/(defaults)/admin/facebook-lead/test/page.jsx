'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const Page = () => {
  const [token, setToken] = useState(null);
  const [connectedPages, setConnectedPages] = useState([]);
  const [availablePages, setAvailablePages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectedError, setConnectedError] = useState('');
  const [loadingConnected, setLoadingConnected] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const requestJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const raw = await res.text();
    let json = {};
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`Invalid JSON response (${res.status})`);
    }
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
    }
    return json;
  };

  const getFirebaseToken = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Admin not logged in');
    const t = await user.getIdToken();
    setToken(t);
    return t;
  };

  const normalizeAvailablePage = (page) => ({
    id: String(page?.id || page?.page_id || ''),
    name: page?.name || page?.page_name || 'Untitled page',
  });

  const normalizeConnectedPage = (page) => ({
    page_id: String(page?.page_id || page?.id || ''),
    page_name: page?.page_name || page?.name || 'Unnamed page',
    is_subscribed: Number(page?.is_subscribed || 0),
    updated_at: page?.updated_at || null,
  });

  const fetchConnectedPages = async () => {
    try {
      setLoadingConnected(true);
      setConnectedError('');
      const t = token || (await getFirebaseToken());

      const json = await requestJson(`${API_URL}/api/fb/pages`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      const rows = (json?.data || [])
        .map(normalizeConnectedPage)
        .filter((p) => p.page_id);

      setConnectedPages(rows);
      setSelected(new Set(rows.map((p) => p.page_id)));
      setConnectionStatus('connected');
    } catch (err) {
      setConnectedPages([]);
      setConnectionStatus('not-connected');
      setConnectedError(err.message || 'Failed to load connected pages');
    } finally {
      setLoadingConnected(false);
    }
  };

  const fetchAvailablePages = async () => {
    try {
      setLoadingAvailable(true);
      const t = token || (await getFirebaseToken());

      const json = await requestJson(`${API_URL}/api/fb/pages/available`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      const rows = (Array.isArray(json?.data) ? json.data : [])
        .map(normalizeAvailablePage)
        .filter((p) => p.id);

      setAvailablePages(rows);
    } catch (err) {
      alert(err.message || 'Failed to load available pages');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const t = token || (await getFirebaseToken());
      const json = await requestJson(`${API_URL}/auth/facebook/init`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!json?.redirectUrl) throw new Error('No redirect URL from backend');
      window.location.href = json.redirectUrl;
    } catch (err) {
      alert(err.message);
    }
  };

  const togglePage = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveSelection = async () => {
    if (!selected.size) return alert('Select at least 1 page');
    try {
      setSaving(true);
      const t = token || (await getFirebaseToken());

      const json = await requestJson(`${API_URL}/api/fb/pages/select`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${t}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds: Array.from(selected) }),
      });

      alert(json?.message || 'Pages saved');
      await fetchConnectedPages();
    } catch (err) {
      alert(err.message || 'Failed to save pages');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (!user) {
        setToken(null);
        setConnectionStatus('not-connected');
        return;
      }
      const t = await user.getIdToken();
      setToken(t);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !token) return;
    fetchConnectedPages();
  }, [authReady, token]);

  const selectedCount = selected.size;
  const availableById = useMemo(
    () => Object.fromEntries(availablePages.map((p) => [p.id, p])),
    [availablePages]
  );
  const selectedNames = useMemo(
    () =>
      Array.from(selected).map(
        (id) => availableById[id]?.name || connectedPages.find((p) => p.page_id === id)?.page_name || id
      ),
    [selected, availableById, connectedPages]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="panel rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="font-medium">Connection Status:</span>
          <span
            className={
              connectionStatus === 'connected'
                ? 'text-success'
                : connectionStatus === 'checking'
                  ? 'text-warning'
                  : 'text-danger'
            }
          >
            {connectionStatus === 'connected'
              ? 'Connected'
              : connectionStatus === 'checking'
                ? 'Checking...'
                : 'Not connected'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {connectionStatus !== 'connected' && (
            <button className="btn btn-primary btn-sm" onClick={handleFacebookLogin}>
              Connect Facebook
            </button>
          )}
          <button className="btn btn-outline-primary btn-sm" onClick={fetchConnectedPages} disabled={loadingConnected || !authReady}>
            {loadingConnected ? 'Loading connected...' : 'Load Connected Pages'}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchAvailablePages} disabled={loadingAvailable || !authReady}>
            {loadingAvailable ? 'Loading available...' : 'Load Available Pages'}
          </button>
        </div>

        {connectedError ? <p className="mt-3 text-sm text-danger">{connectedError}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-lg font-semibold">Connected Pages ({connectedPages.length})</h3>
          {loadingConnected ? (
            <p className="text-sm text-gray-500">Loading connected pages...</p>
          ) : connectedPages.length === 0 ? (
            <p className="text-sm text-gray-500">No saved pages for this admin yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-2">Page Name</th>
                    <th className="px-2 py-2">Page ID</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Last Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {connectedPages.map((page) => (
                    <tr key={page.page_id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-2 py-2">{page.page_name}</td>
                      <td className="px-2 py-2 text-gray-500">{page.page_id}</td>
                      <td className="px-2 py-2">
                        {page.is_subscribed ? (
                          <span className="text-success">Connected</span>
                        ) : (
                          <span className="text-warning">Not Subscribed</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-500">{page.updated_at ? new Date(page.updated_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-lg font-semibold">Available Pages ({availablePages.length})</h3>
          {loadingAvailable ? (
            <p className="text-sm text-gray-500">Loading available pages...</p>
          ) : availablePages.length === 0 ? (
            <p className="text-sm text-gray-500">Click "Load Available Pages" to fetch pages from Facebook.</p>
          ) : (
            <ul className="space-y-2">
              {availablePages.map((page) => (
                <li key={page.id} className="rounded-md border border-gray-200 p-2 text-sm dark:border-gray-700">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={selected.has(page.id)} onChange={() => togglePage(page.id)} />
                    <span>
                      {page.name} <span className="text-gray-500">({page.id})</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-2 text-sm font-medium">Selected Pages: {selectedCount}</p>
        <p className="mb-4 text-xs text-gray-500">{selectedNames.slice(0, 5).join(', ') || 'None selected'}</p>
        <button className="btn btn-success btn-sm" disabled={saving || selectedCount === 0} onClick={saveSelection}>
          {saving ? 'Saving...' : 'Save Selected Pages'}
        </button>
      </div>
    </div>
  );
};

export default Page;
