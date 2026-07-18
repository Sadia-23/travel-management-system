export default function Hero() {
  return (
    <section className="bg-primary text-white py-24 px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Plan Your Next Trip with Ease
      </h1>
      <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
        Book hotels and transport in one place, or let our AI planner build
        your itinerary for you.
      </p>
      <div className="flex justify-center gap-4">
        <a
          href="/hotels"
          className="bg-white text-primary font-semibold px-6 py-3 rounded hover:bg-neutral-light"
        >
          Browse Hotels
        </a>
        <a
          href="/transport"
          className="bg-accent text-white font-semibold px-6 py-3 rounded hover:opacity-90"
        >
          Browse Transport
        </a>
      </div>
    </section>
  );
}
