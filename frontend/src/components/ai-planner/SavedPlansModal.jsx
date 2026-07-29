import { FaTrash } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { LoadingBlock } from '../ui/Loading';

export default function SavedPlansModal({ plans, loading, onClose, onLoad, onDelete }) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <h2 className="font-display text-xl font-semibold text-neutral-dark mb-4">
        Your saved plans
      </h2>

      {loading && <LoadingBlock label="Loading saved plans…" />}

      {!loading && plans.length === 0 && (
        <EmptyState
          title="No saved plans yet"
          description="Generate an itinerary and hit “Save conversation” to keep it here."
        />
      )}

      {!loading && plans.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {plans.map((p) => (
            <div
              key={p.itinerary_id}
              className="flex items-center justify-between gap-3 border border-border rounded-lg p-3"
            >
              <button
                onClick={() => onLoad(p.itinerary_id)}
                className="text-left flex-1"
              >
                <p className="font-medium text-neutral-dark">{p.title}</p>
                <p className="text-xs text-gray-500">
                  {p.destination} · {p.travel_days} day(s) · ৳{Number(p.budget).toLocaleString()}
                  {p.travel_style ? ` · ${p.travel_style}` : ''}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Updated {new Date(p.updated_at).toLocaleString()}
                </p>
              </button>
              <Button
                variant="ghost"
                size="sm"
                icon={<FaTrash />}
                onClick={() => onDelete(p.itinerary_id)}
                aria-label="Delete plan"
              />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
