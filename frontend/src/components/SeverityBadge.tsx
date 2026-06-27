interface SeverityBadgeProps {
  classification: string;
  size?: 'sm' | 'md';
}

export function SeverityBadge({ classification, size = 'md' }: SeverityBadgeProps) {
  const label = classification.toUpperCase();
  return (
    <span className={`severity-badge severity-badge--${classification} severity-badge--${size}`}>
      <span className="severity-badge__dot" />
      {label}
    </span>
  );
}
