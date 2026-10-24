import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock } from 'lucide-react-native';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { colors, typography } from '../theme/tokens';
import { fetchSharedNote } from '../services/sharing';
import { notesStore } from '../data/notesStore';

export default function SharedNoteScreen({ slug, onBack, onImported }) {
  const [state, setState] = useState({ loading: true });
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSharedNote(slug)
      .then((res) => alive && setState({ loading: false, ...res }))
      .catch((e) => alive && setState({ loading: false, error: e.message }));
    return () => {
      alive = false;
    };
  }, [slug]);

  const unlock = async () => {
    setBusy(true);
    try {
      const res = await fetchSharedNote(slug, password);
      setState({ loading: false, ...res, wrong: res.error === 'INCORRECT_PASSWORD' });
    } catch (e) {
      setState({ loading: false, error: e.message });
    } finally {
      setBusy(false);
    }
  };

  const importNote = async () => {
    const n = state.note;
    const saved = await notesStore.saveNote({
      title: n.title,
      author: n.author || 'Shared',
      notebook: 'Imported Notes',
      color: n.color || 'blue',
      content: n.content || '',
      blocks: n.blocks || [],
      tags: ['Shared', 'Imported'],
    });
    onImported?.(saved.id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {state.loading ? (
          <ActivityIndicator color={colors.bgCream} style={{ marginTop: 60 }} />
        ) : state.error ? (
          <Text style={styles.error}>{state.error}</Text>
        ) : state.isLocked ? (
          <View>
            <Lock size={28} color={colors.bgCream} />
            <Text style={[typography.title, { marginVertical: 14 }]}>Password protected note</Text>
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            {state.wrong ? <Text style={styles.error}>Incorrect password.</Text> : null}
            <PrimaryButton title="Unlock" onPress={unlock} loading={busy} disabled={!password} />
          </View>
        ) : (
          <View>
            <Text style={[typography.title, { marginBottom: 6 }]}>{state.note.title}</Text>
            <Text style={styles.meta}>by {state.note.author || 'Edsy User'}</Text>
            <Text style={styles.content}>{state.note.content}</Text>
            {(state.note.blocks || []).map((b) => (
              <View key={b.id} style={styles.block}>
                {b.title ? <Text style={styles.blockTitle}>{b.title}</Text> : null}
                {b.content ? <Text style={styles.content}>{b.content}</Text> : null}
                {(b.items || []).map((i) => (
                  <Text key={i.id} style={styles.content}>
                    {i.completed ? '☑' : '☐'} {i.text}
                  </Text>
                ))}
              </View>
            ))}
            <PrimaryButton title="Save a copy to my notes" onPress={importNote} style={{ marginTop: 24 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screen },
  header: { height: 52, paddingHorizontal: 16, justifyContent: 'center' },
  body: { padding: 20, paddingBottom: 60 },
  error: { color: colors.tagRed, marginVertical: 12 },
  meta: { color: colors.textMuted, marginBottom: 16 },
  content: { color: colors.textPrimary, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  block: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.divider },
  blockTitle: { color: colors.accentYellow, fontWeight: '700', marginBottom: 6 },
});
