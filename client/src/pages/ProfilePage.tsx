import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { authApi, summaryApi, loansApi } from '../api';
import type { Loan } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../hooks/useTheme';
import { EnhancedCard } from '../components';
import GuestBanner from '../components/GuestBanner';
import { exportLoansToPdf } from '../utils/exportPdf';

type Section = 'account' | 'appearance' | 'notifications' | 'data' | 'security';

export default function ProfilePage() {
  const { user, logout, isGuest } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState<Section>('account');

  // Account
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const [savingNotif, setSavingNotif] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // App settings (localStorage)
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('defaultCurrency') || 'PLN');
  const [reminderDays, setReminderDays] = useState(() => Number(localStorage.getItem('reminderDays') || '3'));
  const [pageSize, setPageSize] = useState(() => Number(localStorage.getItem('pageSize') || '10'));

  useEffect(() => {
    localStorage.setItem('defaultCurrency', defaultCurrency);
  }, [defaultCurrency]);

  useEffect(() => {
    localStorage.setItem('reminderDays', String(reminderDays));
  }, [reminderDays]);

  useEffect(() => {
    localStorage.setItem('pageSize', String(pageSize));
  }, [pageSize]);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    setSavingNotif(true);
    try {
      await authApi.updateProfile({ notificationsEnabled: val });
      toast(val ? 'Powiadomienia włączone' : 'Powiadomienia wyłączone', 'success');
    } catch (e: any) {
      setNotifications(!val);
      toast(e.message, 'error');
    } finally { setSavingNotif(false); }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError('Hasła nie są identyczne'); return; }
    if (newPwd.length < 8) { setPwdError('Hasło musi mieć co najmniej 8 znaków'); return; }
    setPwdLoading(true);
    try {
      await authApi.updateProfile({ currentPassword: currentPwd, newPassword: newPwd });
      toast('Hasło zmienione pomyślnie ✓', 'success');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) { setPwdError(e.message); }
    finally { setPwdLoading(false); }
  };

  const sections: { id: Section; label: string }[] = [
    { id: 'account', label: '👤 Konto' },
    { id: 'appearance', label: '🎨 Wygląd' },
    { id: 'notifications', label: '🔔 Powiadomienia' },
    { id: 'data', label: '💾 Dane' },
    { id: 'security', label: '🔐 Bezpieczeństwo' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <GuestBanner />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '6px' }}>
          👤 Profil i Ustawienia
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Zarządzaj kontem i dostosuj aplikację
        </p>
      </div>

      {/* User card */}
      <EnhancedCard premium style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
            background: isGuest
              ? 'linear-gradient(135deg, #6b7a99, #3d4a63)'
              : 'linear-gradient(135deg, var(--primary), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isGuest ? '24px' : '22px', fontWeight: '900', color: '#fff',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}>
            {isGuest ? '👁️' : (user?.email?.[0]?.toUpperCase() ?? 'U')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '800', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isGuest ? 'Tryb Gościa' : user?.email}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              {isGuest
                ? 'Przeglądasz dane demonstracyjne'
                : `Konto od ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }) : '—'}`}
            </div>
          </div>
          <button onClick={logout} className="btn-danger" style={{ flexShrink: 0, padding: '8px 14px', fontSize: '13px' }}>
            🚪 {isGuest ? 'Zaloguj się' : 'Wyloguj'}
          </button>
        </div>
      </EnhancedCard>

      {/* Section tabs */}
      <div style={{
        display: 'flex', gap: '4px', background: 'var(--bg3)',
        padding: '4px', borderRadius: '12px', marginBottom: '20px', overflowX: 'auto',
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: '9px',
              fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
              background: section === s.id ? 'var(--bg2)' : 'transparent',
              color: section === s.id ? 'var(--text)' : 'var(--text-muted)',
              border: section === s.id ? '1px solid var(--border2)' : '1px solid transparent',
              boxShadow: section === s.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ===== ACCOUNT ===== */}
      {section === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📋 Informacje o Koncie</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Email', value: isGuest ? 'gość@demo.pl' : (user?.email ?? '—') },
                { label: 'Konto od', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '—' },
                { label: 'Powiadomienia', value: user?.notificationsEnabled ? '✅ Włączone' : '❌ Wyłączone', color: user?.notificationsEnabled ? 'var(--success)' : 'var(--danger)' },
                { label: 'Tryb', value: isGuest ? '👁️ Gość (tylko odczyt)' : '🔓 Pełny dostęp', color: isGuest ? 'var(--warning)' : 'var(--success)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </EnhancedCard>

          {!isGuest && (
            <EnhancedCard premium>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔔 Powiadomienia email</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Alerty o terminach</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Zbliżające się i przeterminowane płatności
                  </div>
                </div>
                <Toggle value={notifications} onChange={toggleNotifications} disabled={savingNotif} />
              </div>
            </EnhancedCard>
          )}
        </div>
      )}

      {/* ===== APPEARANCE ===== */}
      {section === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🎨 Motyw</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['dark', 'light', 'auto'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '14px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: theme === t ? 'var(--primary)' : 'var(--bg3)',
                    color: theme === t ? '#fff' : 'var(--text-muted)',
                    border: theme === t ? 'none' : '1px solid var(--border2)',
                    transition: 'all 0.2s', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🔄'}</span>
                  {t === 'dark' ? 'Ciemny' : t === 'light' ? 'Jasny' : 'Auto'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Aktualny: <strong>{theme === 'dark' ? '🌙 Ciemny' : theme === 'light' ? '☀️ Jasny' : '🔄 Auto (systemowy)'}</strong>
            </p>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🌍 Waluta i Wyświetlanie</h3>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Domyślna waluta</label>
                <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}>
                  <option value="PLN">🇵🇱 PLN</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="GBP">🇬🇧 GBP</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Pożyczek na stronę</label>
                <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* ===== NOTIFICATIONS ===== */}
      {section === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔔 Ustawienia Powiadomień</h3>

            {isGuest ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                🔒 Zaloguj się aby zarządzać powiadomieniami
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Powiadomienia email</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alerty o przeterminowanych pożyczkach</div>
                  </div>
                  <Toggle value={notifications} onChange={toggleNotifications} disabled={savingNotif} />
                </div>

                <div className="divider" />

                <div className="form-group" style={{ marginBottom: 0, marginTop: '16px' }}>
                  <label>Przypomnij X dni przed terminem</label>
                  <select value={reminderDays} onChange={e => setReminderDays(Number(e.target.value))}>
                    <option value={1}>1 dzień wcześniej</option>
                    <option value={3}>3 dni wcześniej</option>
                    <option value={7}>7 dni wcześniej</option>
                    <option value={14}>14 dni wcześniej</option>
                    <option value={30}>30 dni wcześniej</option>
                  </select>
                </div>
              </>
            )}
          </EnhancedCard>
        </div>
      )}

      {/* ===== DATA ===== */}
      {section === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>📤 Eksport Danych</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Pobierz wszystkie pożyczki, zobowiązania i transakcje jako plik CSV (kompatybilny z Excel).
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, minWidth: '120px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => { summaryApi.exportCsv(); toast('Pobieranie pliku CSV...', 'info'); }}
                disabled={isGuest}
              >
                📊 Eksport CSV
              </button>
              <button
                className="btn-ghost"
                style={{ flex: 1, minWidth: '120px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={isGuest || pdfLoading}
                onClick={async () => {
                  if (isGuest) return;
                  setPdfLoading(true);
                  try {
                    const r = await loansApi.list({ limit: '200' });
                    const loans = (r as any).loans as Loan[] ?? [];
                    exportLoansToPdf(loans);
                    toast('Raport PDF wygenerowany ✓', 'success');
                  } catch (e: any) {
                    toast(e.message, 'error');
                  } finally {
                    setPdfLoading(false);
                  }
                }}
              >
                {pdfLoading ? <span className="spinner spinner-dark" /> : '📄 Eksport PDF'}
              </button>
            </div>
            {isGuest && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                🔒 Zaloguj się aby eksportować dane
              </p>
            )}
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>📥 Import Danych</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Importuj pożyczki z pliku CSV. Obsługiwany format: kolumny nazwa, kwota, waluta, termin, opis.
            </p>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg3)', border: '1.5px dashed var(--border3)',
              color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600',
              cursor: isGuest ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              opacity: isGuest ? 0.5 : 1,
            }}>
              📂 Wybierz plik CSV
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                disabled={isGuest}
                onChange={e => {
                  if (isGuest) return;
                  const file = e.target.files?.[0];
                  if (file) toast(`Import "${file.name}" - funkcja wkrótce!`, 'info');
                }}
              />
            </label>
          </EnhancedCard>

          {!isGuest && (
            <EnhancedCard premium>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: 'var(--danger)' }}>
                ⚠️ Strefa Niebezpieczna
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Usuń wszystkie swoje dane. Ta operacja jest <strong>nieodwracalna</strong>.
              </p>
              <button
                className="btn-danger"
                style={{ width: '100%' }}
                onClick={() => toast('Aby usunąć konto skontaktuj się z administratorem', 'info')}
              >
                🗑️ Usuń konto i dane
              </button>
            </EnhancedCard>
          )}
        </div>
      )}

      {/* ===== SECURITY ===== */}
      {section === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isGuest ? (
            <EnhancedCard premium>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>Tryb Gościa</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Zaloguj się lub utwórz konto aby zarządzać bezpieczeństwem.
                </p>
                <button className="btn-primary" onClick={logout} style={{ padding: '10px 24px' }}>
                  🔑 Zaloguj się
                </button>
              </div>
            </EnhancedCard>
          ) : (
            <EnhancedCard premium>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔑 Zmień Hasło</h3>
              {pwdError && <div className="error-msg" style={{ marginBottom: '14px' }}>⚠️ {pwdError}</div>}
              <form onSubmit={changePassword}>
                <div className="form-group">
                  <label>Aktualne hasło</label>
                  <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label>Nowe hasło (min. 8 znaków)</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" required minLength={8} />
                </div>
                <div className="form-group">
                  <label>Potwierdź nowe hasło</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn-primary" disabled={pwdLoading} style={{ width: '100%', padding: '12px' }}>
                  {pwdLoading ? <span className="spinner" /> : '🔐 Zmień hasło'}
                </button>
              </form>
            </EnhancedCard>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      aria-label={value ? 'Wyłącz' : 'Włącz'}
      style={{
        width: 50, height: 28, borderRadius: 14, padding: 3,
        background: value ? 'linear-gradient(135deg, var(--primary), #7c3aed)' : 'var(--bg4)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s', position: 'relative', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        boxShadow: value ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: value ? 25 : 3,
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}
