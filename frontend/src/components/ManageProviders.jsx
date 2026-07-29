import { useState } from 'react';
import api from '../api/axios';
import UserFormModal from './UserFormModal';

export default function ManageProviders({ providers, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (p) => {
    if (!window.confirm(
      `Delete ${p.full_name}? This also deletes all ${p.hotel_count} hotel(s) and ` +
      `${p.transport_count} transport listing(s) they created. This cannot be undone.`
    )) return;

    try {
      await api.delete(`/admin/users.php?id=${p.user_id}`);
      onChanged();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete provider.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Providers</h2>
      <div className="grid gap-4">
        {providers.map((p) => (
          <div key={p.user_id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{p.full_name} — {p.email}</p>
              <p className="text-sm text-gray-600">
                {p.hotel_count} hotel(s) · {p.transport_count} transport listing(s) ·
                joined {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditing(p); setModalOpen(true); }} className="text-primary text-sm font-medium">Edit</button>
              <button onClick={() => handleDelete(p)} className="text-red-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
        {providers.length === 0 && <p className="text-gray-500">No providers registered yet.</p>}
      </div>

      {modalOpen && (
        <UserFormModal
          initialData={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); onChanged(); }}
        />
      )}
    </div>
  );
}