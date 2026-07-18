import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import BookingModal from '../components/BookingModal';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/hotels.php', { params: { id } });
        if (res.data.success) {
          setHotel(res.data.hotel);
        } else {
          setError('Hotel not found.');
        }
      } catch (err) {
        setError('Could not load hotel.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) {
    return <p className="py-12 px-6 max-w-6xl mx-auto text-neutral-dark">Loading hotel...</p>;
  }
  if (error) {
    return <p className="py-12 px-6 max-w-6xl mx-auto text-red-600">{error}</p>;
  }
  if (!hotel) return null;

  const isBookable = hotel.status === 'Available' && hotel.available_rooms > 0;

  return (
    <section className="py-12 px-6 max-w-4xl mx-auto">
      <Link to="/hotels" className="text-sm text-primary hover:underline">
        ← Back to hotels
      </Link>

      <div className="rounded-lg shadow overflow-hidden bg-white mt-4">
        <img
          src={hotel.image}
          alt={hotel.hotel_name}
          className="w-full h-72 object-cover"
        />

        <div className="p-6">
          <h1 className="text-2xl font-bold text-neutral-dark">{hotel.hotel_name}</h1>
          <p className="text-gray-500 mt-1">{hotel.location}</p>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-primary font-semibold text-lg">
              ৳{hotel.price_per_night} / night
            </span>
            <span className="text-accent text-sm">⭐ {hotel.rating}</span>
            <span className="text-sm text-gray-500">
              {hotel.available_rooms} room(s) available
            </span>
          </div>

          <p className="text-neutral-dark mt-4 leading-relaxed">
            {hotel.description || 'No description provided.'}
          </p>

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
        <BookingModal hotel={hotel} onClose={() => setShowBooking(false)} />
      )}
    </section>
  );
}
