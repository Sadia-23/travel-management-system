import { useState, useEffect } from 'react';
import api from '../api/axios';
import UserFormModal from './UserFormModal';

const PER_PAGE = 10;

export default function ManageUsers({ users, currentUserId, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const handleDelete = async (u) => {
    if (!window.confirm(
      `Delete ${u.full_name}? This also deletes their bookings` +
      (u.role === 'provider' ? ', hotels and transport listings' : '') +
      `. This cannot be undone.`
    )) return;

    try {
      await api.delete(`/admin/users.php?id=${u.user_id}`);
      onChanged();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete user.');
    }
  };

  const roleFiltered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const searched = search.trim()
    ? roleFiltered.filter((u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : roleFiltered;

  // Reset back to page 1 whenever the search or role filter changes, so you're
  // never stuck looking at "page 4" of a filtered list that only has 1 page.
  useEffect(() => { setPage(1); }, [search, filter]);

  const pageCount = Math.max(1, Math.ceil(searched.length / PER_PAGE));
  const visible = searched.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">All Users</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="border rounded-md px-3 py-2 text-sm w-56"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="all">All roles</option>
            <option value="traveler">Travelers</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-neutral-light text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.phone || '—'}</td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => { setEditing(u); setModalOpen(true); }} className="text-primary font-medium">Edit</button>
                  {u.user_id !== currentUserId && (
                    <button onClick={() => handleDelete(u)} className="text-red-600 font-medium">Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {searched.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, searched.length)} of {searched.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-1.5">Page {page} of {pageCount}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

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