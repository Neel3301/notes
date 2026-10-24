import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Share, Switch, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Field from './Field';
import PrimaryButton from './PrimaryButton';
import { colors, radius } from '../theme/tokens';
import { shareNote } from '../services/sharing';

export default function ShareSheet({ visible, note, onClose, onExportMarkdown }) {
  const [slug, setSlug] = useState('');
  const [protect, setProtect] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const reset = () => {
    setSlug('');
    setPassword('');
    setProtect(false);
    setError('');
    setResult(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const create = async () => {
    setBusy(true);
    setError('');
    try {
      setResult(await shareNote(note, { slug, password: protect ? password : undefined }));
    } catch (e) {
      setError(e.message || 'Could not create link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Share note</Text>

          {result ? (
            <>
              <Text style={styles.url}>{result.shareUrl}</Text>
              <PrimaryButton
                title="Copy link"
                onPress={async () => {
                  await Clipboard.setStringAsync(result.shareUrl);
                  Alert.alert('Copied', 'Link copied to clipboard.');
                }}
                style={{ marginBottom: 10 }}
              />
              <PrimaryButton
                title="Send…"
                variant="outline"
                onPress={() => Share.share({ message: result.shareUrl })}
                style={{ marginBottom: 10 }}
              />
              {result.isPrivate ? (
                <Text style={styles.hint}>Recipients need the password you set. It is never sent to the server.</Text>
              ) : null}
            </>
          ) : (
            <>
              <Field label="Link name (optional)" value={slug} onChangeText={setSlug} placeholder="my-note" />
              <View style={styles.row}>
                <Text style={styles.label}>Protect with password</Text>
                <Switch value={protect} onValueChange={setProtect} />
              </View>
              {protect ? (
                <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
              ) : (
                <Text style={styles.hint}>Anyone with the link can read this note.</Text>
              )}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton title="Create link" onPress={create} loading={busy} style={{ marginBottom: 10 }} />
              <PrimaryButton title="Export as Markdown file" variant="outline" onPress={onExportMarkdown} style={{ marginBottom: 10 }} />
            </>
          )}
          <TouchableOpacity onPress={close} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bgSecondary, padding: 20, paddingBottom: 32, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label: { color: colors.textPrimary, fontSize: 14 },
  hint: { color: colors.textMuted, fontSize: 12, marginBottom: 14, lineHeight: 17 },
  error: { color: colors.tagRed, marginBottom: 12, fontSize: 13 },
  url: { color: colors.bgCream, fontSize: 14, marginBottom: 16, padding: 12, backgroundColor: colors.screen, borderRadius: radius.card },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: colors.textMuted },
});
