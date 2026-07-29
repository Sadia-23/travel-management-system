import { Link } from 'react-router-dom'
import {
  FaHotel,
  FaBus,
  FaRoute,
  FaUserFriends,
  FaBuilding,
  FaShieldAlt,
  FaStar,
  FaMapMarkedAlt,
  FaArrowRight,
} from 'react-icons/fa'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const stats = [
  { label: 'Hotels & transport, one search', value: '2-in-1' },
  { label: 'Roles kept separate and simple', value: '3' },
  { label: 'Booking statuses tracked end to end', value: 'Upcoming → Completed' },
]

const steps = [
  {
    icon: <FaMapMarkedAlt />,
    title: 'Search',
    body: 'Filter hotels by location, price, and rating, or transport by route, vehicle type, and price — the same search bar either way.',
  },
  {
    icon: <FaRoute />,
    title: 'Book',
    body: 'Pick a travel date, confirm the price, and the booking lands straight in your dashboard with an Upcoming status.',
  },
  {
    icon: <FaStar />,
    title: 'Review',
    body: 'After a trip is Completed, leave a rating and a review so the next traveler knows what to expect.',
  },
]

const roles = [
  {
    icon: <FaUserFriends />,
    title: 'Travelers',
    body: 'Search, book, and manage hotel and transport reservations, export a booking history, and keep a personal profile up to date.',
  },
  {
    icon: <FaBuilding />,
    title: 'Providers',
    body: 'List hotels or transport, keep availability and pricing current, and book directly on behalf of a guest when needed.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Admins',
    body: 'Oversee every account and listing, step in on bookings that need attention, and keep the marketplace trustworthy.',
  },
]

function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-5">
            About us
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-balance">
            A trip has two halves. We handle both.
          </h1>
          <p className="text-white/80 mt-6 max-w-2xl mx-auto leading-relaxed text-balance">
            Travel Management System puts hotel stays and transport bookings
            on the same platform, with one account, one dashboard, and one
            booking history — instead of a different login for every leg of
            the trip.
          </p>
        </div>
        <div className="ticket-divider bg-neutral-light" />
      </section>

      {/* Stats strip */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-2xl md:text-3xl font-semibold text-primary">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* What it does */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col">
            <div className="w-11 h-11 rounded-lg bg-primary-light text-primary flex items-center justify-center text-lg mb-4">
              <FaHotel />
            </div>
            <h3 className="font-display text-xl font-semibold text-neutral-dark mb-2">Hotels</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse listings by location, nightly price, and star rating,
              then check real-time room availability before booking. Every
              hotel is managed by a verified provider, not scraped from a
              third party.
            </p>
          </Card>
          <Card className="flex flex-col">
            <div className="w-11 h-11 rounded-lg bg-secondary-light text-secondary flex items-center justify-center text-lg mb-4">
              <FaBus />
            </div>
            <h3 className="font-display text-xl font-semibold text-neutral-dark mb-2">Transport</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Compare buses, trains, flights, and car transfers on the same
              route, with live seat counts and per-seat pricing, so the way
              there is booked as easily as the place to stay.
            </p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">How it works</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-dark">Search, book, review</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-base mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-neutral-dark mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%+8px)] w-[calc(100%-2.75rem-16px)] border-t border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2">Who it's for</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-dark">Three roles, one platform</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            Every account is exactly one of these — the dashboard and
            permissions shown depend on which.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.title} hover>
              <div className="w-11 h-11 rounded-lg bg-neutral-light text-primary flex items-center justify-center text-lg mb-4">
                {role.icon}
              </div>
              <h3 className="font-semibold text-neutral-dark mb-1.5">{role.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{role.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-white border-y border-border">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <Badge tone="warning" className="mb-4">In progress</Badge>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-dark mb-4">
            An AI itinerary planner, on the way
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Set a destination, a number of days, and a budget, and the
            planner will lay out a day-by-day plan — the kind of thing that,
            today, still lives in a saved itinerary a traveler wrote by hand.
            The foundations for it are already in place; the guided,
            AI-assisted version is next.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-dark mb-4">Ready to plan something?</h2>
        <p className="text-gray-500 mb-6">Create an account and book your first stay or ride in a few minutes.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create an account <FaArrowRight className="text-xs" />
          </Link>
          <Link
            to="/hotels"
            className="inline-flex items-center justify-center gap-2 border border-border text-neutral-dark font-semibold px-6 py-3 rounded-lg hover:bg-neutral-light transition-colors"
          >
            Browse hotels
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About
