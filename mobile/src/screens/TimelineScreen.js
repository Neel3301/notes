import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Plus } from 'lucide-react-native';
import AppHeader from '../components/AppHeader';
import NoteCard from '../components/NoteCard';
import DatePager from '../components/DatePager';
import { useNotes } from '../data/notesStore';
import { colors, typography, radius } from '../theme/tokens';

export default function TimelineScreen({ onNavigate }) {
  const store = useNotes();
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('This week'); // 'This week' | 'Today' | 'All'

  const dates = [
    { current: 'Mon. 12', next: 'Tue. 13' },
    { current: 'Tue. 13', next: 'Wed. 14' },
    { current: 'Wed. 14', next: 'Thu. 15' },
    { current: 'Thu. 15', next: 'Fri. 16' },
  ];

  const activeDate = dates[currentDateIndex];

  const handlePrev = () => {
    setCurrentDateIndex((prev) => (prev > 0 ? prev - 1 : dates.length - 1));
  };

  const handleNext = () => {
    setCurrentDateIndex((prev) => (prev < dates.length - 1 ? prev + 1 : 0));
  };

  const activeNotes = store.notes.filter((n) => !n.trashed);

  const filteredNotes = activeNotes.filter((n) => {
    if (filterMode === 'Today') {
      return n.date === activeDate.current;
    }
    if (filterMode === 'This week') {
      return ['Mon. 12', 'Tue. 13', 'Wed. 14', 'Thu. 15', 'Fri. 16'].includes(n.date) || n.pinned;
    }
    return true;
  });

  const handleQuickCreate = () => {
    const newNote = {
      title: 'New Quick Note',
      author: 'You',
      notebook: 'Quick Notes',
      color: 'blue',
      date: activeDate.current,
      time: '12:00 pm',
      tags: ['Idea'],
      content: '# New Quick Note\n\nStart typing ideas...',
    };
    store.saveNote(newNote).then((saved) => {
      onNavigate('editor', { note: saved, noteId: saved.id });
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.screen} />
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          left="menu"
          logo=".edsy"
          onLeftPress={() => onNavigate('menu')}
        />

        {/* Hero Title */}
        <View style={styles.titleContainer}>
          <Text style={typography.display}>Daily{'\n'}Notes</Text>
        </View>

        {/* Filter Pill Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => {
              const modes = ['This week', 'Today', 'All'];
              const nextIdx = (modes.indexOf(filterMode) + 1) % modes.length;
              setFilterMode(modes[nextIdx]);
            }}
          >
            <Text style={styles.filterPillText}>{filterMode}</Text>
            <ChevronDown size={14} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newButton}
            onPress={handleQuickCreate}
          >
            <Plus size={16} color={colors.creamText} />
            <Text style={styles.newButtonText}>Note</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Carousel */}
        <View style={styles.carouselContainer}>
          {filteredNotes.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              decelerationRate="fast"
              snapToInterval={252}
            >
              {filteredNotes.map((note) => (
                <View key={note.id} style={styles.cardWrapper}>
                  <NoteCard
                    color={note.color}
                    author={note.author}
                    title={note.title}
                    time={note.time}
                    liked={note.liked}
                    onLikeToggle={() => store.toggleLike(note.id)}
                    onPress={() => onNavigate('editor', { note, noteId: note.id })}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notes scheduled for {activeDate.current}</Text>
              <TouchableOpacity style={styles.emptyCreateButton} onPress={handleQuickCreate}>
                <Text style={styles.emptyCreateButtonText}>+ Create note</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom DatePager */}
        <View style={styles.bottomBar}>
          <DatePager
            current={activeDate.current}
            next={activeDate.next}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </View>
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
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginTop: 24,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  filterPillText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamBg,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  newButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.creamText,
  },
  carouselContainer: {
    marginTop: 28,
  },
  carouselContent: {
    paddingRight: 16,
  },
  cardWrapper: {
    marginRight: 16,
  },
  emptyContainer: {
    height: 320,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyCreateButton: {
    marginTop: 16,
    backgroundColor: colors.creamBg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.button,
  },
  emptyCreateButtonText: {
    color: colors.creamText,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
});
