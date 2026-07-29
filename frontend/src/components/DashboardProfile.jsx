import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DashboardProfile({ profile, onUpdated }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const inputClass =
    'border border-gray-300 rounded-md px-3 py-2 text-sm text-neutral-dark w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put('/profile.php', {
        full_name: fullName,
        phone,
        address,
      });
      if (res.data.success) {
        setSaved(true);
        onUpdated?.();
      } else {
        setError(res.data.error || 'Could not update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Email (not editable)
        <input
          type="email"
          value={profile.email}
          disabled
          className={`${inputClass} bg-gray-100 text-gray-500`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Phone
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Address
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {saved && <p className="text-green-600 text-sm">Profile updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60 self-start"
      >
        {submitting ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}