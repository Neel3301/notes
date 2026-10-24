import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudOff, ShieldCheck, Lock, Check, RefreshCw, LogOut, User, ArrowRight } from 'lucide-react';
import {
  signUp,
  signIn,
  signOut,
  getCachedUser,
  deleteAccount,
  onAuthStateChange,
  isCloudConfigured,
  formatDisplayUsername,
} from '../../services/supabaseClient';
import {
  isSyncEnabled,
  setSyncEnabled,
  getSyncStatus,
  getLastSyncedAt,
  getLastSyncError,
  onSyncStatusChange,
  performSync,
  unlockEncryption,
  lockEncryption,
} from '../../services/syncService';
import { useNotesStore } from '../../data/notesStore';

/**
 * AuthModal component
 * Provides optional Supabase authentication, E2EE passphrase derivation,
 * and user-controlled cloud sync settings (SYNC-01, SYNC-02, SYNC-03, SYNC-04).
 */
export default function AuthModal({ isOpen, onClose }) {
  const store = useNotesStore();

  const [currentUser, setCurrentUser] = useState(() => getCachedUser());
  const [activeTab, setActiveTab] = useState('signIn'); // 'signIn' | 'signUp'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [syncEnabledState, setSyncEnabledState] = useState(() => isSyncEnabled());
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus());
  const [lastSyncTime, setLastSyncTime] = useState(() => getLastSyncedAt());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [unlockPassphrase, setUnlockPassphrase] = useState('');

  useEffect(() => {
    const sub = onAuthStateChange((_event, user) => {
      setCurrentUser(user);
    });
    const offStatus = onSyncStatusChange((status, lastSync, error) => {
      setSyncStatus(status);
      setLastSyncTime(lastSync);
      if (status === 'error' && error) setErrorMsg(error);
    });
    return () => {
      sub?.unsubscribe?.();
      offStatus();
    };
  }, []);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (activeTab === 'signUp') {
        const { user } = await signUp(username.trim(), password);
        setCurrentUser(user);
        setSuccessMsg(`Welcome, ${username.trim()}! Account created.`);
      } else {
        const { user } = await signIn(username.trim(), password);
        setCurrentUser(user);
        setSuccessMsg(`Welcome back, ${formatDisplayUsername(user)}!`);
      }

      // Derive the E2EE master key (defaults to the account password) and start syncing.
      await unlockEncryption(passphrase.trim() || password);
      setSyncEnabled(true);
      setSyncEnabledState(true);
      setPassword('');
      setPassphrase('');
      await performSync(store);
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      await lockEncryption({ reset: true });
      setCurrentUser(null);
      setSyncEnabled(false);
      setSyncEnabledState(false);
      setSuccessMsg('Signed out. Notes remain safely saved on your device.');
    } catch (err) {
      setErrorMsg(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = (enabled) => {
    setSyncEnabled(enabled);
    setSyncEnabledState(enabled);
    setErrorMsg('');
    if (enabled) performSync(store);
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await unlockEncryption(unlockPassphrase);
      setUnlockPassphrase('');
      await performSync(store);
    } catch (err) {
      setErrorMsg(err.message || 'Could not unlock');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      'Permanently delete your account and all cloud data? Notes on this device are kept. This cannot be undone.'
    );
    if (!ok) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await deleteAccount();
      await lockEncryption({ reset: true });
      setSyncEnabled(false);
      setSyncEnabledState(false);
      setCurrentUser(null);
      setSuccessMsg('Account deleted. Your notes remain on this device.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await performSync(store);
      if (res.success) {
        setSuccessMsg(`Synced: ${res.uploaded} sent, ${res.merged} updated from cloud.`);
      } else {
        setErrorMsg(res.reason || res.error || 'Sync failed');
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F0F0F] border border-border-subtle rounded-card shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-subtle/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cream-bg/10 border border-cream-bg/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cream-bg" />
            </div>
            <div>
              <h3 className="text-body font-medium text-text-primary">
                {currentUser ? 'Cloud Sync & Account' : 'Supabase Cloud Sync'}
              </h3>
              <p className="text-[11px] text-text-dimmed">End-to-End Encrypted (E2EE)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-divider/50 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {currentUser ? (
            /* SIGNED IN VIEW */
            <div className="flex flex-col gap-5">
              {/* User info card */}
              <div className="p-4 rounded-card bg-[#181818] border border-border-subtle/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-divider/60 border border-border-subtle flex items-center justify-center text-text-primary">
                    <User className="w-4 h-4 text-cream-bg" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body font-medium text-text-primary truncate max-w-[200px]">
                      {formatDisplayUsername(currentUser)}
                    </span>
                    <span className="text-[11px] text-text-dimmed">Cloud Sync Connected</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-3 py-1.5 rounded text-[11px] border border-border-subtle text-text-secondary hover:text-red-400 hover:border-red-400/50 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>

              {/* Cloud Sync Toggle (SYNC-04) */}
              <div className="p-4 rounded-card bg-[#141414] border border-border-subtle/40 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {syncEnabledState ? (
                      <Cloud className="w-4 h-4 text-accent-yellow" />
                    ) : (
                      <CloudOff className="w-4 h-4 text-text-dimmed" />
                    )}
                    <span className="text-body font-medium text-text-primary">
                      Cloud Synchronization
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {syncEnabledState
                      ? 'Encrypted notes sync across devices'
                      : 'Sync paused — operating 100% locally'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncEnabledState}
                    onChange={(e) => handleToggleSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-divider/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cream-bg" />
                </label>
              </div>

              {/* Sync Status & Manual Action */}
              {syncEnabledState && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-label text-text-secondary">
                      Status: <strong className="text-cream-bg capitalize">{syncStatus}</strong>
                    </span>
                    {lastSyncTime && (
                      <span className="text-[10px] text-text-dimmed font-mono">
                        Last sync: {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-button bg-cream-bg text-cream-text text-label font-medium flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>
              )}

              {syncEnabledState && syncStatus === 'locked' && (
                <form onSubmit={handleUnlock} className="p-4 rounded-card bg-[#141414] border border-accent-yellow/40 flex flex-col gap-2.5">
                  <span className="text-label text-text-primary font-medium">
                    Enter your encryption passphrase to unlock sync on this device
                  </span>
                  <input
                    type="password"
                    value={unlockPassphrase}
                    onChange={(e) => setUnlockPassphrase(e.target.value)}
                    placeholder="Passphrase (your password unless you set another)"
                    autoComplete="current-password"
                    className="px-3.5 py-2.5 rounded-card bg-[#161616] border border-border-subtle text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading || !unlockPassphrase}
                    className="py-2 rounded-button bg-cream-bg text-cream-text text-label font-medium disabled:opacity-50"
                  >
                    Unlock & Sync
                  </button>
                </form>
              )}

              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-cream-bg">{successMsg}</p>}

              {/* Zero-Knowledge Assurance Banner */}
              <div className="p-3.5 rounded-card bg-[#111111] border border-border-subtle/30 flex items-start gap-2.5 text-[11px] text-text-secondary">
                <Lock className="w-4 h-4 text-cream-bg shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Knowledge E2EE:</strong> All titles, markdown bodies, sketches, and audio notes are encrypted with AES-256-GCM before leaving this device. Nobody else can read them.
                </span>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="self-start text-[11px] text-text-dimmed hover:text-red-400 underline underline-offset-2 transition-colors"
              >
                Delete account & cloud data
              </button>
            </div>
          ) : (
            /* SIGN IN / SIGN UP FORM */
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {/* Supabase Connection Status Banner */}
              <div className="px-3 py-2 rounded-card bg-[#141414] border border-border-subtle/40 flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Backend:</span>
                {isCloudConfigured() ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Cloud Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-text-dimmed font-mono" title="Cloud sync is not available in this build">
                    <span className="w-2 h-2 rounded-full bg-accent-yellow/80" />
                    Not configured — local only
                  </span>
                )}
              </div>

              {/* Tab Switcher */}
              <div className="flex p-1 rounded-card bg-[#151515] border border-border-subtle/40">
                <button
                  type="button"
                  onClick={() => setActiveTab('signIn')}
                  className={`flex-1 py-1.5 text-label font-medium rounded transition-colors ${
                    activeTab === 'signIn'
                      ? 'bg-cream-bg text-cream-text'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signUp')}
                  className={`flex-1 py-1.5 text-label font-medium rounded transition-colors ${
                    activeTab === 'signUp'
                      ? 'bg-cream-bg text-cream-text'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Username Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label text-text-secondary">Username</label>
                  <span className="text-[10px] text-text-dimmed">No email required</span>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or your name"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="px-3.5 py-2.5 rounded-card bg-[#161616] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label text-text-secondary">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="px-3.5 py-2.5 rounded-card bg-[#161616] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg transition-colors"
                />
              </div>

              {/* Optional Custom E2EE Passphrase */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label text-text-secondary flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cream-bg" />
                    <span>Encryption Passphrase</span>
                  </label>
                  <span className="text-[10px] text-text-dimmed">Optional (defaults to password)</span>
                </div>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Secret key for AES-256 derivation"
                  className="px-3.5 py-2.5 rounded-card bg-[#161616] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg transition-colors text-xs font-mono"
                />
              </div>

              {/* Feedback messages */}
              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-cream-bg">{successMsg}</p>}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'signUp' ? 'Create Account & Enable Sync' : 'Sign In & Sync'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Offline Assurance note */}
              <p className="text-[11px] text-text-dimmed text-center leading-relaxed">
                Cloud sync is completely optional. You can continue taking notes locally without creating an account.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
