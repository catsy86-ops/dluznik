/**
 * FilterPanel Component
 * 
 * Advanced filtering panel for loans with:
 * - Text search
 * - Status filters
 * - Date range picker
 * - Amount range
 * - Currency selector
 * - Sort options
 * - Quick presets
 * - Save/load filters
 */

import { useState } from 'react';

export interface LoanFilters {
  search: string;
  status: 'all' | 'active' | 'paid' | 'overdue';
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  currency: string;
  sort: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'name_asc' | 'name_desc';
}

export const DEFAULT_FILTERS: LoanFilters = {
  search: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  currency: 'all',
  sort: 'date_desc',
};

interface FilterPanelProps {
  filters: LoanFilters;
  onChange: (filters: LoanFilters) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const PRESETS = [
  { label: '🔴 Przeterminowane', filters: { status: 'overdue' as const } },
  { label: '⏱️ Aktywne', filters: { status: 'active' as const } },
  { label: '✅ Spłacone', filters: { status: 'paid' as const } },
  { label: '💰 Duże (>5000)', filters: { amountMin: '5000' } },
  { label: '📅 Ten miesiąc', filters: (() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { dateFrom: from, dateTo: to };
  })() },
];

export default function FilterPanel({ filters, onChange, onReset, totalCount, filteredCount }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (partial: Partial<LoanFilters>) => onChange({ ...filters, ...partial });

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.dateFrom ||
    filters.dateTo || filters.amountMin || filters.amountMax || filters.currency !== 'all';

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Search bar + toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '14px', pointerEvents: 'none', zIndex: 1,
          }}>🔍</span>
          <input
            placeholder="Szukaj po nazwie dłużnika..."
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={hasActiveFilters ? 'btn-primary' : 'btn-ghost'}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
        >
          ⚙️ Filtry
          {hasActiveFilters && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: 'var(--danger)', color: '#fff',
              fontSize: '9px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>!</span>
          )}
        </button>
        <select
          value={filters.sort}
          onChange={e => update({ sort: e.target.value as LoanFilters['sort'] })}
          style={{ width: 'auto', flexShrink: 0 }}
        >
          <option value="date_desc">📅 Najnowsze</option>
          <option value="date_asc">📅 Najstarsze</option>
          <option value="amount_desc">💰 Kwota ↓</option>
          <option value="amount_asc">💰 Kwota ↑</option>
          <option value="name_asc">🔤 Nazwa A-Z</option>
          <option value="name_desc">🔤 Nazwa Z-A</option>
        </select>
      </div>

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => onChange({ ...DEFAULT_FILTERS, ...preset.filters })}
            style={{
              padding: '4px 10px', fontSize: '12px', fontWeight: '600',
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: '20px', color: 'var(--text-muted)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.background = 'var(--bg4)';
              (e.target as HTMLElement).style.color = 'var(--text)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.background = 'var(--bg3)';
              (e.target as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            {preset.label}
          </button>
        ))}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              padding: '4px 10px', fontSize: '12px', fontWeight: '600',
              background: 'var(--danger-bg)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '20px', color: 'var(--danger)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
          >
            ✕ Wyczyść
          </button>
        )}
      </div>

      {/* Expanded advanced filters */}
      {expanded && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '12px', padding: '16px', marginBottom: '8px',
          animation: 'slideUp 0.2s ease',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select value={filters.status} onChange={e => update({ status: e.target.value as LoanFilters['status'] })}>
                <option value="all">Wszystkie</option>
                <option value="active">⏱️ Aktywne</option>
                <option value="paid">✅ Spłacone</option>
                <option value="overdue">🔴 Przeterminowane</option>
              </select>
            </div>

            {/* Currency */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Waluta</label>
              <select value={filters.currency} onChange={e => update({ currency: e.target.value })}>
                <option value="all">Wszystkie</option>
                <option value="PLN">🇵🇱 PLN</option>
                <option value="EUR">🇪🇺 EUR</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="GBP">🇬🇧 GBP</option>
              </select>
            </div>

            {/* Date from */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Data od</label>
              <input type="date" value={filters.dateFrom} onChange={e => update({ dateFrom: e.target.value })} />
            </div>

            {/* Date to */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Data do</label>
              <input type="date" value={filters.dateTo} onChange={e => update({ dateTo: e.target.value })} />
            </div>

            {/* Amount min */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Kwota od</label>
              <input
                type="number" placeholder="0" min="0"
                value={filters.amountMin}
                onChange={e => update({ amountMin: e.target.value })}
              />
            </div>

            {/* Amount max */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Kwota do</label>
              <input
                type="number" placeholder="∞" min="0"
                value={filters.amountMax}
                onChange={e => update({ amountMax: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Znaleziono: <strong style={{ color: 'var(--text)' }}>{filteredCount}</strong> z {totalCount}
            </span>
            <button className="btn-ghost" onClick={onReset} style={{ fontSize: '12px', padding: '6px 12px' }}>
              Wyczyść filtry
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'var(--bg3)', padding: '4px', borderRadius: '10px',
      }}>
        {(['all', 'active', 'paid', 'overdue'] as const).map(s => {
          const labels = { all: 'Wszystkie', active: 'Aktywne', paid: 'Spłacone', overdue: 'Przeterminowane' };
          const icons = { all: '📋', active: '⏱️', paid: '✅', overdue: '🔴' };
          return (
            <button
              key={s}
              onClick={() => update({ status: s })}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: '7px',
                fontSize: '12px', fontWeight: '600',
                background: filters.status === s ? 'var(--bg2)' : 'transparent',
                color: filters.status === s ? 'var(--text)' : 'var(--text-muted)',
                border: filters.status === s ? '1px solid var(--border)' : '1px solid transparent',
                boxShadow: filters.status === s ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s', cursor: 'pointer',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {icons[s]} {labels[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
