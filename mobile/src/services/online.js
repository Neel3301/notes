// Lightweight reachability probe so we don't need a native NetInfo module.
const PROBE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/health`
  : null;

export default {
  async isOnline() {
    if (!PROBE_URL) return false;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      await fetch(PROBE_URL, { method: 'GET', signal: ctrl.signal });
      clearTimeout(t);
      return true;
    } catch {
      return false;
    }
  },
};
