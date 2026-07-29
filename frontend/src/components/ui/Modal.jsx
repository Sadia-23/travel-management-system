import { FaTimes } from 'react-icons/fa';

/**
 * Shared modal shell: dim backdrop, centered card, click-outside-to-close,
 * and a consistent close button — so every dialog in the app looks and
 * behaves the same way.
 */
export default function Modal({ onClose, maxWidth = 'max-w-md', children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-[var(--shadow-pop)] w-full ${maxWidth} p-6 relative my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-neutral-dark hover:bg-neutral-light transition-colors"
        >
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
}
