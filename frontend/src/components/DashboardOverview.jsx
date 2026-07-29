export default function DashboardOverview({ stats, bookings }) {
  const recent = bookings.slice(0, 5);

  const statCards = [
    { label: 'Total bookings', value: stats?.total_bookings ?? 0 },
    { label: 'Upcoming', value: stats?.upcoming ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
    { label: 'Total spent', value: `৳${(stats?.total_spent ?? 0).toFixed(2)}` },
  ];

  const statusColor = (status) => {
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-lg shadow bg-white p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-neutral-dark mb-4">Recent bookings</h2>

      {recent.length === 0 && (
        <p className="text-gray-500">You haven't made any bookings yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {recent.map((b) => (
          <div
            key={b.booking_id}
            className="rounded-lg shadow bg-white p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-neutral-dark">
                {b.booking_type === 'Hotel'
                  ? b.hotel_name
                  : `${b.company_name} (${b.source} → ${b.destination})`}
              </p>
              <p className="text-sm text-gray-500">
                {b.booking_type} · {b.travel_date}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary font-semibold">৳{b.total_price}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor(b.status)}`}>
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}