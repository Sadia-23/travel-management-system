import { useState, useEffect } from 'react';
import api from '../api/axios';
import { exportBookingsToPDF, exportBookingsToCSV } from '../utils/exportUtils';

const PER_PAGE = 10;

export default function ManageBookings({ bookings, onChanged }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleStatusChange = async (booking_id, status) => {
    try {
      await api.put('/admin/bookings.php', { booking_id, status });
      onChanged();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update booking.');
    }
  };

  const handleDelete = async (booking_id) => {
    if (!window.confirm('Permanently delete this booking? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/bookings.php?id=${booking_id}`);
      onChanged();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete booking.');
    }
  };

  // Search + date range together decide what's "currently on screen" —
  // this same filtered array is what gets exported below, not the raw list.
  const filtered = bookings.filter((b) => {
    const matchesSearch = search.trim()
      ? (b.traveler_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.traveler_email || '').toLowerCase().includes(search.toLowerCase())
      : true;
    const afterFrom = fromDate ? b.travel_date >= fromDate : true;
    const beforeTo = toDate ? b.travel_date <= toDate : true;
    return matchesSearch && afterFrom && beforeTo;
  });

  useEffect(() => { setPage(1); }, [search, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">All Bookings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBookingsToPDF(filtered, { travelerName: 'All bookings', reportLabel: 'Admin export' })}
            disabled={filtered.length === 0}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportBookingsToCSV(filtered)}
            disabled={filtered.length === 0}
            className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search traveler</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email..."
            className="border rounded-md px-3 py-2 text-sm w-56"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        {(search || fromDate || toDate) && (
          <button
            onClick={() => { setSearch(''); setFromDate(''); setToDate(''); }}
            className="text-sm text-gray-500 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((b) => (
          <div key={b.booking_id} className="border rounded-lg p-4 flex justify-between items-center flex-wrap gap-3">
            <div>
              <p className="font-medium">
                {b.booking_type === 'Hotel'
                  ? `${b.hotel_name} — ${b.hotel_location}`
                  : `${b.company_name}: ${b.source} → ${b.destination}`}
              </p>
              <p className="text-sm text-gray-600">
                Booked by {b.traveler_name} ({b.traveler_email}) · Travel date: {b.travel_date}
                {b.booked_by && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
                    Booked by staff
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600">৳{b.total_price}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={b.status}
                onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button onClick={() => handleDelete(b.booking_id)} className="text-red-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="text-gray-500">No bookings found.</p>}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40">
              Previous
            </button>
            <span className="px-2 py-1.5">Page {page} of {pageCount}</span>
            <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}