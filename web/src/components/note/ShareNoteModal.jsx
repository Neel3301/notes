import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Globe,
  Lock,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  generateRandomSlug,
  isSlugAvailable,
  shareNotePublicly,
  shareNotePrivately,
  formatShareUrl,
} from '../../services/sharingService';

/**
 * ShareNoteModal component
 * Implements public and password-protected note sharing with custom slugs (SHR-01, SHR-02, SHR-03).
 */
export default function ShareNoteModal({ isOpen, onClose, note }) {
  const [shareType, setShareType] = useState('public'); // 'public' | 'private'
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [slugStatus, setSlugStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-generate random slug when opened
  useEffect(() => {
    if (isOpen && !customSlug) {
      const initial = generateRandomSlug('note');
      setCustomSlug(initial);
      setSlugStatus('available');
    }
    if (!isOpen) {
      setGeneratedResult(null);
      setErrorMsg('');
      setCopied(false);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  // Real-time debounce check for custom slug availability (SHR-03)
  useEffect(() => {
    if (!customSlug || customSlug.trim().length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(customSlug, note?.id);
        setSlugStatus(available ? 'available' : 'taken');
      } catch (e) {
        setSlugStatus('idle');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customSlug, note?.id]);

  if (!isOpen || !note) return null;

  const handleRandomizeSlug = () => {
    const next = generateRandomSlug('note');
    setCustomSlug(next);
  };

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (slugStatus === 'taken') {
      setErrorMsg('This link name is already taken. Please customize or click random.');
      return;
    }

    if (shareType === 'private') {
      if (!password || password.trim().length === 0) {
        setErrorMsg('Please enter a password to protect this note.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      let res;
      if (shareType === 'public') {
        res = await shareNotePublicly(note, customSlug);
      } else {
        res = await shareNotePrivately(note, password, customSlug);
      }

      setGeneratedResult(res);
      // Cache in localStorage for active shared links view
      try {
        const key = 'edsy_shared_notes_cache';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = [
          {
            id: `cache-${Date.now()}`,
            slug: res.slug,
            title: note.title,
            isPrivate: res.isPrivate,
            createdAt: 'Just now',
            views: 0,
          },
          ...existing.filter((item) => item.slug !== res.slug),
        ];
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        // non-blocking
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create shareable link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedResult?.shareUrl) return;
    navigator.clipboard.writeText(generatedResult.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-border-subtle rounded-card shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-subtle/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cream-bg/10 border border-cream-bg/30 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-cream-bg" />
            </div>
            <div>
              <h3 className="text-body font-medium text-text-primary truncate max-w-[280px]">
                Share Note: {note.title}
              </h3>
              <p className="text-[11px] text-text-dimmed">Web link access across any device</p>
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

        {/* Modal Content */}
        <div className="p-5">
          {generatedResult ? (
            /* SUCCESS LINK DISPLAY */
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="p-4 rounded-card bg-[#141414] border border-cream-bg/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-label">
                  <span className="text-cream-bg font-medium flex items-center gap-1.5">
                    {generatedResult.isPrivate ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-accent-yellow" />
                        <span>Private Password-Protected Link</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 text-cream-bg" />
                        <span>Public Shareable Link</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-text-dimmed font-mono uppercase">
                    Ready to share
                  </span>
                </div>

                {/* Link input with copy button */}
                <div className="mt-2 flex items-center gap-2 bg-[#0A0A0A] p-1.5 rounded-card border border-border-subtle">
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.shareUrl}
                    className="flex-1 bg-transparent px-2.5 py-1 text-xs text-text-primary font-mono outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-button bg-cream-bg text-cream-text text-label font-medium flex items-center gap-1 hover:opacity-95 active:scale-95 transition-all shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {generatedResult.isPrivate && (
                <div className="p-3 rounded-card bg-divider/20 border border-accent-yellow/30 text-[11px] text-text-secondary flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent-yellow shrink-0 mt-0.5" />
                  <span>
                    Remember to share the password securely with your recipient. Without it, they cannot decrypt the note.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={generatedResult.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-label text-cream-bg hover:underline flex items-center gap-1"
                >
                  <span>Open link in new tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2 rounded-button border border-border-subtle hover:border-text-secondary text-label text-text-primary transition-colors"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          ) : (
            /* CONFIGURATION FORM */
            <form onSubmit={handleGenerateLink} className="flex flex-col gap-4">
              {/* Type Switcher: Public vs Private */}
              <div className="flex p-1 rounded-card bg-[#151515] border border-border-subtle/40">
                <button
                  type="button"
                  onClick={() => setShareType('public')}
                  className={`flex-1 py-2 text-label font-medium rounded flex items-center justify-center gap-2 transition-colors ${
                    shareType === 'public'
                      ? 'bg-cream-bg text-cream-text'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Sharing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareType('private')}
                  className={`flex-1 py-2 text-label font-medium rounded flex items-center justify-center gap-2 transition-colors ${
                    shareType === 'private'
                      ? 'bg-cream-bg text-cream-text'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private (Password)</span>
                </button>
              </div>

              {/* Custom Slug Section (SHR-03) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label text-text-secondary">Custom Link Name (Slug)</label>
                  <div className="flex items-center gap-1.5">
                    {slugStatus === 'checking' && (
                      <span className="text-[10px] text-text-dimmed">Checking...</span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-[10px] text-cream-bg font-mono">Available ✓</span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-[10px] text-red-400 font-mono">Taken ✗</span>
                    )}
                    <button
                      type="button"
                      onClick={handleRandomizeSlug}
                      className="text-[10px] text-cream-bg hover:underline ml-1"
                    >
                      Randomize
                    </button>
                  </div>
                </div>

                <div className="flex items-center rounded-card bg-[#161616] border border-border-subtle px-3 py-2 text-xs">
                  <span className="text-text-dimmed font-mono mr-1">#/share/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                    placeholder="my-custom-note"
                    className="flex-1 bg-transparent text-text-primary font-mono outline-none"
                  />
                </div>
              </div>

              {/* Private Password Inputs (SHR-02) */}
              {shareType === 'private' && (
                <div className="flex flex-col gap-3 p-3.5 rounded-card bg-[#141414] border border-border-subtle/50 animate-fadeIn">
                  <div className="flex flex-col gap-1">
                    <label className="text-label text-text-secondary">Set Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password to decrypt note"
                      className="px-3.5 py-2 rounded-card bg-[#191919] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-label text-text-secondary">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="px-3.5 py-2 rounded-card bg-[#191919] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || slugStatus === 'taken'}
                className="mt-2 w-full py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate Shareable Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
