import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import ManageHotels from '../components/ManageHotels'
import ManageTransport from '../components/ManageTransport'
import ProviderBookings from '../components/ProviderBookings'
import Tabs from '../components/ui/Tabs'
import Alert from '../components/ui/Alert'
import { LoadingBlock } from '../components/ui/Loading'

const TABS = [
  { value: 'hotels', label: 'Manage Hotels' },
  { value: 'transport', label: 'Manage Transport' },
  { value: 'bookings', label: 'Bookings' },
]

export default function ProviderDashboard() {
  const [tab, setTab] = useState('hotels')
  const [hotels, setHotels] = useState([])
  const [transport, setTransport] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true) // first load only
  const [refreshing, setRefreshing] = useState(false) // background refresh — no spinner, no unmount
  const [error, setError] = useState('')

  const fetchAll = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true)
    setError('')
    try {
      const [h, t, b] = await Promise.all([
        api.get('/provider/hotels.php'),
        api.get('/provider/transport.php'),
        api.get('/provider/bookings.php'),
      ])
      if (h.data.success) setHotels(h.data.hotels)
      if (t.data.success) setTransport(t.data.transport)
      if (b.data.success) setBookings(b.data.bookings)
    } catch {
      setError('Could not load provider dashboard.')
    } finally {
      if (silent) setRefreshing(false); else setLoading(false)
    }
  }, [])

  // Passed to child panels as onChanged — refreshes data in place instead of
  // re-triggering the full loading state, so add/edit/deactivate doesn't
  // feel like the page reloaded.
  const refresh = useCallback(() => fetchAll({ silent: true }), [fetchAll])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">Provider</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-neutral-dark flex items-center gap-3">
          Provider dashboard
          {refreshing && (
            <span className="text-xs font-normal font-sans text-gray-400 animate-pulse">Saving…</span>
          )}
        </h1>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && <LoadingBlock label="Loading provider dashboard…" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          {tab === 'hotels' && <ManageHotels hotels={hotels} onChanged={refresh} />}
          {tab === 'transport' && <ManageTransport transport={transport} onChanged={refresh} />}
          {tab === 'bookings' && <ProviderBookings bookings={bookings} />}
        </>
      )}
    </section>
  )
}
