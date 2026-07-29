import { useState } from 'react'
import api from '../api/axios'
import TransportFormModal from './TransportFormModal'
import ProviderBookForGuestModal from './ProviderBookForGuestModal'

export default function ManageTransport({ transport, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = add mode
  const [bookingTarget, setBookingTarget] = useState(null) // listing to book for someone

  const handleToggleStatus = async (t) => {
    const newStatus = t.status === 'Available' ? 'Unavailable' : 'Available'
    await api.put('/provider/transport.php', { ...t, status: newStatus })
    onChanged()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Transport Listings</h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          + Add Transport
        </button>
      </div>

      <div className="grid gap-4">
        {transport.map((t) => (
          <div key={t.transport_id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">
                {t.vehicle_type} · {t.company_name} — {t.source} → {t.destination}
              </p>
              <p className="text-sm text-gray-600">
                ৳{t.price} · {t.available_seats} seats · {t.status}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingTarget(t)}
                className="text-green-700 text-sm font-medium"
              >
                Book for someone
              </button>
              <button
                onClick={() => { setEditing(t); setModalOpen(true) }}
                className="text-primary text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleStatus(t)}
                className="text-red-600 text-sm font-medium"
              >
                {t.status === 'Available' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
        {transport.length === 0 && <p className="text-gray-500">No transport listed yet.</p>}
      </div>

      {modalOpen && (
        <TransportFormModal
          initialData={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); onChanged() }}
        />
      )}

      {bookingTarget && (
        <ProviderBookForGuestModal
          listing={bookingTarget}
          bookingType="Transport"
          onClose={() => setBookingTarget(null)}
          onBooked={() => { setBookingTarget(null); onChanged() }}
        />
      )}
    </div>
  )
}