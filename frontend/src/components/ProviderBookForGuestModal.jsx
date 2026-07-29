import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProviderBookForGuestModal({ listing, bookingType, onClose, onBooked }) {
  const [mode, setMode] = useState('existing'); // 'existing' | 'guest'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
  const [travelDate, setTravelDate] = useState('');
  const [qty, setQty] = useState(1); // nights or seats
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (mode !== 'existing' || query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      api.get(`/provider/find_user.php?q=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data.users || []));
    }, 300);
    return () => clearTimeout(t);
  }, [query, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!travelDate) return setError('Please select a travel date.');
    if (mode === 'existing' && !selectedUser) return setError('Select a person from the search results.');
    if (mode === 'guest' && !guest.name.trim()) return setError("Enter the guest's name.");

    setSubmitting(true);
    try {
      const payload = {
        booking_type: bookingType,
        travel_date: travelDate,
        ...(bookingType === 'Hotel'
          ? { hotel_id: listing.hotel_id, nights: qty }
          : { transport_id: listing.transport_id, seats: qty }),
        ...(mode === 'existing'
          ? { user_id: selectedUser.user_id }
          : { guest_name: guest.name, guest_email: guest.email, guest_phone: guest.phone }),
      };
      const res = await api.post('/provider/book.php', payload);
      if (res.data.success) {
        setSuccess(res.data);
        onBooked?.();
      } else {
        setError(res.data.error || 'Booking failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-4 text-gray-400 hover:text-neutral-dark text-xl leading-none">
          ×
        </button>

        {success ? (
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">Booking created</h2>
            <p className="text-gray-500">Booking #{success.booking_id}</p>
            <p className="text-primary font-semibold text-lg mt-2">Total: ৳{success.total_price}</p>
            <button onClick={onClose} className="mt-6 bg-primary text-white px-5 py-2 rounded-md">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">
              Book for a person — {listing.hotel_name || listing.company_name}
            </h2>

            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`px-3 py-1.5 rounded-md border ${mode === 'existing' ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}
              >
                Existing traveler
              </button>
              <button
                type="button"
                onClick={() => setMode('guest')}
                className={`px-3 py-1.5 rounded-md border ${mode === 'guest' ? 'bg-primary text-white border-primary' : 'border-gray-300'}`}
              >
                Guest (no account)
              </button>
            </div>

            {mode === 'existing' ? (
              <div>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); }}
                  placeholder="Search name or email"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
                {results.length > 0 && !selectedUser && (
                  <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {results.map((u) => (
                      <button
                        type="button"
                        key={u.user_id}
                        onClick={() => { setSelectedUser(u); setQuery(u.full_name); setResults([]); }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {u.full_name} — {u.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                  placeholder="Guest full name"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                  required
                />
                <input
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  placeholder="Guest email (optional)"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
                <input
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  placeholder="Guest phone (optional)"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
            )}

            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border rounded-md px-3 py-2 text-sm w-full"
              required
            />

            <label className="flex items-center gap-2 text-sm">
              {bookingType === 'Hotel' ? 'Nights' : 'Seats'}
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="border rounded-md px-3 py-1.5 text-sm w-20"
              />
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={submitting} className="bg-primary text-white px-5 py-2 rounded-md disabled:opacity-60">
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}