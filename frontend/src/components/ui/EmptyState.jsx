export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-white/60 px-6 py-14 animate-fade-in ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-primary-light text-primary flex items-center justify-center text-2xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-neutral-dark">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
