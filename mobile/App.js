import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TimelineScreen from './src/screens/TimelineScreen';
import NotesCatalogScreen from './src/screens/NotesCatalogScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import MenuScreen from './src/screens/MenuScreen';
import AccountScreen from './src/screens/AccountScreen';
import SharedNoteScreen from './src/screens/SharedNoteScreen';
import { notesStore } from './src/data/notesStore';
import { initSync, startAutoSync } from './src/services/sync';
import { colors } from './src/theme/tokens';

const HOME = { screen: 'timeline', params: {} };

/** Extract a share slug from https://<host>/share/<slug> or edsy://share/<slug>. */
function parseShareSlug(url) {
  const m = /\/share\/([a-z0-9_-]{3,64})\/?(?:[?#].*)?$/i.exec(url || '');
  return m ? m[1].toLowerCase() : null;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [stack, setStack] = useState([HOME]);

  const navigate = useCallback((screen, params = {}) => {
    setStack((prev) => {
      // Top-level destinations replace each other; detail screens stack.
      const base = ['timeline', 'catalog'].includes(screen) ? [HOME] : prev;
      return screen === 'timeline' ? [HOME] : [...base, { screen, params }];
    });
  }, []);

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  useEffect(() => {
    let stopSync = () => {};
    (async () => {
      await notesStore.init();
      await initSync();
      setReady(true);
      stopSync = startAutoSync(notesStore, AppState);
    })();
    return () => stopSync();
  }, []);

  // Deep links to shared notes
  useEffect(() => {
    const open = (url) => {
      const slug = parseShareSlug(url);
      if (slug) navigate('shared', { slug });
    };
    Linking.getInitialURL().then(open).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => open(url));
    return () => sub.remove();
  }, [navigate]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, back]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.bgCream} />
      </View>
    );
  }

  const { screen, params } = stack[stack.length - 1];
  let content;
  switch (screen) {
    case 'catalog':
      content = (
        <NotesCatalogScreen
          onNavigate={navigate}
          initialFilter={params.filterLiked ? 'Favorites' : params.tag}
          initialNotebook={params.notebook}
        />
      );
      break;
    case 'editor':
      content = (
        <NoteEditorScreen
          noteId={params.noteId}
          onBack={back}
          onNavigateToNote={(id) => navigate('editor', { noteId: id })}
        />
      );
      break;
    case 'menu':
      content = <MenuScreen onClose={back} onNavigate={navigate} />;
      break;
    case 'account':
      content = <AccountScreen onBack={back} />;
      break;
    case 'shared':
      content = (
        <SharedNoteScreen
          slug={params.slug}
          onBack={back}
          onImported={(id) => {
            setStack([HOME, { screen: 'editor', params: { noteId: id } }]);
          }}
        />
      );
      break;
    default:
      content = <TimelineScreen onNavigate={navigate} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>{content}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screen },
  loading: { flex: 1, backgroundColor: colors.screen, alignItems: 'center', justifyContent: 'center' },
});
