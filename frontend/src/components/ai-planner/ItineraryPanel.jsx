import { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { inputClass } from '../ui/FormField';

const FIELD_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  accommodation: 'Accommodation',
};

/**
 * Renders the itinerary the chat is currently converging on, and lets the
 * traveler switch into an edit mode to directly change any day's plan,
 * the budget breakdown, or the tips — without needing to ask the assistant.
 * Saving edits commits them as the new "current" itinerary and adds a
 * system note to the conversation so the edit is reflected in later turns.
 */
export default function ItineraryPanel({ itinerary, onManualEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(itinerary);

  useEffect(() => {
    if (!editing) setDraft(itinerary);
  }, [itinerary, editing]);

  if (!itinerary) return null;

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(itinerary)));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(itinerary);
    setEditing(false);
  };

  const saveEdit = () => {
    onManualEdit(draft);
    setEditing(false);
  };

  const updateDay = (idx, field, value) => {
    setDraft((d) => {
      const day_plans = [...d.day_plans];
      day_plans[idx] = { ...day_plans[idx], [field]: value };
      return { ...d, day_plans };
    });
  };

  const removeDay = (idx) => {
    setDraft((d) => {
      const day_plans = d.day_plans
        .filter((_, i) => i !== idx)
        .map((day, i) => ({ ...day, day: i + 1 }));
      return { ...d, day_plans, days: day_plans.length };
    });
  };

  const addDay = () => {
    setDraft((d) => {
      const last = d.day_plans[d.day_plans.length - 1];
      const newDay = {
        ...last,
        day: (last?.day || d.day_plans.length) + 1,
        title: `Day ${(last?.day || d.day_plans.length) + 1}: More time in ${d.destination}`,
      };
      const day_plans = [...d.day_plans, newDay];
      return { ...d, day_plans, days: day_plans.length };
    });
  };

  const updateBudget = (key, value) => {
    setDraft((d) => ({
      ...d,
      budget_breakdown: { ...d.budget_breakdown, [key]: Number(value) || 0 },
    }));
  };

  const updateTip = (idx, value) => {
    setDraft((d) => {
      const tips = [...d.tips];
      tips[idx] = value;
      return { ...d, tips };
    });
  };

  const removeTip = (idx) => {
    setDraft((d) => ({ ...d, tips: d.tips.filter((_, i) => i !== idx) }));
  };

  const addTip = () => {
    setDraft((d) => ({ ...d, tips: [...(d.tips || []), ''] }));
  };

  const shown = editing ? draft : itinerary;

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-neutral-dark">
            {shown.destination} — {shown.days} day{shown.days === 1 ? '' : 's'}
          </h2>
          <p className="text-sm text-gray-500">
            Budget: ৳{Number(shown.budget || 0).toLocaleString()} · Style: {shown.style}
            {shown.preferences?.length ? ` · ${shown.preferences.join(', ')}` : ''}
          </p>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" icon={<FaEdit />} onClick={startEdit}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<FaTimes />} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={<FaCheck />} onClick={saveEdit}>
              Save edits
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {shown.day_plans?.map((d, idx) => (
          <div key={d.day ?? idx} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              {editing ? (
                <input
                  className={`${inputClass} font-semibold`}
                  value={d.title || ''}
                  onChange={(e) => updateDay(idx, 'title', e.target.value)}
                />
              ) : (
                <p className="font-semibold text-neutral-dark">{d.title || `Day ${d.day}`}</p>
              )}
              {editing && (
                <button
                  onClick={() => removeDay(idx)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                  aria-label="Remove day"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <div className="grid gap-2 text-sm text-neutral-dark">
              {['morning', 'afternoon', 'evening', 'accommodation'].map((field) => (
                <div key={field} className="flex gap-2">
                  <span className="w-28 shrink-0 text-gray-500">{FIELD_LABELS[field]}</span>
                  {editing ? (
                    <input
                      className={inputClass}
                      value={d[field] || ''}
                      onChange={(e) => updateDay(idx, field, e.target.value)}
                    />
                  ) : (
                    <span>{d[field] || '-'}</span>
                  )}
                </div>
              ))}
              <div className="flex gap-2 items-center">
                <span className="w-28 shrink-0 text-gray-500">Est. cost</span>
                {editing ? (
                  <input
                    type="number"
                    className={`${inputClass} max-w-[140px]`}
                    value={d.estimated_cost ?? 0}
                    onChange={(e) => updateDay(idx, 'estimated_cost', Number(e.target.value) || 0)}
                  />
                ) : (
                  <span className="text-primary font-medium">৳{Number(d.estimated_cost || 0).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {editing && (
          <Button variant="outline" size="sm" icon={<FaPlus />} onClick={addDay}>
            Add a day
          </Button>
        )}
      </div>

      {shown.budget_breakdown && (
        <div>
          <h3 className="font-semibold text-neutral-dark mb-2">Budget breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(shown.budget_breakdown).map(([key, value]) => (
              <div key={key} className="border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 capitalize">{key}</p>
                {editing ? (
                  <input
                    type="number"
                    className={`${inputClass} text-center mt-1`}
                    value={value}
                    onChange={(e) => updateBudget(key, e.target.value)}
                  />
                ) : (
                  <p className="font-semibold text-primary">৳{Number(value).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(shown.tips?.length > 0 || editing) && (
        <div>
          <h3 className="font-semibold text-neutral-dark mb-2">Tips</h3>
          <ul className="space-y-2">
            {shown.tips?.map((tip, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-neutral-dark">
                <span className="text-primary">•</span>
                {editing ? (
                  <>
                    <input
                      className={inputClass}
                      value={tip}
                      onChange={(e) => updateTip(idx, e.target.value)}
                    />
                    <button onClick={() => removeTip(idx)} className="text-red-500 hover:text-red-700 shrink-0">
                      <FaTrash />
                    </button>
                  </>
                ) : (
                  <span>{tip}</span>
                )}
              </li>
            ))}
          </ul>
          {editing && (
            <Button variant="ghost" size="sm" icon={<FaPlus />} onClick={addTip} className="mt-2">
              Add tip
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
