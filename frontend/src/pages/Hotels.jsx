import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (minRating) params.min_rating = minRating;

      const res = await api.get('/hotels.php', { params });
      if (res.data.success) {
        setHotels(res.data.hotels);
      } else {
        setError('Could not load hotels.');
      }
    } catch (err) {
      setError('Could not load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setTimeout(fetchHotels, 0);
  };

  const inputClass =
    'border border-gray-300 rounded-md px-3 py-2 text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-dark mb-6">Hotels</h1>

      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap items-end gap-3 mb-8 bg-neutral-light p-4 rounded-lg"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Search</label>
          <input
            type="text"
            placeholder="Name or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} w-48`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Location</label>
          <input
            type="text"
            placeholder="e.g. Dhaka"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`${inputClass} w-36`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Min price</label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={`${inputClass} w-24`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Max price</label>
          <input
            type="number"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={`${inputClass} w-24`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className={inputClass}
          >
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md text-neutral-dark hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {loading && <p className="text-neutral-dark">Loading hotels...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && hotels.length === 0 && (
        <p className="text-gray-500">No hotels match your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Link
            to={`/hotels/${hotel.hotel_id}`}
            key={hotel.hotel_id}
            className="rounded-lg shadow overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <img
              src={hotel.image}
              alt={hotel.hotel_name}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-neutral-dark">{hotel.hotel_name}</h3>
              <p className="text-sm text-gray-500">{hotel.location}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-primary font-semibold">
                  ৳{hotel.price_per_night} / night
                </p>
                <p className="text-sm text-accent">⭐ {hotel.rating}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
