// Fallback placeholder for the AI Planner feature.
//
// If you run out of time to finish/debug the full AIPlanner.jsx page,
// swap the import in App.jsx from:
//   import AIPlanner from './pages/AIPlanner'
// to:
//   import AIPlanner from './pages/AIPlannerComingSoon'
// No other changes needed — the route and nav link stay the same.

function AIPlannerComingSoon() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">AI Planner</h1>
      <p className="text-5xl mb-4">🚧</p>
      <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
      <p className="text-gray-500">
        This feature is under development and demonstrates planned AI integration
        for personalized travel itineraries.
      </p>
    </div>
  )
}

export default AIPlannerComingSoon
