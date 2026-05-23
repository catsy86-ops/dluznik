/**
 * AnimatedStatus Component
 * 
 * Shows animated status with pulse effect and color coding.
 * Used for loan status, payment status, etc.
 */

interface AnimatedStatusProps {
  status: 'active' | 'paid' | 'overdue' | 'pending';
  icon?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  active: {
    label: 'Aktywna',
    color: 'var(--primary)',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    icon: '⏱️',
  },
  paid: {
    label: 'Spłacona',
    color: 'var(--success)',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: '✅',
  },
  overdue: {
    label: 'Przeterminowana',
    color: 'var(--danger)',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    icon: '⚠️',
  },
  pending: {
    label: 'Oczekuje',
    color: 'var(--warning)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: '⏳',
  },
};

export default function AnimatedStatus({
  status,
  icon: customIcon,
  animated = true,
  size = 'md',
}: AnimatedStatusProps) {
  const config = statusConfig[status];
  const sizeMap = {
    sm: { fontSize: '11px', padding: '4px 8px' },
    md: { fontSize: '13px', padding: '6px 12px' },
    lg: { fontSize: '15px', padding: '8px 16px' },
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}33`,
        borderRadius: '20px',
        padding: sizeMap[size].padding,
        fontSize: sizeMap[size].fontSize,
        fontWeight: '700',
        animation: animated && status === 'overdue' ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
      }}
    >
      <span style={{ fontSize: '1.2em' }}>
        {customIcon || config.icon}
      </span>
      {config.label}
    </div>
  );
}
