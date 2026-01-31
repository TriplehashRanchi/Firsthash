'use client'
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://2203l2rj-8080.inc1.devtunnels.ms';

const Page = () => {
  const [token, setToken] = useState(null);
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const getFirebaseToken = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Admin not logged in');
    return user.getIdToken();
  };

  const handleFacebookLogin = async () => {
    try {
      const t = await getFirebaseToken();
      setToken(t);
      const response = await fetch(`${API_URL}/auth/facebook/init`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const fetchPages = async () => {
    try {
      const t = token || (await getFirebaseToken());
      setToken(t);
      const res = await fetch(`${API_URL}/api/fb/pages/available`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setPages(data.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load pages');
    }
  };

  const togglePage = (id) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const saveSelection = async () => {
    if (selected.size === 0) return alert('Select at least 1 page');
    setLoading(true);
    try {
      const t = token || (await getFirebaseToken());
      const res = await fetch(`${API_URL}/api/fb/pages/select`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${t}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds: Array.from(selected) }),
      });
      const data = await res.json();
      alert(data.message || 'Pages saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If user just returned from FB callback, you can auto-load pages
    if (window.location.search.includes('connected=true')) {
      fetchPages();
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={handleFacebookLogin}>Login with Facebook</button>

      <div style={{ marginTop: 20 }}>
        <button onClick={fetchPages}>Load Pages</button>
      </div>

      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => togglePage(p.id)}
              />
              {p.name} ({p.id})
            </label>
          </li>
        ))}
      </ul>

      <button disabled={loading} onClick={saveSelection}>
        {loading ? 'Saving...' : 'Save Selected Pages'}
      </button>
    </div>
  );
};

export default Page;
