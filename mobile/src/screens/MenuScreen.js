import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  Calendar,
  Layers,
  BookOpen,
  Tag as TagIcon,
  Heart,
  Trash2,
  RefreshCw,
  ChevronRight,
  Plus,
} from 'lucide-react-native';
import { colors, typography, radius } from '../theme/tokens';
import { useNotes, notesStore } from '../data/notesStore';

export default function MenuScreen({ onClose, onNavigate }) {
  const { notes, restoreNote, deleteNote } = useNotes();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'notebooks' | 'tags' | 'trash'

  const activeNotes = notes.filter((n) => !n.trashed);
  const trashedNotes = notes.filter((n) => n.trashed);
  const likedNotes = activeNotes.filter((n) => n.liked);

  // Group by notebook
  const notebooks = {};
  activeNotes.forEach((n) => {
    const nb = n.notebook || 'General';
    notebooks[nb] = (notebooks[nb] || 0) + 1;
  });

  // Extract all tags
  const tags = {};
  activeNotes.forEach((n) => {
    (n.tags || []).forEach((t) => {
      tags[t] = (tags[t] || 0) + 1;
    });
  });

  const handleSelectSection = (screen, params = {}) => {
    if (onNavigate) {
      onNavigate(screen, params);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoDot}>.</Text>
          <Text style={styles.logoText}>edsy</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'menu' && (
          <View>
            {/* Quick Stats Pill */}
            <View style={styles.statsCard}>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{activeNotes.length}</Text>
                <Text style={styles.statLabel}>Active Notes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{Object.keys(notebooks).length}</Text>
                <Text style={styles.statLabel}>Notebooks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{likedNotes.length}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>

            {/* Main Menu Links */}
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleSelectSection('timeline')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Calendar size={20} color={colors.accentYellow} />
                  <Text style={styles.menuItemTitle}>Timeline</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleSelectSection('catalog')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Layers size={20} color={colors.accentBlue} />
                  <Text style={styles.menuItemTitle}>All Notes</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeNotes.length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setActiveTab('notebooks')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <BookOpen size={20} color={colors.bgCream} />
                  <Text style={styles.menuItemTitle}>Notebooks</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Object.keys(notebooks).length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setActiveTab('tags')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <TagIcon size={20} color={colors.tagGreen} />
                  <Text style={styles.menuItemTitle}>Tags</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Object.keys(tags).length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleSelectSection('catalog', { filterLiked: true })}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Heart size={20} color={colors.tagRed} />
                  <Text style={styles.menuItemTitle}>Favorites</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{likedNotes.length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setActiveTab('trash')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Trash2 size={20} color={colors.textMuted} />
                  <Text style={styles.menuItemTitle}>Trash</Text>
                </View>
                {trashedNotes.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.tagRed + '33' }]}>
                    <Text style={[styles.badgeText, { color: colors.tagRed }]}>
                      {trashedNotes.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Action Button */}
            <TouchableOpacity
              style={styles.newNoteCta}
              onPress={() => handleSelectSection('editor')}
              activeOpacity={0.8}
            >
              <Plus size={18} color={colors.textDark} />
              <Text style={styles.newNoteCtaText}>Create New Note</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* NOTEBOOKS SUB-VIEW */}
        {activeTab === 'notebooks' && (
          <View>
            <TouchableOpacity
              style={styles.subBackBtn}
              onPress={() => setActiveTab('menu')}
              activeOpacity={0.7}
            >
              <Text style={styles.subBackText}>← Back to Menu</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>Notebooks</Text>
            {Object.entries(notebooks).map(([nbName, count]) => (
              <TouchableOpacity
                key={nbName}
                style={styles.subItem}
                onPress={() => handleSelectSection('catalog', { notebook: nbName })}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <BookOpen size={18} color={colors.bgCream} />
                  <Text style={styles.subItemText}>{nbName}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TAGS SUB-VIEW */}
        {activeTab === 'tags' && (
          <View>
            <TouchableOpacity
              style={styles.subBackBtn}
              onPress={() => setActiveTab('menu')}
              activeOpacity={0.7}
            >
              <Text style={styles.subBackText}>← Back to Menu</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>Tags</Text>
            <View style={styles.tagCloud}>
              {Object.entries(tags).map(([tagName, count]) => (
                <TouchableOpacity
                  key={tagName}
                  style={styles.tagPill}
                  onPress={() => handleSelectSection('catalog', { tag: tagName })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tagPillText}>#{tagName}</Text>
                  <View style={styles.tagCountPill}>
                    <Text style={styles.tagCountText}>{count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* TRASH SUB-VIEW */}
        {activeTab === 'trash' && (
          <View>
            <TouchableOpacity
              style={styles.subBackBtn}
              onPress={() => setActiveTab('menu')}
              activeOpacity={0.7}
            >
              <Text style={styles.subBackText}>← Back to Menu</Text>
            </TouchableOpacity>
            <Text style={styles.subTitle}>Trash ({trashedNotes.length})</Text>

            {trashedNotes.length === 0 ? (
              <View style={styles.emptyTrash}>
                <Trash2 size={40} color={colors.textMuted} />
                <Text style={styles.emptyTrashText}>Trash is empty</Text>
              </View>
            ) : (
              trashedNotes.map((note) => (
                <View key={note.id} style={styles.trashCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trashNoteTitle} numberOfLines={1}>
                      {note.title}
                    </Text>
                    <Text style={styles.trashNoteMeta}>By {note.author} · {note.notebook}</Text>
                  </View>
                  <View style={styles.trashActions}>
                    <TouchableOpacity
                      style={styles.trashActionBtn}
                      onPress={() => restoreNote(note.id)}
                      activeOpacity={0.7}
                    >
                      <RefreshCw size={16} color={colors.tagGreen} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.trashActionBtn}
                      onPress={() => {
                        Alert.alert(
                          'Permanently Delete',
                          'This cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete Forever',
                              style: 'destructive',
                              onPress: () => deleteNote(note.id, true),
                            },
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={colors.tagRed} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: colors.borderDark,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoDot: {
    fontSize: 24,
    color: colors.accentYellow,
    fontWeight: '900',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderDark,
  },
  menuList: {
    gap: 8,
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  newNoteCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bgCream,
    paddingVertical: 16,
    borderRadius: radius.pill,
  },
  newNoteCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  subBackBtn: {
    marginBottom: 16,
  },
  subBackText: {
    fontSize: 14,
    color: colors.accentYellow,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 18,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: radius.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  subItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  tagPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagCountPill: {
    backgroundColor: colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyTrash: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTrashText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  trashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 14,
    borderRadius: radius.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  trashNoteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trashNoteMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  trashActions: {
    flexDirection: 'row',
    gap: 8,
  },
  trashActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
