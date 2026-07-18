import { Link } from "react-router-dom";

// Short homepage teaser. The full write-up lives on the separate
// /about page (src/pages/About.jsx) — this just links there.
export default function AboutSection() {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-neutral-dark mb-4">
        About Our Platform
      </h2>
      <p className="text-gray-600">
        We connect travelers with trusted hotel and transport providers,
        making it simple to plan, book, and manage every part of a trip in
        one place — with an AI-powered planner on the way to help you build
        your perfect itinerary.
      </p>
      <Link to="/about" className="inline-block mt-4 text-primary font-semibold hover:underline">
        Learn more →
      </Link>
    </section>
  );
}
