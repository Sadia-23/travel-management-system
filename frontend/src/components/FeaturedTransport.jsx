import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FeaturedTransport() {
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transport.php")
      .then((res) => {
        setTransport((res.data.transport || []).slice(0, 3));
      })
      .catch(() => setError("Could not load transport options right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto bg-neutral-light">
      <h2 className="text-2xl font-bold text-neutral-dark mb-6">Featured Transport</h2>

      {loading && <p className="text-neutral-dark">Loading transport options...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {transport.map((item) => (
          <div key={item.transport_id} className="rounded-lg shadow overflow-hidden bg-white">
            <img
              src={item.image}
              alt={item.vehicle_type}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-neutral-dark">{item.vehicle_type}</h3>
              <p className="text-sm text-gray-500">
                {item.company_name} · {item.source} → {item.destination}
              </p>
              <p className="text-primary font-semibold mt-2">${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
