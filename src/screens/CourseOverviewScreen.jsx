import React, { useState } from 'react';
import { MoreVertical, Plus, Heart, X, Check } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import SearchPill from '../components/ui/SearchPill';
import IconButton from '../components/ui/IconButton';
import CourseCard from '../components/course/CourseCard';
import { useNotesStore } from '../data/notesStore';

/**
 * CourseOverviewScreen component
 * All Notes Catalog and Live Search Screen.
 * Strictly reproduces design-reference/course-overview.jpg.
 *
 * Features:
 * - Instant full-text live search via SearchPill
 * - Horizontal tag filter pill strip
 * - Full-width vertical stacked cards with alternating colors (blue, light, yellow)
 * - Interactive heart favorite toggling
 */
export default function CourseOverviewScreen({
  header = { left: 'menu', logo: '.edsy' },
  heading = 'All\nNotes',
  search = { placeholder: 'Search notes, tags, ideas...' },
  cards: propCards,
  onMenuClick,
  onCardClick,
  onLikeToggle,
  onMoreClick,
  className = '',
}) {
  const store = useNotesStore();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Available tag filter categories
  const filterTags = ['All', 'Favorites', 'Design', 'Frontend', 'Art', 'Tokens'];

  // Determine source of notes
  const sourceNotes = propCards && propCards.length > 0 ? propCards : store.notes;

  // Filter notes by search query and active tag
  const filteredNotes = sourceNotes.filter((note) => {
    if (note.trashed) return false;

    // Tag filter
    if (selectedTag === 'Favorites') {
      if (!note.liked) return false;
    } else if (selectedTag !== 'All') {
      if (!note.tags || !note.tags.includes(selectedTag)) {
        return false;
      }
    }

    // Search query filter (matches title, author, content, tags)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const titleMatch = note.title && note.title.toLowerCase().includes(q);
      const authorMatch = note.author && note.author.toLowerCase().includes(q);
      const contentMatch = note.content && note.content.toLowerCase().includes(q);
      const blockMatch = note.blocks && note.blocks.some((b) => {
        if (b.content && b.content.toLowerCase().includes(q)) return true;
        if (b.title && b.title.toLowerCase().includes(q)) return true;
        if (Array.isArray(b.items)) {
          return b.items.some((item) => item.text && item.text.toLowerCase().includes(q));
        }
        return false;
      });
      if (!titleMatch && !authorMatch && !contentMatch && !tagMatch && !blockMatch) {
        return false;
      }
    }

    return true;
  });

  const handleLike = (cardId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onLikeToggle) {
      onLikeToggle(cardId, e);
    } else {
      store.toggleLike(cardId);
    }
  };

  const handleQuickCreate = () => {
    const newNote = store.saveNote({
      title: query.trim() ? query.trim() : 'New Note',
      author: 'You',
      notebook: 'Quick Notes',
      color: 'blue',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tags: selectedTag !== 'All' && selectedTag !== 'Favorites' ? [selectedTag] : ['Idea'],
      content: 'Write your thoughts here...',
    });
    setQuery('');
    setShowMoreMenu(false);
    onCardClick?.(newNote);
  };

  return (
    <div
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col justify-between select-none relative ${className}`}
    >
      <div className="flex flex-col">
        {/* App Header */}
        <AppHeader
          left={header.left}
          logo={header.logo}
          onLeftClick={onMenuClick}
        />

        {/* Hero Heading */}
        <div className="mt-8">
          <Heading>{heading}</Heading>
        </div>

        {/* Search & Actions Bar */}
        <div className="mt-7 flex items-center gap-3 relative">
          <div className="flex-1">
            <SearchPill
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={search.placeholder}
              onClear={() => setQuery('')}
            />
          </div>

          <div className="relative">
            <IconButton
              icon={
                <MoreVertical className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
              }
              label="More options"
              variant="plain"
              onClick={() => {
                if (onMoreClick) {
                  onMoreClick();
                } else {
                  setShowMoreMenu((prev) => !prev);
                }
              }}
            />

            {/* Quick Action Dropdown */}
            {showMoreMenu && (
              <div className="absolute top-10 right-0 z-30 bg-[#161616] border border-border-subtle rounded-card py-1.5 shadow-2xl min-w-[150px] flex flex-col">
                <button
                  type="button"
                  onClick={handleQuickCreate}
                  className="px-3.5 py-2 text-label text-left text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTag('Favorites');
                    setShowMoreMenu(false);
                  }}
                  className="px-3.5 py-2 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Show Favorites</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedTag('All');
                    setShowMoreMenu(false);
                  }}
                  className="px-3.5 py-2 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors border-t border-divider/40"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Category / Tag Filter Strip */}
        <div className="mt-4 -mx-5 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {filterTags.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-pill text-label whitespace-nowrap transition-all select-none active:scale-[0.98] ${
                  isActive
                    ? 'bg-cream-bg text-cream-text font-medium border border-cream-bg'
                    : 'bg-transparent text-text-secondary border border-border-subtle hover:text-text-primary'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Vertical Note Cards Catalog */}
        <div className="mt-7 flex flex-col gap-5 pb-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((card) => (
              <div key={card.id} className="w-full">
                <CourseCard
                  color={card.color}
                  author={card.author}
                  title={card.title}
                  time={card.time || card.date}
                  liked={card.liked}
                  fullWidth={true}
                  onLikeToggle={(e) => handleLike(card.id, e)}
                  onClick={() => onCardClick?.(card)}
                />
              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 rounded-card border border-border-subtle/40 bg-divider/20">
              <p className="text-body text-text-secondary font-light">
                No notes found {query ? `for "${query}"` : `in "${selectedTag}"`}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedTag('All');
                  }}
                  className="px-4 py-2 rounded-button border border-border-subtle text-label text-text-primary hover:border-text-secondary transition-colors"
                >
                  Clear filter
                </button>
                <button
                  type="button"
                  onClick={handleQuickCreate}
                  className="px-4 py-2 rounded-button bg-cream-bg text-cream-text text-label font-medium active:scale-[0.98] transition-transform"
                >
                  + Create note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
