const TONES = {
  neutral: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-light text-primary-dark',
  success: 'bg-success-bg text-success-text',
  danger: 'bg-danger-bg text-danger-text',
  warning: 'bg-warning-bg text-warning-text',
  info: 'bg-info-bg text-info-text',
};

// Maps common booking / account statuses to a feedback tone so the same
// word always reads the same way anywhere it appears in the app.
const STATUS_TONE = {
  Upcoming: 'primary',
  Completed: 'success',
  Cancelled: 'danger',
  Available: 'success',
  'Fully Booked': 'warning',
  Unavailable: 'danger',
  Active: 'success',
  Suspended: 'danger',
  Pending: 'warning',
};

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const tone = STATUS_TONE[status] || 'neutral';
  return (
    <Badge tone={tone} className={className}>
      {status}
    </Badge>
  );
}

export default Badge;
