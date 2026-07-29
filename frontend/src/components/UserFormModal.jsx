import { useState } from 'react';
import api from '../api/axios';

export default function UserFormModal({ initialData, onClose, onSaved }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    role: initialData?.role || 'traveler',
    password: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = isEdit
        ? await api.put('/admin/users.php', { user_id: initialData.user_id, ...form })
        : await api.post('/admin/users.php', form);
      if (res.data.success) onSaved();
      else setError(res.data.error || 'Could not save user.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold">{isEdit ? 'Edit User' : 'Add User'}</h3>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" className="w-full border rounded-md px-3 py-2" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded-md px-3 py-2" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border rounded-md px-3 py-2" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full border rounded-md px-3 py-2" />

        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
          <option value="traveler">Traveler</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={isEdit ? 'New password (leave blank to keep current)' : 'Password'}
          className="w-full border rounded-md px-3 py-2"
          required={!isEdit}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
          <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-md">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}