export default function AdminOverview({ users, providers, bookings }) {
  const travelers = users.filter(u => u.role === 'traveler').length;
  const admins = users.filter(u => u.role === 'admin').length;
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const upcoming = bookings.filter(b => b.status === 'Upcoming').length;

  const cards = [
    { label: 'Total Users', value: users.length },
    { label: 'Travelers', value: travelers },
    { label: 'Providers', value: providers.length },
    { label: 'Admins', value: admins },
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Upcoming Bookings', value: upcoming },
    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">{c.label}</p>
          <p className="text-2xl font-bold text-neutral-dark">{c.value}</p>
        </div>
      ))}
    </div>
  );
}