import { FaSpinner } from 'react-icons/fa';

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-blue-300',
  secondary:
    'bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark disabled:bg-cyan-300',
  accent:
    'bg-accent text-white hover:bg-accent-dark active:bg-accent-dark disabled:bg-amber-300',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-700 disabled:bg-red-300',
  outline:
    'bg-white text-neutral-dark border border-border hover:bg-neutral-light active:bg-gray-100 disabled:text-gray-400',
  ghost:
    'bg-transparent text-neutral-dark hover:bg-neutral-light active:bg-gray-100 disabled:text-gray-400',
  dark:
    'bg-neutral-dark text-white hover:bg-gray-800 active:bg-gray-800 disabled:bg-gray-400',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-2.5 gap-2',
};

/**
 * Shared button used across the app so every call-to-action shares the same
 * shape, weight, and interaction states (hover / active / disabled / loading).
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  full = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-lg font-semibold
        transition-colors duration-150 ease-out
        disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </Component>
  );
}
