import { useAuth } from '../context/AuthContext';
import { exportBookingsToPDF, exportBookingsToCSV } from '../utils/exportUtils';

export default function ExportBookings({ bookings, stats }) {
  const { user } = useAuth();

  const cards = [
    { label: 'Total bookings', value: stats?.total_bookings ?? 0 },
    { label: 'Upcoming', value: stats?.upcoming ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
    { label: 'Cancelled', value: stats?.cancelled ?? 0 },
    { label: 'Total spent', value: `৳${(stats?.total_spent ?? 0).toFixed(2)}` },
  ];

  const handleExportPDF = () => exportBookingsToPDF(bookings, { travelerName: user?.full_name });
  const handleExportCSV = () => exportBookingsToCSV(bookings);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Booking Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={bookings.length === 0}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            disabled={bookings.length === 0}
            className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md text-neutral-dark hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg shadow bg-white p-4 text-center">
            <p className="text-2xl font-bold text-primary">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <p className="text-gray-500 mt-6">No bookings yet — nothing to export.</p>
      )}
    </div>
  );
}