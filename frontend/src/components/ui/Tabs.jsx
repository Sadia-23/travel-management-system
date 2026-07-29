/** Consistent underline-tab bar used by the traveler, provider, and admin dashboards. */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 mb-8 border-b border-border overflow-x-auto ${className}`}
    >
      {tabs.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-md
              ${isActive ? 'text-primary' : 'text-gray-500 hover:text-neutral-dark hover:bg-neutral-light'}`}
          >
            {label}
            {isActive && (
              <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
