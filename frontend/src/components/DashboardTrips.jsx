import { useState } from 'react';
import { exportBookingsToPDF, exportBookingsToCSV } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';

export default function DashboardTrips({ bookings }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesStatus = filter === 'All' ? true : b.status === filter;
    const afterFrom = fromDate ? b.travel_date >= fromDate : true;
    const beforeTo = toDate ? b.travel_date <= toDate : true;
    return matchesStatus && afterFrom && beforeTo;
  });

  const statusColor = (status) => {
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-md border ${
                filter === f
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-neutral-dark hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBookingsToPDF(filtered, { travelerName: user?.full_name })}
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

      <div className="flex flex-wrap items-end gap-3 mb-6">
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

      {filtered.length === 0 && (
        <p className="text-gray-500">No {filter.toLowerCase() === 'all' ? '' : filter.toLowerCase()} trips found.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((b) => (
          <div key={b.booking_id} className="rounded-lg shadow bg-white overflow-hidden flex">
            <img
              src={b.booking_type === 'Hotel' ? b.hotel_image : b.transport_image}
              alt=""
              className="w-28 h-28 object-cover"
            />
            <div className="p-4 flex-1 flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-dark">
                  {b.booking_type === 'Hotel'
                    ? b.hotel_name
                    : `${b.company_name} (${b.vehicle_type})`}
                </p>
                <p className="text-sm text-gray-500">
                  {b.booking_type === 'Hotel'
                    ? b.hotel_location
                    : `${b.source} → ${b.destination}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Travel date: {b.travel_date}
                  {b.booking_type === 'Transport' && b.seats
                    ? ` · ${b.seats} seat${b.seats > 1 ? 's' : ''}`
                    : ''}
                  {b.booking_type === 'Hotel' && b.nights
                    ? ` · ${b.nights} night${b.nights > 1 ? 's' : ''}`
                    : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold">৳{b.total_price}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}