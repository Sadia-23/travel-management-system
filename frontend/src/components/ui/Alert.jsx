import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const STYLES = {
  success: {
    wrap: 'bg-success-bg text-success-text border-green-200',
    icon: <FaCheckCircle className="text-success shrink-0 mt-0.5" />,
  },
  danger: {
    wrap: 'bg-danger-bg text-danger-text border-red-200',
    icon: <FaExclamationCircle className="text-danger shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-warning-bg text-warning-text border-amber-200',
    icon: <FaExclamationTriangle className="text-warning shrink-0 mt-0.5" />,
  },
  info: {
    wrap: 'bg-info-bg text-info-text border-cyan-200',
    icon: <FaInfoCircle className="text-info shrink-0 mt-0.5" />,
  },
};

/**
 * Inline banner for success / error / warning / info messages. Used in place
 * of bare colored <p> tags so every message in the app looks and reads the
 * same way.
 */
export default function Alert({ tone = 'info', title, children, className = '' }) {
  const style = STYLES[tone] || STYLES.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 border rounded-lg px-4 py-3 text-sm animate-fade-in ${style.wrap} ${className}`}
    >
      {style.icon}
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
