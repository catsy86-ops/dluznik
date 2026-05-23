/**
 * SettingsPage Component
 * 
 * App settings including:
 * - Theme (dark/light/auto)
 * - Language
 * - Currency
 * - Notifications
 * - Data export/import
 * - Account management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { authApi, summaryApi } from '../api';
import { useToast } from '../components/Toast';
import { EnhancedCard } from '../components';

interface Settings {
  theme: 'dark' | 'light' | 'auto';
  language: 'pl' | 'en';
  defaultCurrency: string;
  notificationsEnabled: boolean;
  reminderDays: number;
  pageSize: number;
}

const STORAGE_KEY = 'app_settings';

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultSettings(), ...JSON.parse(saved) };
  } catch {}
  return defaultSettings();
}

function defaultSettings(): Settings {
  return {
    theme: 'dark',
    language: 'pl',
    defaultCurrency: 'PLN',
    notificationsEnabled: true,
    reminderDays: 3,
    pageSize: 10,
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'appearance' | 'notifications' | 'data' | 'security'>('appearance');

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme
    );
  }, [settings]);

  const update = (partial: Partial<Settings>) => setSettings(s => ({ ...s, ...partial }));

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast('Hasła nie są identyczne', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast('Hasło musi mieć min. 6 znaków', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await authApi.updateProfile({ currentPassword, newPassword });
      toast('Hasło zmienione ✓', 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleExport = () => {
    summaryApi.exportCsv();
    toast('Eksport rozpoczęty ✓', 'success');
  };

  const sections = [
    { id: 'appearance', label: '🎨 Wygląd', icon: '🎨' },
    { id: 'notifications', label: '🔔 Powiadomienia', icon: '🔔' },
    { id: 'data', label: '💾 Dane', icon: '💾' },
    { id: 'security', label: '🔐 Bezpieczeństwo', icon: '🔐' },
  ] as const;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '6px' }}>
            ⚙️ Ustawienia
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Dostosuj aplikację do swoich potrzeb
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'var(--bg3)', padding: '4px', borderRadius: '12px',
        marginBottom: '20px', overflowX: 'auto',
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '9px',
              fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
              background: activeSection === s.id ? 'var(--bg2)' : 'transparent',
              color: activeSection === s.id ? 'var(--text)' : 'var(--text-muted)',
              border: activeSection === s.id ? '1px solid var(--border2)' : '1px solid transparent',
              boxShadow: activeSection === s.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* APPEARANCE */}
      {activeSection === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🎨 Motyw</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['dark', 'light', 'auto'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  style={{
                    padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: settings.theme === t ? 'var(--primary)' : 'var(--bg3)',
                    color: settings.theme === t ? '#fff' : 'var(--text-muted)',
                    border: settings.theme === t ? 'none' : '1px solid var(--border2)',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'dark' ? '🌙 Ciemny' : t === 'light' ? '☀️ Jasny' : '🔄 Auto'}
                </button>
              ))}
            </div>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🌍 Język i Waluta</h3>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Język</label>
                <select value={settings.language} onChange={e => update({ language: e.target.value as 'pl' | 'en' })}>
                  <option value="pl">🇵🇱 Polski</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Domyślna waluta</label>
                <select value={settings.defaultCurrency} onChange={e => update({ defaultCurrency: e.target.value })}>
                  <option value="PLN">🇵🇱 PLN</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="GBP">🇬🇧 GBP</option>
                </select>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📋 Wyświetlanie</h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Pożyczek na stronę</label>
              <select value={settings.pageSize} onChange={e => update({ pageSize: Number(e.target.value) })}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔔 Powiadomienia</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Włącz powiadomienia</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alerty o przeterminowanych pożyczkach</div>
              </div>
              <button
                onClick={() => update({ notificationsEnabled: !settings.notificationsEnabled })}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', padding: 0,
                  background: settings.notificationsEnabled ? 'var(--success)' : 'var(--bg5)',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: settings.notificationsEnabled ? '25px' : '3px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#fff', transition: 'all 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {settings.notificationsEnabled && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Przypomnij X dni przed terminem</label>
                <select value={settings.reminderDays} onChange={e => update({ reminderDays: Number(e.target.value) })}>
                  <option value={1}>1 dzień</option>
                  <option value={3}>3 dni</option>
                  <option value={7}>7 dni</option>
                  <option value={14}>14 dni</option>
                  <option value={30}>30 dni</option>
                </select>
              </div>
            )}
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>📧 Email</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Konto: <strong style={{ color: 'var(--text)' }}>{user?.email}</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Powiadomienia email</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wysyłaj alerty na email</div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await authApi.updateProfile({ notificationsEnabled: !user?.notificationsEnabled });
                    toast('Ustawienia zapisane ✓', 'success');
                  } catch (e: any) { toast(e.message, 'error'); }
                }}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', padding: 0,
                  background: user?.notificationsEnabled ? 'var(--success)' : 'var(--bg5)',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: user?.notificationsEnabled ? '25px' : '3px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#fff', transition: 'all 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* DATA */}
      {activeSection === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📤 Eksport Danych</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Pobierz wszystkie swoje dane w formacie CSV lub JSON.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={handleExport} style={{ flex: 1 }}>
                📊 Eksport CSV
              </button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => toast('JSON export wkrótce!', 'info')}>
                📋 Eksport JSON
              </button>
            </div>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>📥 Import Danych</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Importuj pożyczki z pliku CSV.
            </p>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => toast('Import wkrótce!', 'info')}>
              📂 Wybierz plik CSV
            </button>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: 'var(--danger)' }}>
              ⚠️ Strefa Niebezpieczna
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Usuń wszystkie dane. Ta operacja jest nieodwracalna!
            </p>
            <button
              className="btn-danger"
              style={{ width: '100%' }}
              onClick={() => toast('Skontaktuj się z supportem aby usunąć konto', 'info')}
            >
              🗑️ Usuń wszystkie dane
            </button>
          </EnhancedCard>
        </div>
      )}

      {/* SECURITY */}
      {activeSection === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔑 Zmień Hasło</h3>
            <div className="form-group">
              <label>Obecne hasło</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 znaków"
              />
            </div>
            <div className="form-group">
              <label>Potwierdź nowe hasło</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Powtórz hasło"
              />
            </div>
            <button
              className="btn-primary"
              onClick={handlePasswordChange}
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              style={{ width: '100%' }}
            >
              {pwLoading ? <span className="spinner" /> : '🔐 Zmień hasło'}
            </button>
          </EnhancedCard>

          <EnhancedCard premium>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>👤 Informacje o Koncie</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Konto od</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '-'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Powiadomienia</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: user?.notificationsEnabled ? 'var(--success)' : 'var(--danger)' }}>
                  {user?.notificationsEnabled ? '✅ Włączone' : '❌ Wyłączone'}
                </span>
              </div>
            </div>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
}
