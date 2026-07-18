import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FeaturedHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/hotels.php")
      .then((res) => {
        setHotels((res.data.hotels || []).slice(0, 3));
      })
      .catch(() => setError("Could not load hotels right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-neutral-dark mb-6">Featured Hotels</h2>

      {loading && <p className="text-neutral-dark">Loading hotels...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.hotel_id} className="rounded-lg shadow overflow-hidden bg-white">
            <img
              src={hotel.image}
              alt={hotel.hotel_name}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-neutral-dark">{hotel.hotel_name}</h3>
              <p className="text-sm text-gray-500">{hotel.location}</p>
              <p className="text-primary font-semibold mt-2">
                ${hotel.price_per_night} / night
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
