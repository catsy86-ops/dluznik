/**
 * DashboardEmptyState Component
 *
 * Displayed when the user has no loans and no obligations.
 * Shows a welcoming illustration, descriptive message, and CTA buttons
 * to guide the user toward creating their first loan or obligation.
 */

interface DashboardEmptyStateProps {
  onNavigateLoans: () => void;
  onNavigateObligations: () => void;
}

export default function DashboardEmptyState({
  onNavigateLoans,
  onNavigateObligations,
}: DashboardEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        animation: 'slideUp 0.3s ease',
      }}
    >
      {/* SVG Wallet/Money Illustration (≥48×48px) */}
      <div style={{ marginBottom: '24px' }}>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Wallet body */}
          <rect
            x="8"
            y="20"
            width="56"
            height="40"
            rx="6"
            fill="var(--primary, #6366f1)"
            opacity="0.15"
          />
          <rect
            x="8"
            y="20"
            width="56"
            height="40"
            rx="6"
            stroke="var(--primary, #6366f1)"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Wallet flap */}
          <path
            d="M8 26C8 22.6863 10.6863 20 14 20H58C61.3137 20 64 22.6863 64 26V30H8V26Z"
            fill="var(--primary, #6366f1)"
            opacity="0.3"
          />
          {/* Card slot */}
          <rect
            x="44"
            y="36"
            width="20"
            height="14"
            rx="4"
            fill="var(--bg2, #1e1e2e)"
            stroke="var(--primary, #6366f1)"
            strokeWidth="2"
          />
          {/* Coin circle */}
          <circle
            cx="54"
            cy="43"
            r="4"
            fill="var(--primary, #6366f1)"
            opacity="0.6"
          />
          {/* Money bills peeking out */}
          <rect
            x="14"
            y="14"
            width="32"
            height="10"
            rx="3"
            fill="var(--success, #22c55e)"
            opacity="0.25"
            stroke="var(--success, #22c55e)"
            strokeWidth="1.5"
          />
          <line
            x1="20"
            y1="19"
            x2="40"
            y2="19"
            stroke="var(--success, #22c55e)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Descriptive message (≤200 chars, in Polish) */}
      <p
        style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          maxWidth: '400px',
          marginBottom: '28px',
        }}
      >
        Śledź swoje pożyczki i zobowiązania w jednym miejscu. Dodaj pierwszą pozycję, aby zobaczyć statystyki i wykresy na dashboardzie.
      </p>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onNavigateLoans}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          💰 Dodaj pożyczkę
        </button>
        <button
          onClick={onNavigateObligations}
          className="btn-ghost"
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📋 Dodaj zobowiązanie
        </button>
      </div>
    </div>
  );
}
