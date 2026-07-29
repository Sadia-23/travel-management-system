export default function Card({
  as: Component = 'div',
  hover = false,
  padded = true,
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`bg-surface rounded-xl border border-border shadow-[var(--shadow-card)]
        ${hover ? 'transition-all duration-200 ease-out hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5' : ''}
        ${padded ? 'p-5' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
