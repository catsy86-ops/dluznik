/**
 * EnhancedCard Component
 * 
 * Premium card with glassmorphism, animations, and advanced features.
 * Combines best practices from TIER 2-4 enhancements.
 */

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  glassEffect?: boolean;
  premium?: boolean;
  animated?: boolean;
  badge?: {
    label: string;
    color: 'success' | 'danger' | 'active' | 'paid' | 'overdue';
  };
  delay?: number;
}

export default function EnhancedCard({
  children,
  className = '',
  style,
  onClick,
  glassEffect = false,
  premium = false,
  animated = false,
  badge,
  delay = 0,
}: EnhancedCardProps) {
  const baseClass = glassEffect ? 'card-glass' : premium ? 'card-premium' : 'card';
  const animClass = animated ? 'animate-in' : '';

  return (
    <div
      className={`${baseClass} ${animClass} ${className}`}
      onClick={onClick}
      style={{
        animationDelay: `${delay}ms`,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
          }}
        >
          <span className={`badge badge-${badge.color}`}>
            {badge.label}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
