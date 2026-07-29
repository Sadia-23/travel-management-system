export const inputClass =
  'w-full border border-border rounded-lg px-3 py-2 text-sm text-neutral-dark bg-white ' +
  'placeholder:text-gray-400 transition-shadow duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

export default function FormField({ label, htmlFor, hint, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
