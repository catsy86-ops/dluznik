/**
 * StatCard Component
 * 
 * Displays a statistic with label, value, trend indicator, and icon.
 * Used on dashboards and overview pages to show key metrics.
 */

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: number;
  color?: string;
}

export default function StatCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color = 'var(--primary)' 
}: StatCardProps) {
  return (
    <div className="card" style={{
      background: `linear-gradient(135deg, var(--bg2) 0%, rgba(99,102,241,0.02) 100%)`,
      borderLeft: `4px solid ${color}`,
      padding: '20px',
      borderRadius: '12px',
      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ 
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '900',
            background: `linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px'
          }}>
            {value}
          </div>
          {trend !== undefined && (
            <div style={{
              fontSize: '12px',
              color: trend > 0 ? 'var(--success)' : 'var(--danger)',
              fontWeight: '600'
            }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% z poprzedniego miesiąca
            </div>
          )}
        </div>
        <div style={{ fontSize: '28px', opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  );
}
