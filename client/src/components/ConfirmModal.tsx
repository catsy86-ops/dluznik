interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Usuń', onConfirm, onCancel, danger = true }: Props) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{danger ? '🗑️' : '⚠️'}</div>
        <h3 style={{ marginBottom: '8px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" style={{ flex: 1, padding: '11px' }} onClick={onCancel}>Anuluj</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: '8px', fontWeight: '700', fontSize: '14px',
              background: danger ? 'var(--danger)' : 'var(--primary)',
              color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: danger ? '0 4px 12px rgba(239,68,68,0.3)' : '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
