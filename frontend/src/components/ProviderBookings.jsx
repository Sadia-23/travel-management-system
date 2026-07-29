import { useState } from 'react';
import { exportBookingsToPDF, exportBookingsToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';

export default function ProviderBookings({ bookings }) {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Same idea as ManageBookings.jsx: this filtered array is what's on screen
  // AND what gets exported — not the raw bookings prop.
  const filtered = bookings.filter((b) => {
    const afterFrom = fromDate ? b.travel_date >= fromDate : true;
    const beforeTo = toDate ? b.travel_date <= toDate : true;
    return afterFrom && beforeTo;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Bookings on Your Listings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBookingsToPDF(filtered, { travelerName: user?.full_name || 'Provider export', reportLabel: 'Provider' })}
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

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(''); setToDate(''); }} className="text-sm text-gray-500 underline">
            Clear dates
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-500">No bookings found.</p>}
        {filtered.map((b) => (
          <div key={b.booking_id} className="border rounded-lg p-4">
            <p className="font-medium">
              {b.booking_type === 'Hotel'
                ? `${b.hotel_name} — ${b.hotel_location}`
                : `${b.company_name}: ${b.source} → ${b.destination}`}
            </p>
            <p className="text-sm text-gray-600">
              Booked by {b.traveler_name} ({b.traveler_email}) · Travel date: {b.travel_date}
              {b.booking_type === 'Transport' && b.seats ? ` · ${b.seats} seat(s)` : ''}
              {b.booking_type === 'Hotel' && b.nights ? ` · ${b.nights} night(s)` : ''}
              {b.booked_by && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
                  Booked by staff
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600">৳{b.total_price} · {b.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}