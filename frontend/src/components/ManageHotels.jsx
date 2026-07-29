import { useState } from 'react'
import api from '../api/axios'
import HotelFormModal from './HotelFormModal'
import ProviderBookForGuestModal from './ProviderBookForGuestModal'

export default function ManageHotels({ hotels, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = add mode
  const [bookingTarget, setBookingTarget] = useState(null) // hotel to book for someone

  const handleToggleStatus = async (hotel) => {
    const newStatus = hotel.status === 'Available' ? 'Unavailable' : 'Available'
    await api.put('/provider/hotels.php', { ...hotel, status: newStatus })
    onChanged()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Hotels</h2>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          + Add Hotel
        </button>
      </div>

      <div className="grid gap-4">
        {hotels.map((h) => (
          <div key={h.hotel_id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{h.hotel_name} — {h.location}</p>
              <p className="text-sm text-gray-600">
                ৳{h.price_per_night}/night · {h.available_rooms} rooms · {h.status}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingTarget(h)}
                className="text-green-700 text-sm font-medium"
              >
                Book for someone
              </button>
              <button
                onClick={() => { setEditing(h); setModalOpen(true) }}
                className="text-primary text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleStatus(h)}
                className="text-red-600 text-sm font-medium"
              >
                {h.status === 'Available' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
        {hotels.length === 0 && <p className="text-gray-500">No hotels listed yet.</p>}
      </div>

      {modalOpen && (
        <HotelFormModal
          initialData={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); onChanged() }}
        />
      )}

      {bookingTarget && (
        <ProviderBookForGuestModal
          listing={bookingTarget}
          bookingType="Hotel"
          onClose={() => setBookingTarget(null)}
          onBooked={() => { setBookingTarget(null); onChanged() }}
        />
      )}
    </div>
  )
}