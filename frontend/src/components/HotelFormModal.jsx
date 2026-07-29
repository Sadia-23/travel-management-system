import { useState } from 'react'
import api from '../api/axios'

export default function HotelFormModal({ initialData, onClose, onSaved }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    hotel_name: initialData?.hotel_name || '',
    location: initialData?.location || '',
    price_per_night: initialData?.price_per_night || '',
    available_rooms: initialData?.available_rooms || 0,
    description: initialData?.description || '',
    image: initialData?.image || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = isEdit
        ? await api.put('/provider/hotels.php', { hotel_id: initialData.hotel_id, ...form, status: initialData.status })
        : await api.post('/provider/hotels.php', form)
      if (res.data.success) onSaved()
      else setError(res.data.error || 'Could not save hotel.')
    } catch {
      setError('Could not save hotel.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold">{isEdit ? 'Edit Hotel' : 'Add Hotel'}</h3>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input name="hotel_name" value={form.hotel_name} onChange={handleChange} placeholder="Hotel name" className="w-full border rounded-md px-3 py-2" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border rounded-md px-3 py-2" required />
        <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} placeholder="Price per night" className="w-full border rounded-md px-3 py-2" required />
        <input name="available_rooms" type="number" value={form.available_rooms} onChange={handleChange} placeholder="Available rooms" className="w-full border rounded-md px-3 py-2" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border rounded-md px-3 py-2" />
        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className="w-full border rounded-md px-3 py-2" />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
          <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-md">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
