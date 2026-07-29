import { useState, useEffect, useCallback } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AdminOverview from '../components/AdminOverview';
import ManageUsers from '../components/ManageUsers';
import ManageProviders from '../components/ManageProviders';
import ManageBookings from '../components/ManageBookings';
import Tabs from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { LoadingBlock } from '../components/ui/Loading';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'users', label: 'Manage Users' },
  { value: 'providers', label: 'Manage Providers' },
  { value: 'bookings', label: 'Manage Bookings' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // first load only — shows the big spinner
  const [refreshing, setRefreshing] = useState(false); // background refresh after add/edit/delete — no spinner, no unmount
  const [error, setError] = useState('');

  const fetchAll = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [u, p, b] = await Promise.all([
        api.get('/admin/users.php'),
        api.get('/admin/providers.php'),
        api.get('/admin/bookings.php'),
      ]);
      if (u.data.success) setUsers(u.data.users);
      if (p.data.success) setProviders(p.data.providers);
      if (b.data.success) setBookings(b.data.bookings);
    } catch {
      setError('Could not load admin dashboard.');
    } finally {
      if (silent) setRefreshing(false); else setLoading(false);
    }
  }, []);

  // Passed to child panels as onChanged — refetches in the background instead
  // of re-showing the full-page loader, so editing a row doesn't feel like
  // the page reloaded (and search/filter/pagination state isn't lost).
  const refresh = useCallback(() => fetchAll({ silent: true }), [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">Admin</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-neutral-dark flex items-center gap-3">
            Admin dashboard
            {refreshing && (
              <span className="text-xs font-normal font-sans text-gray-400 animate-pulse">Saving…</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Signed in as {user?.full_name}</p>
        </div>
        <Button variant="danger" icon={<FaSignOutAlt />} onClick={logout}>Logout</Button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && <LoadingBlock label="Loading admin dashboard…" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          {tab === 'overview' && <AdminOverview users={users} providers={providers} bookings={bookings} />}
          {tab === 'users' && <ManageUsers users={users} currentUserId={user.user_id} onChanged={refresh} />}
          {tab === 'providers' && <ManageProviders providers={providers} onChanged={refresh} />}
          {tab === 'bookings' && <ManageBookings bookings={bookings} onChanged={refresh} />}
        </>
      )}
    </section>
  );
}
