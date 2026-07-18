import { useState } from "react";

// NOTE: There's no POST /contact_messages endpoint yet — this form shows a
// local confirmation for now. Hook it up to backend/api/contact.php once
// that endpoint exists (the `contact_messages` table already exists in the DB).
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="py-16 px-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-neutral-dark mb-6 text-center">
        Contact Us
      </h2>

      {sent ? (
        <p className="text-center text-primary">
          Thanks for reaching out — we'll be in touch soon!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="message"
            placeholder="Your message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-primary text-white rounded px-6 py-2 hover:bg-primary-dark"
          >
            Send Message
          </button>
        </form>
      )}
    </section>
  );
}
