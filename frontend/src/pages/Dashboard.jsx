import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardOverview from '../components/DashboardOverview';
import DashboardProfile from '../components/DashboardProfile';
import DashboardTrips from '../components/DashboardTrips';
import ExportBookings from '../components/ExportBookings';
import Tabs from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';
import { LoadingBlock } from '../components/ui/Loading';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'trips', label: 'My Trips' },
  { value: 'export', label: 'Export' },
  { value: 'profile', label: 'Profile' },
];

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // first load only
  const [refreshing, setRefreshing] = useState(false); // background refresh — no spinner, no unmount
  const [error, setError] = useState('');

  const fetchAll = async ({ silent } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        api.get('/bookings.php'),
        api.get('/profile.php'),
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
        setStats(bookingsRes.data.stats);
      }
      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
      }
      if (!bookingsRes.data.success || !profileRes.data.success) {
        setError('Could not load some dashboard data.');
      }
    } catch (err) {
      setError('Could not load dashboard.');
    } finally {
      if (silent) setRefreshing(false); else setLoading(false);
    }
  };

  // Passed to DashboardProfile as onUpdated — refreshes in the background
  // instead of re-showing the full-page loader after saving.
  const refresh = () => fetchAll({ silent: true });

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <section className="py-12 px-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">Traveler</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-neutral-dark flex items-center gap-3">
          My dashboard
          {refreshing && (
            <span className="text-xs font-normal font-sans text-gray-400 animate-pulse">Saving…</span>
          )}
        </h1>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && <LoadingBlock label="Loading dashboard…" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          {tab === 'overview' && <DashboardOverview stats={stats} bookings={bookings} />}
          {tab === 'trips' && <DashboardTrips bookings={bookings} />}
          {tab === 'export' && <ExportBookings bookings={bookings} stats={stats} />}
          {tab === 'profile' && (
            <DashboardProfile profile={profile} onUpdated={refresh} />
          )}
        </>
      )}
    </section>
  );
}
