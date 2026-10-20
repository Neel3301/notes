import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import SearchPill from '../components/SearchPill';
import NoteCard from '../components/NoteCard';
import { useNotes } from '../data/notesStore';
import { colors, typography, radius } from '../theme/tokens';

export default function NotesCatalogScreen({ onNavigate, initialFilter }) {
  const store = useNotes();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(initialFilter || 'All');

  const filterTags = ['All', 'Favorites', 'Design', 'Frontend', 'Art', 'Tokens'];

  const activeNotes = store.notes.filter((n) => !n.trashed);

  const filteredNotes = activeNotes.filter((note) => {
    if (selectedTag === 'Favorites') {
      if (!note.liked) return false;
    } else if (selectedTag !== 'All') {
      if (!note.tags || !note.tags.includes(selectedTag)) return false;
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const titleMatch = note.title && note.title.toLowerCase().includes(q);
      const authorMatch = note.author && note.author.toLowerCase().includes(q);
      const contentMatch = note.content && note.content.toLowerCase().includes(q);
      const tagMatch = note.tags && note.tags.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !authorMatch && !contentMatch && !tagMatch) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.screen} />
      <View style={styles.container}>
        <AppHeader
          left="menu"
          logo=".edsy"
          onLeftPress={() => onNavigate('menu')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Heading */}
          <View style={styles.titleContainer}>
            <Text style={typography.display}>All{'\n'}Notes</Text>
          </View>

          {/* Search Pill */}
          <View style={styles.searchContainer}>
            <SearchPill
              value={query}
              onChangeText={setQuery}
              placeholder="Search notes, tags..."
              onClear={() => setQuery('')}
            />
          </View>

          {/* Horizontal Tags Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScrollView}
            contentContainerStyle={styles.tagsContainer}
          >
            {filterTags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(tag)}
                  style={[
                    styles.tagPill,
                    isActive && styles.activeTagPill,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagPillText,
                      isActive && styles.activeTagPillText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Vertical Stacked Cards */}
          <View style={styles.cardList}>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <View key={note.id} style={styles.cardItem}>
                  <NoteCard
                    color={note.color}
                    author={note.author}
                    title={note.title}
                    time={note.time || note.date}
                    liked={note.liked}
                    fullWidth={true}
                    onLikeToggle={() => store.toggleLike(note.id)}
                    onPress={() => onNavigate('editor', { note, noteId: note.id })}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No notes found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 20,
  },
  searchContainer: {
    marginTop: 20,
  },
  tagsScrollView: {
    marginTop: 16,
  },
  tagsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  tagPill: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  activeTagPill: {
    backgroundColor: colors.creamBg,
    borderColor: colors.creamBg,
  },
  tagPillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeTagPillText: {
    color: colors.creamText,
    fontWeight: '500',
  },
  cardList: {
    marginTop: 24,
    gap: 16,
  },
  cardItem: {
    width: '100%',
  },
  emptyContainer: {
    height: 180,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
