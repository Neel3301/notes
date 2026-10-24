import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { colors, typography, radius } from '../theme/tokens';
import { notesStore } from '../data/notesStore';
import {
  isCloudConfigured,
  signIn,
  signUp,
  signOut,
  deleteAccount,
  getCachedUser,
  onAuthStateChange,
  formatDisplayUsername,
} from '../services/supabase';
import {
  onSyncChange,
  setSyncEnabled,
  unlockEncryption,
  lockEncryption,
  performSync,
} from '../services/sync';

export default function AccountScreen({ onBack }) {
  const [user, setUser] = useState(getCachedUser());
  const [sync, setSync] = useState({ status: 'local', enabled: false });
  const [tab, setTab] = useState('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockPass, setUnlockPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const sub = onAuthStateChange((_e, u) => setUser(u));
    const off = onSyncChange(setSync);
    return () => {
      sub.unsubscribe?.();
      off();
    };
  }, []);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await fn();
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const submitAuth = () =>
    run(async () => {
      if (!username.trim() || !password) throw new Error('Enter a username and password.');
      if (tab === 'signUp') await signUp(username, password);
      else await signIn(username, password);
      await unlockEncryption(passphrase.trim() || password);
      await setSyncEnabled(true);
      setPassword('');
      setPassphrase('');
      const res = await performSync(notesStore);
      if (!res.success && res.error) throw new Error(res.error);
    });

  const submitUnlock = () =>
    run(async () => {
      await unlockEncryption(unlockPass);
      setUnlockPass('');
      const res = await performSync(notesStore);
      if (!res.success && res.error) throw new Error(res.error);
    });

  const doSignOut = () =>
    run(async () => {
      await signOut();
      await lockEncryption({ reset: true });
      await setSyncEnabled(false);
      setInfo('Signed out. Your notes stay on this device.');
    });

  const confirmDelete = () =>
    Alert.alert(
      'Delete account?',
      'Your account and all cloud data are permanently deleted. Notes on this device are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            run(async () => {
              await deleteAccount();
              await lockEncryption({ reset: true });
              await setSyncEnabled(false);
              setInfo('Account deleted.');
            }),
        },
      ]
    );

  const lastSynced = sync.lastSynced ? new Date(sync.lastSynced).toLocaleTimeString() : null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.back} hitSlop={12}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account & Sync</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!isCloudConfigured() ? (
            <Text style={styles.muted}>Cloud sync is not available in this build. Notes are stored on this device.</Text>
          ) : user ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{formatDisplayUsername(user)}</Text>
                <Text style={styles.muted}>Signed in</Text>
              </View>

              <View style={[styles.card, styles.rowBetween]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.cardTitle}>Cloud sync</Text>
                  <Text style={styles.muted}>
                    {sync.enabled ? `Status: ${sync.status}${lastSynced ? ` · ${lastSynced}` : ''}` : 'Off — notes stay on this device'}
                  </Text>
                </View>
                <Switch
                  value={sync.enabled}
                  onValueChange={(v) => run(async () => {
                    await setSyncEnabled(v);
                    if (v) await performSync(notesStore);
                  })}
                />
              </View>

              {sync.enabled && sync.status === 'locked' && (
                <View style={[styles.card, styles.warn]}>
                  <Text style={styles.cardTitle}>Unlock sync on this device</Text>
                  <Text style={[styles.muted, { marginBottom: 10 }]}>
                    Enter your encryption passphrase (your password unless you chose another).
                  </Text>
                  <Field label="Passphrase" value={unlockPass} onChangeText={setUnlockPass} secureTextEntry />
                  <PrimaryButton title="Unlock & sync" onPress={submitUnlock} loading={busy} disabled={!unlockPass} />
                </View>
              )}

              {sync.enabled && sync.status !== 'locked' && (
                <PrimaryButton
                  title="Sync now"
                  variant="outline"
                  loading={busy || sync.status === 'syncing'}
                  onPress={() => run(async () => {
                    const res = await performSync(notesStore);
                    if (!res.success) throw new Error(res.error || res.reason || 'Sync failed');
                    setInfo(`Synced: ${res.uploaded} sent, ${res.merged} updated from cloud.`);
                  })}
                  style={{ marginBottom: 14 }}
                />
              )}

              <PrimaryButton title="Sign out" variant="outline" onPress={doSignOut} loading={busy} style={{ marginBottom: 14 }} />
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.danger}>Delete account & cloud data</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.tabs}>
                {['signIn', 'signUp'].map((t) => (
                  <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                    <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                      {t === 'signIn' ? 'Sign in' : 'Create account'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label="Username" value={username} onChangeText={setUsername} placeholder="e.g. alex" />
              <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />
              <Field
                label="Encryption passphrase"
                hint="Optional — defaults to password"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
              />
              <PrimaryButton
                title={tab === 'signUp' ? 'Create account & sync' : 'Sign in & sync'}
                onPress={submitAuth}
                loading={busy}
              />
              <Text style={[styles.muted, { marginTop: 12, textAlign: 'center' }]}>
                Sync is optional. Notes work fully offline without an account.
              </Text>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <View style={[styles.card, { marginTop: 24, flexDirection: 'row', gap: 10 }]}>
            <ShieldCheck size={18} color={colors.bgCream} />
            <Text style={[styles.muted, { flex: 1 }]}>
              Notes are encrypted on your device with AES-256-GCM before upload. A forgotten passphrase cannot be recovered.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screen },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  back: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { ...typography.body, fontSize: 17, fontWeight: '600' },
  body: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: colors.bgSecondary, borderRadius: radius.card, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.borderDark },
  warn: { borderColor: colors.accentYellow },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bgSecondary, borderRadius: radius.card, padding: 4, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: colors.bgCream },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.textDark },
  error: { color: colors.tagRed, marginTop: 14, fontSize: 13 },
  info: { color: colors.bgCream, marginTop: 14, fontSize: 13 },
  danger: { color: colors.tagRed, fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
});
