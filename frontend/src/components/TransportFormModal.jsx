import { useState } from 'react'
import api from '../api/axios'

export default function TransportFormModal({ initialData, onClose, onSaved }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    vehicle_type: initialData?.vehicle_type || 'Bus',
    company_name: initialData?.company_name || '',
    source: initialData?.source || '',
    destination: initialData?.destination || '',
    departure_time: initialData?.departure_time || '',
    arrival_time: initialData?.arrival_time || '',
    price: initialData?.price || '',
    available_seats: initialData?.available_seats || 0,
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
        ? await api.put('/provider/transport.php', { transport_id: initialData.transport_id, ...form, status: initialData.status })
        : await api.post('/provider/transport.php', form)
      if (res.data.success) onSaved()
      else setError(res.data.error || 'Could not save transport.')
    } catch {
      setError('Could not save transport.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold">{isEdit ? 'Edit Transport' : 'Add Transport'}</h3>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
          <option value="Bus">Bus</option>
          <option value="Train">Train</option>
          <option value="Flight">Flight</option>
          <option value="Car">Car</option>
        </select>

        <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company name" className="w-full border rounded-md px-3 py-2" required />
        <input name="source" value={form.source} onChange={handleChange} placeholder="Source" className="w-full border rounded-md px-3 py-2" required />
        <input name="destination" value={form.destination} onChange={handleChange} placeholder="Destination" className="w-full border rounded-md px-3 py-2" required />

        <label className="block text-sm text-gray-600">Departure time</label>
        <input name="departure_time" type="datetime-local" value={form.departure_time} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />

        <label className="block text-sm text-gray-600">Arrival time</label>
        <input name="arrival_time" type="datetime-local" value={form.arrival_time} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />

        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border rounded-md px-3 py-2" required />
        <input name="available_seats" type="number" value={form.available_seats} onChange={handleChange} placeholder="Available seats" className="w-full border rounded-md px-3 py-2" />
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
