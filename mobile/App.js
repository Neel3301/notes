import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Calendar, Layers, Plus } from 'lucide-react-native';
import TimelineScreen from './src/screens/TimelineScreen';
import NotesCatalogScreen from './src/screens/NotesCatalogScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import MenuScreen from './src/screens/MenuScreen';
import { colors, radius, typography } from './src/theme/tokens';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('timeline');
  const [screenParams, setScreenParams] = useState({});
  const [history, setHistory] = useState([]);

  const navigate = (screen, params = {}) => {
    setHistory((prev) => [...prev, { screen: currentScreen, params: screenParams }]);
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, h.length - 1));
      setCurrentScreen(prev.screen);
      setScreenParams(prev.params);
    } else {
      setCurrentScreen('timeline');
      setScreenParams({});
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'timeline':
        return <TimelineScreen onNavigate={navigate} />;
      case 'catalog':
        return (
          <NotesCatalogScreen
            onNavigate={navigate}
            initialFilter={screenParams?.tag || (screenParams?.filterLiked ? 'Favorites' : 'All')}
          />
        );
      case 'editor':
        return (
          <NoteEditorScreen
            noteId={screenParams?.noteId}
            onBack={goBack}
            onNavigateToNote={(targetId) => navigate('editor', { noteId: targetId })}
          />
        );
      case 'menu':
        return (
          <MenuScreen
            onClose={goBack}
            onNavigate={(screen, params) => navigate(screen, params)}
          />
        );
      default:
        return <TimelineScreen onNavigate={navigate} />;
    }
  };

  const showBottomNav = currentScreen === 'timeline' || currentScreen === 'catalog';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.screen} />
      <View style={styles.content}>{renderScreen()}</View>

      {/* Sleek Bottom Bar on Main Screens */}
      {showBottomNav && (
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[
                styles.navItem,
                currentScreen === 'timeline' && styles.navItemActive,
              ]}
              onPress={() => setCurrentScreen('timeline')}
              activeOpacity={0.7}
            >
              <Calendar
                size={18}
                color={currentScreen === 'timeline' ? colors.creamText : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  currentScreen === 'timeline' && styles.navLabelActive,
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingAddBtn}
              onPress={() => navigate('editor')}
              activeOpacity={0.8}
            >
              <Plus size={22} color={colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                currentScreen === 'catalog' && styles.navItemActive,
              ]}
              onPress={() => setCurrentScreen('catalog')}
              activeOpacity={0.7}
            >
              <Layers
                size={18}
                color={currentScreen === 'catalog' ? colors.creamText : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  currentScreen === 'catalog' && styles.navLabelActive,
                ]}
              >
                Catalog
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    gap: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  navItemActive: {
    backgroundColor: colors.bgCream,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: colors.creamText,
    fontWeight: '700',
  },
  floatingAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
