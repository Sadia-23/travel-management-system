import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Transport() {
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchTransport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (source) params.source = source;
      if (destination) params.destination = destination;
      if (vehicleType) params.vehicle_type = vehicleType;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const res = await api.get('/transport.php', { params });
      if (res.data.success) {
        setTransport(res.data.transport);
      } else {
        setError('Could not load transport options.');
      }
    } catch (err) {
      setError('Could not load transport options.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransport();
  };

  const handleReset = () => {
    setSource('');
    setDestination('');
    setVehicleType('');
    setMinPrice('');
    setMaxPrice('');
    setTimeout(fetchTransport, 0);
  };

  const inputClass =
    'border border-gray-300 rounded-md px-3 py-2 text-sm text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-dark mb-6">Transport</h1>

      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap items-end gap-3 mb-8 bg-neutral-light p-4 rounded-lg"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">From</label>
          <input
            type="text"
            placeholder="e.g. Dhaka"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`${inputClass} w-36`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">To</label>
          <input
            type="text"
            placeholder="e.g. Sylhet"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={`${inputClass} w-36`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className={inputClass}
          >
            <option value="">Any type</option>
            <option value="Bus">Bus</option>
            <option value="Train">Train</option>
            <option value="Flight">Flight</option>
            <option value="Car">Car</option>
          </select>
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

      {loading && <p className="text-neutral-dark">Loading transport options...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && transport.length === 0 && (
        <p className="text-gray-500">No transport options match your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {transport.map((item) => (
          <Link
            to={`/transport/${item.transport_id}`}
            key={item.transport_id}
            className="rounded-lg shadow overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <img
              src={item.image}
              alt={item.vehicle_type}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-neutral-dark">{item.company_name}</h3>
              <p className="text-sm text-gray-500">
                {item.vehicle_type} · {item.source} → {item.destination}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-primary font-semibold">৳{item.price}</p>
                <p className="text-sm text-gray-500">{item.available_seats} seats left</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}