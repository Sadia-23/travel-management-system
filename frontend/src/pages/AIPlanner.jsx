import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSave, FaFilePdf, FaHistory, FaPlus } from 'react-icons/fa';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportItineraryToPDF } from '../utils/exportUtils';
import ChatMessage from '../components/ai-planner/ChatMessage';
import ItineraryPanel from '../components/ai-planner/ItineraryPanel';
import SavedPlansModal from '../components/ai-planner/SavedPlansModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import FormField, { inputClass } from '../components/ui/FormField';
import { Spinner } from '../components/ui/Loading';

const STYLE_OPTIONS = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget-friendly' },
];

const PREFERENCE_OPTIONS = [
  'Nature & Scenery', 'Food & Cuisine', 'Adventure & Outdoor', 'Culture & Heritage',
  'Shopping', 'Nightlife', 'Relaxation & Wellness', 'Wildlife',
];

export default function AIPlanner() {
  const { user } = useAuth();

  const [started, setStarted] = useState(false);
  const [form, setForm] = useState({ destination: '', budget: '', days: '', style: 'balanced', preferences: [] });

  const [conversation, setConversation] = useState([]); // [{role:'user'|'assistant', content, source?}]
  const [itinerary, setItinerary] = useState(null);
  const [source, setSource] = useState(null);
  const [activeId, setActiveId] = useState(null); // saved conversation id, once saved/loaded

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [showSaved, setShowSaved] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const threadEndRef = useRef(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, sending]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const togglePreference = (pref) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(pref)
        ? f.preferences.filter((p) => p !== pref)
        : [...f.preferences, pref],
    }));
  };

  // Sends one more turn to planner.php: appends the user's message, calls
  // the API with the full conversation + current itinerary as context, and
  // appends the assistant's reply once it comes back.
  const sendTurn = async (userText, itineraryOverride) => {
    setError('');
    setSending(true);

    const nextConversation = [...conversation, { role: 'user', content: userText }];
    setConversation(nextConversation);
    setInput('');

    try {
      const res = await api.post('/planner.php', {
        destination: form.destination,
        budget: Number(form.budget),
        days: Number(form.days),
        style: form.style,
        preferences: form.preferences,
        conversation: nextConversation,
        current_itinerary: itineraryOverride !== undefined ? itineraryOverride : itinerary,
      });

      if (res.data.success) {
        setConversation((c) => [...c, { role: 'assistant', content: res.data.reply, source: res.data.source }]);
        setItinerary(res.data.itinerary);
        setSource(res.data.source);
      } else {
        setError(res.data.error || 'Could not get a response. Please try again.');
      }
    } catch {
      setError('Something went wrong talking to the planner. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStartPlanning = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.budget || !form.days) return;

    const prefText = form.preferences.length ? ` I'm especially interested in ${form.preferences.join(', ')}.` : '';
    const opening = `Plan a ${form.days}-day ${form.style} trip to ${form.destination} with a budget of ${form.budget} BDT.${prefText}`;

    setStarted(true);
    setConversation([]);
    setItinerary(null);
    setActiveId(null);
    await sendTurn(opening, null);
  };

  const handleSend = () => {
    if (!input.trim() || sending) return;
    sendTurn(input.trim());
  };

  // Directly-edited itinerary from the panel becomes the new "ground truth"
  // and gets logged in the thread so later chat turns are aware of it.
  const handleManualEdit = (newItinerary) => {
    setItinerary(newItinerary);
    setConversation((c) => [
      ...c,
      { role: 'user', content: '(Manually edited the itinerary.)' },
      { role: 'assistant', content: "Got it — I'll keep your edits in mind for anything else you ask me to change." },
    ]);
  };

  const handleNewConversation = () => {
    setStarted(false);
    setForm({ destination: '', budget: '', days: '', style: 'balanced', preferences: [] });
    setConversation([]);
    setItinerary(null);
    setSource(null);
    setActiveId(null);
    setError('');
  };

  const handleSave = async () => {
    if (!user || !itinerary) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/itineraries.php', {
        itinerary_id: activeId || undefined,
        title: `${form.destination} Trip`,
        destination: form.destination,
        days: Number(form.days),
        budget: Number(form.budget),
        style: form.style,
        preferences: form.preferences,
        itinerary,
        messages: conversation,
      });
      if (res.data.success) {
        setActiveId(res.data.itinerary_id);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } else {
        setError(res.data.error || 'Could not save this conversation.');
      }
    } catch {
      setError('Could not save this conversation.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!itinerary) return;
    exportItineraryToPDF(itinerary, { travelerName: user?.full_name });
  };

  const openSavedPlans = async () => {
    setShowSaved(true);
    setLoadingSaved(true);
    try {
      const res = await api.get('/itineraries.php');
      if (res.data.success) setSavedPlans(res.data.itineraries);
    } catch {
      // silently ignore — non-critical secondary panel
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleLoadPlan = async (id) => {
    try {
      const res = await api.get('/itineraries.php', { params: { id } });
      if (res.data.success) {
        const c = res.data.conversation;
        setForm({
          destination: c.destination || '',
          budget: c.budget || '',
          days: c.travel_days || '',
          style: c.travel_style || 'balanced',
          preferences: c.preferences ? c.preferences.split(', ').filter(Boolean) : [],
        });
        setConversation(c.messages || []);
        setItinerary(c.itinerary || null);
        setActiveId(c.itinerary_id);
        setStarted(true);
        setShowSaved(false);
      }
    } catch {
      setError('Could not load that saved plan.');
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await api.delete(`/itineraries.php?id=${id}`);
      setSavedPlans((prev) => prev.filter((p) => p.itinerary_id !== id));
      if (activeId === id) setActiveId(null);
    } catch {
      // ignore — non-critical
    }
  };

  return (
    <section className="py-10 px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">AI Planner</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-neutral-dark">
            Plan your trip, conversation-style
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tell us about your trip, then keep chatting to refine it — edit anything directly, save your progress, or export the final plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Button variant="outline" size="sm" icon={<FaHistory />} onClick={openSavedPlans}>
              Saved plans
            </Button>
          )}
          {started && (
            <Button variant="ghost" size="sm" icon={<FaPlus />} onClick={handleNewConversation}>
              New plan
            </Button>
          )}
        </div>
      </div>

      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}

      {!started && (
        <Card className="max-w-xl">
          <form onSubmit={handleStartPlanning} className="grid gap-4">
            <FormField label="Destination">
              <input
                name="destination" type="text" placeholder="e.g. Cox's Bazar"
                value={form.destination} onChange={handleFormChange} required
                className={inputClass}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Budget (BDT)">
                <input
                  name="budget" type="number" min="0" placeholder="15000"
                  value={form.budget} onChange={handleFormChange} required
                  className={inputClass}
                />
              </FormField>
              <FormField label="Number of days">
                <input
                  name="days" type="number" min="1" placeholder="3"
                  value={form.days} onChange={handleFormChange} required
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Travel style">
              <select name="style" value={form.style} onChange={handleFormChange} className={inputClass}>
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Preferences (optional)" hint="Pick anything you'd like the plan to prioritize.">
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const active = form.preferences.includes(pref);
                  return (
                    <button
                      type="button"
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
                        ${active
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-neutral-dark hover:bg-neutral-light'}`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <Button type="submit" full loading={sending}>
              Start planning
            </Button>
          </form>
        </Card>
      )}

      {started && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat thread */}
          <Card padded={false} className="flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {conversation.map((m, idx) => (
                <ChatMessage key={idx} role={m.role} content={m.content} source={m.source} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-gray-400 text-sm pl-11">
                  <Spinner size="text-sm" /> Thinking…
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="border-t border-border p-3 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder='Ask for a change — e.g. "make day 2 more relaxed" or "add a day"'
                rows={1}
                className={`${inputClass} resize-none flex-1`}
              />
              <Button icon={<FaPaperPlane />} onClick={handleSend} disabled={sending || !input.trim()} aria-label="Send" />
            </div>
          </Card>

          {/* Live itinerary + actions */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary" size="sm" icon={<FaSave />}
                onClick={handleSave} loading={saving} disabled={!itinerary || !user}
              >
                {savedFlash ? 'Saved ✓' : activeId ? 'Update saved plan' : 'Save conversation'}
              </Button>
              <Button
                variant="outline" size="sm" icon={<FaFilePdf />}
                onClick={handleExportPDF} disabled={!itinerary}
              >
                Export as PDF
              </Button>
              {!user && (
                <span className="text-xs text-gray-400 self-center">Log in to save your plan</span>
              )}
            </div>

            {itinerary ? (
              <ItineraryPanel itinerary={itinerary} onManualEdit={handleManualEdit} />
            ) : (
              <Card className="text-center text-gray-500 text-sm py-12">
                Your itinerary will appear here once the assistant responds.
              </Card>
            )}
          </div>
        </div>
      )}

      {showSaved && (
        <SavedPlansModal
          plans={savedPlans}
          loading={loadingSaved}
          onClose={() => setShowSaved(false)}
          onLoad={handleLoadPlan}
          onDelete={handleDeletePlan}
        />
      )}
    </section>
  );
}
