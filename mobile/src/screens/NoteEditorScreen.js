import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  Eye,
  Edit3,
  Trash2,
  Share2,
  Plus,
  CheckSquare,
  Square,
  Bookmark,
  Tag,
  Hash,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, radius } from '../theme/tokens';
import { notesStore } from '../data/notesStore';

const COLOR_OPTIONS = [
  { key: 'yellow', label: 'Gold', hex: colors.accentYellow },
  { key: 'light', label: 'Cream', hex: colors.bgCream },
  { key: 'blue', label: 'Slate', hex: colors.accentBlue },
  { key: 'dark', label: 'Dark', hex: colors.bgSecondary },
];

export default function NoteEditorScreen({ noteId, onBack, onNavigateToNote }) {
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Edsy User');
  const [notebook, setNotebook] = useState('General');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [content, setContent] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [mode, setMode] = useState('write'); // 'write' | 'preview'
  const [backlinks, setBacklinks] = useState([]);

  useEffect(() => {
    if (noteId) {
      const existing = notesStore.getNote(noteId);
      if (existing) {
        setNote(existing);
        setTitle(existing.title || '');
        setAuthor(existing.author || 'Edsy User');
        setNotebook(existing.notebook || 'General');
        setSelectedColor(existing.color || 'yellow');
        setContent(existing.content || '');
        setBlocks(existing.blocks || []);
        setBacklinks(notesStore.getBacklinks(noteId) || []);
      }
    } else {
      // New note template
      setTitle('');
      setContent('# New Note\n\nStart typing thoughts, ideas or wikilinks like [[Design Systems]]...');
      setBlocks([
        {
          id: 'b-' + Date.now(),
          type: 'checklist',
          number: '01',
          title: 'Action Items',
          items: [
            { id: 'c-1', text: 'Define note goals', completed: true },
            { id: 'c-2', text: 'Review backlinks', completed: false },
          ],
        },
      ]);
    }
  }, [noteId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your note.');
      return;
    }

    const payload = {
      ...(note || {}),
      id: noteId || undefined,
      title: title.trim(),
      author: author.trim() || 'Edsy User',
      notebook: notebook.trim() || 'General',
      color: selectedColor,
      content,
      blocks,
      date: note?.date || 'Mon. 12',
      time: note?.time || '10:00 am',
      trashed: false,
    };

    const saved = await notesStore.saveNote(payload);
    Alert.alert('Saved', 'Note successfully saved!');
    if (onBack) onBack();
  };

  const handleDelete = () => {
    if (!noteId) {
      if (onBack) onBack();
      return;
    }
    Alert.alert(
      'Move to Trash',
      'Are you sure you want to move this note to trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trash',
          style: 'destructive',
          onPress: async () => {
            await notesStore.deleteNote(noteId);
            if (onBack) onBack();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const fileUri = `${FileSystem.cacheDirectory || ''}${title.replace(/[^a-zA-Z0-9]/g, '_') || 'note'}.md`;
      const exportContent = `# ${title}\nAuthor: ${author}\nNotebook: ${notebook}\n\n${content}\n`;
      await FileSystem.writeAsStringAsync(fileUri, exportContent);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/markdown', dialogTitle: `Share ${title}` });
      } else {
        Alert.alert('Share', exportContent);
      }
    } catch (err) {
      Alert.alert('Export', `Markdown export ready:\n\n${title}\n${content.substring(0, 150)}...`);
    }
  };

  const toggleChecklistItem = (blockIndex, itemIndex) => {
    const updated = [...blocks];
    const item = updated[blockIndex].items[itemIndex];
    item.completed = !item.completed;
    setBlocks(updated);
  };

  const addChecklistItem = (blockIndex) => {
    const updated = [...blocks];
    if (!updated[blockIndex].items) updated[blockIndex].items = [];
    updated[blockIndex].items.push({
      id: 'c-' + Date.now(),
      text: 'New checklist task',
      completed: false,
    });
    setBlocks(updated);
  };

  const addCalloutBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: 'block-' + Date.now(),
        type: 'callout',
        number: `0${prev.length + 1}`,
        title: 'Callout Note',
        content: 'Key takeaway or design rule.',
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.segmentedToggle}>
          <TouchableOpacity
            style={[styles.segBtn, mode === 'write' && styles.segBtnActive]}
            onPress={() => setMode('write')}
          >
            <Edit3 size={14} color={mode === 'write' ? colors.textDark : colors.textMuted} />
            <Text style={[styles.segText, mode === 'write' && styles.segTextActive]}>Write</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, mode === 'preview' && styles.segBtnActive]}
            onPress={() => setMode('preview')}
          >
            <Eye size={14} color={mode === 'preview' ? colors.textDark : colors.textMuted} />
            <Text style={[styles.segText, mode === 'preview' && styles.segTextActive]}>Preview</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.7}>
            <Share2 size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Trash2 size={18} color={colors.tagRed} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Check size={16} color={colors.textDark} />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Color Palette Selector */}
        <View style={styles.metaRow}>
          <Text style={styles.sectionLabel}>THEME COLOR</Text>
          <View style={styles.colorPills}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c.hex },
                  selectedColor === c.key && styles.colorCircleActive,
                ]}
                onPress={() => setSelectedColor(c.key)}
                activeOpacity={0.8}
              >
                {selectedColor === c.key && <Check size={12} color="#000" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        {/* Metadata Inputs */}
        <View style={styles.metadataCard}>
          <View style={styles.metaField}>
            <Bookmark size={14} color={colors.textMuted} />
            <TextInput
              style={styles.metaInput}
              placeholder="Notebook (e.g. Design Systems)"
              placeholderTextColor={colors.textMuted}
              value={notebook}
              onChangeText={setNotebook}
            />
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaField}>
            <Tag size={14} color={colors.textMuted} />
            <TextInput
              style={styles.metaInput}
              placeholder="Author"
              placeholderTextColor={colors.textMuted}
              value={author}
              onChangeText={setAuthor}
            />
          </View>
        </View>

        {mode === 'write' ? (
          /* WRITE MODE */
          <View style={styles.editorArea}>
            <View style={styles.markdownToolbar}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setContent((c) => c + '\n## ')}
              >
                <Text style={styles.toolText}>H2</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setContent((c) => c + ' **bold** ')}
              >
                <Text style={styles.toolText}>B</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setContent((c) => c + ' [[Wikilink]] ')}
              >
                <Text style={styles.toolText}>[[ ]]</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setContent((c) => c + '\n- ')}
              >
                <Text style={styles.toolText}>• List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setContent((c) => c + '\n> Quote')}
              >
                <Text style={styles.toolText}>Quote</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.contentInput}
              placeholder="Write markdown here..."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            {/* Modular Blocks Editor */}
            <View style={styles.blocksContainer}>
              <View style={styles.blocksHeader}>
                <Text style={styles.sectionLabel}>MODULAR BLOCKS</Text>
                <TouchableOpacity style={styles.addBlockBtn} onPress={addCalloutBlock}>
                  <Plus size={14} color={colors.textPrimary} />
                  <Text style={styles.addBlockText}>Callout</Text>
                </TouchableOpacity>
              </View>

              {blocks.map((block, bIdx) => (
                <View key={block.id || bIdx} style={styles.blockCard}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockNum}>{block.number || `0${bIdx + 1}`}</Text>
                    <TextInput
                      style={styles.blockTitleInput}
                      value={block.title}
                      onChangeText={(t) => {
                        const updated = [...blocks];
                        updated[bIdx].title = t;
                        setBlocks(updated);
                      }}
                      placeholder="Block title"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  {block.type === 'checklist' && (
                    <View style={styles.checklistArea}>
                      {(block.items || []).map((item, iIdx) => (
                        <View key={item.id || iIdx} style={styles.checkItemRow}>
                          <TouchableOpacity
                            onPress={() => toggleChecklistItem(bIdx, iIdx)}
                            activeOpacity={0.7}
                          >
                            {item.completed ? (
                              <CheckSquare size={18} color={colors.accentYellow} />
                            ) : (
                              <Square size={18} color={colors.textMuted} />
                            )}
                          </TouchableOpacity>
                          <TextInput
                            style={[
                              styles.checkItemInput,
                              item.completed && styles.checkItemDone,
                            ]}
                            value={item.text}
                            onChangeText={(txt) => {
                              const updated = [...blocks];
                              updated[bIdx].items[iIdx].text = txt;
                              setBlocks(updated);
                            }}
                          />
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.addCheckItemBtn}
                        onPress={() => addChecklistItem(bIdx)}
                      >
                        <Plus size={12} color={colors.textMuted} />
                        <Text style={styles.addCheckItemText}>Add task item</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {block.type !== 'checklist' && (
                    <TextInput
                      style={styles.blockContentInput}
                      value={block.content}
                      onChangeText={(txt) => {
                        const updated = [...blocks];
                        updated[bIdx].content = txt;
                        setBlocks(updated);
                      }}
                      placeholder="Block body text..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* PREVIEW MODE */
          <View style={styles.previewArea}>
            <View style={styles.previewBody}>
              {content.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return (
                    <Text key={idx} style={styles.previewH1}>
                      {line.replace('# ', '')}
                    </Text>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <Text key={idx} style={styles.previewH2}>
                      {line.replace('## ', '')}
                    </Text>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <View key={idx} style={styles.previewBulletRow}>
                      <Text style={styles.previewBulletDot}>•</Text>
                      <Text style={styles.previewParagraph}>{line.replace('- ', '')}</Text>
                    </View>
                  );
                }
                if (line.startsWith('> ')) {
                  return (
                    <View key={idx} style={styles.previewQuote}>
                      <Text style={styles.previewQuoteText}>{line.replace('> ', '')}</Text>
                    </View>
                  );
                }
                if (line.trim() === '') {
                  return <View key={idx} style={{ height: 10 }} />;
                }
                return (
                  <Text key={idx} style={styles.previewParagraph}>
                    {line}
                  </Text>
                );
              })}
            </View>

            {/* Blocks in Preview */}
            {blocks.map((block, bIdx) => (
              <View key={block.id || bIdx} style={styles.previewBlockCard}>
                <View style={styles.previewBlockHeader}>
                  <Text style={styles.blockNum}>{block.number || `0${bIdx + 1}`}</Text>
                  <Text style={styles.previewBlockTitle}>{block.title}</Text>
                </View>

                {block.type === 'checklist' ? (
                  <View style={styles.checklistArea}>
                    {(block.items || []).map((item, iIdx) => (
                      <TouchableOpacity
                        key={item.id || iIdx}
                        style={styles.previewCheckRow}
                        onPress={() => toggleChecklistItem(bIdx, iIdx)}
                        activeOpacity={0.7}
                      >
                        {item.completed ? (
                          <CheckSquare size={18} color={colors.accentYellow} />
                        ) : (
                          <Square size={18} color={colors.textMuted} />
                        )}
                        <Text
                          style={[
                            styles.previewCheckText,
                            item.completed && styles.previewCheckDone,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.previewBlockBody}>{block.content}</Text>
                )}
              </View>
            ))}

            {/* Backlinks */}
            {backlinks.length > 0 && (
              <View style={styles.backlinksContainer}>
                <Text style={styles.sectionLabel}>LINKED REFERENCES ({backlinks.length})</Text>
                {backlinks.map(({ note: linkedNote }) => (
                  <TouchableOpacity
                    key={linkedNote.id}
                    style={styles.backlinkCard}
                    onPress={() => onNavigateToNote && onNavigateToNote(linkedNote.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backlinkTitle}>{linkedNote.title}</Text>
                    <Text style={styles.backlinkAuthor}>By {linkedNote.author} · {linkedNote.notebook}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: colors.borderDark,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSecondary,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.pill,
    padding: 3,
  },
  segBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  segBtnActive: {
    backgroundColor: colors.bgCream,
  },
  segText: {
    fontSize: typography.bodySm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segTextActive: {
    color: colors.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgCream,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  saveBtnText: {
    fontSize: typography.bodySm,
    fontWeight: '700',
    color: colors.textDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  colorPills: {
    flexDirection: 'row',
    gap: 10,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 32,
    marginBottom: 16,
  },
  metadataCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  metaField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  metaInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.bodySm,
  },
  metaDivider: {
    height: 1,
    backgroundColor: colors.borderDark,
    marginVertical: 6,
  },
  editorArea: {
    flex: 1,
  },
  markdownToolbar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  toolBtn: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  toolText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  contentInput: {
    minHeight: 180,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: 24,
  },
  blocksContainer: {
    marginTop: 8,
  },
  blocksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  addBlockText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  blockCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  blockNum: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accentYellow,
  },
  blockTitleInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checklistArea: {
    gap: 8,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkItemInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  checkItemDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  addCheckItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 4,
  },
  addCheckItemText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  blockContentInput: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  previewArea: {
    flex: 1,
  },
  previewBody: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  previewH1: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 8,
  },
  previewH2: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: 6,
  },
  previewParagraph: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  previewBulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  previewBulletDot: {
    color: colors.accentYellow,
    fontSize: 16,
    lineHeight: 22,
  },
  previewQuote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accentYellow,
    paddingLeft: 12,
    marginVertical: 8,
  },
  previewQuoteText: {
    fontStyle: 'italic',
    color: colors.textMuted,
    fontSize: 14,
  },
  previewBlockCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  previewBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewBlockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBlockBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  previewCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  previewCheckText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  previewCheckDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  backlinksContainer: {
    marginTop: 20,
  },
  backlinkCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.card,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  backlinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentYellow,
  },
  backlinkAuthor: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
