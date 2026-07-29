import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import TransportBookingModal from '../components/TransportBookingModal';

export default function TransportDetails() {
  const { id } = useParams();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchTransport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/transport.php', { params: { id } });
        if (res.data.success) {
          setTransport(res.data.transport);
        } else {
          setError('Transport option not found.');
        }
      } catch (err) {
        setError('Could not load transport option.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, [id]);

  if (loading) {
    return <p className="py-12 px-6 max-w-6xl mx-auto text-neutral-dark">Loading...</p>;
  }
  if (error) {
    return <p className="py-12 px-6 max-w-6xl mx-auto text-red-600">{error}</p>;
  }
  if (!transport) return null;

  const isBookable = transport.status === 'Available' && transport.available_seats > 0;

  return (
    <section className="py-12 px-6 max-w-4xl mx-auto">
      <Link to="/transport" className="text-sm text-primary hover:underline">
        ← Back to transport
      </Link>

      <div className="rounded-lg shadow overflow-hidden bg-white mt-4">
        <img
          src={transport.image}
          alt={transport.vehicle_type}
          className="w-full h-72 object-cover"
        />

        <div className="p-6">
          <h1 className="text-2xl font-bold text-neutral-dark">{transport.company_name}</h1>
          <p className="text-gray-500 mt-1">
            {transport.vehicle_type} · {transport.source} → {transport.destination}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-primary font-semibold text-lg">
              ৳{transport.price} / seat
            </span>
            <span className="text-sm text-gray-500">
              {transport.available_seats} seat(s) available
            </span>
          </div>

          <button
            disabled={!isBookable}
            onClick={() => setShowBooking(true)}
            className={`mt-6 px-6 py-2 rounded-md font-medium text-sm transition-colors ${
              isBookable
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isBookable ? 'Book now' : 'Fully booked'}
          </button>
        </div>
      </div>

      {showBooking && (
        <TransportBookingModal transport={transport} onClose={() => setShowBooking(false)} />
      )}
    </section>
  );
}