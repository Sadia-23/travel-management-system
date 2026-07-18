import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BookingModal({ hotel, onClose }) {
  const [travelDate, setTravelDate] = useState('');
  const [nights, setNights] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const total = hotel.price_per_night * nights;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!travelDate) {
      setError('Please select a travel date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/booking.php', {
        hotel_id: hotel.hotel_id,
        travel_date: travelDate,
        nights,
      });

      if (res.data.success) {
        setSuccess(res.data);
      } else {
        setError(res.data.error || 'Booking failed.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to book this hotel.');
      } else {
        setError(err.response?.data?.error || 'Booking failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'border border-gray-300 rounded-md px-3 py-2 text-sm text-neutral-dark w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 text-gray-400 hover:text-neutral-dark text-xl leading-none"
        >
          ×
        </button>

        {success ? (
          <div className="text-center py-4">
            <h2 className="text-xl font-bold text-neutral-dark mb-2">Booking confirmed!</h2>
            <p className="text-gray-500">Booking #{success.booking_id}</p>
            <p className="text-primary font-semibold text-lg mt-2">
              Total: ৳{success.total_price}
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="mt-6 bg-primary text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Browse more hotels
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-dark">Book {hotel.hotel_name}</h2>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Travel date
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Nights
              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className={inputClass}
              />
            </label>

            <p className="text-primary font-semibold text-lg">
              Total: ৳{total.toFixed(2)}
            </p>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
