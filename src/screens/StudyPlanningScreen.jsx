import React, { useState } from 'react';
import { Calendar, ChevronDown, MoreVertical, Plus, Check, RefreshCw } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Pill from '../components/ui/Pill';
import IconButton from '../components/ui/IconButton';
import CourseCard from '../components/course/CourseCard';
import DatePager from '../components/ui/DatePager';
import { useNotesStore } from '../data/notesStore';

/**
 * StudyPlanningScreen component
 * Primary dashboard view for scheduled notes and daily timeline.
 * Features horizontal snap card carousel with peek offset, filter controls,
 * and bottom DatePager navigation strip.
 * Strictly adheres to design-reference/study-planning.jpg.
 */
export default function StudyPlanningScreen({
  header = { left: 'menu', logo: '.edsy' },
  heading = 'Daily\nNotes',
  filterPill = { label: 'This week', hasChevron: true },
  calendarButton = { label: 'Calendar view' },
  cards: propCards,
  datePager,
  onMenuClick,
  onCardClick,
  onFilterClick,
  onCalendarClick,
  onMoreClick,
  onLikeToggle,
  onPrevDate,
  onNextDate,
  className = '',
}) {
  const store = useNotesStore();
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [filterMode, setFilterMode] = useState(filterPill.label || 'This week');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const dates = [
    { current: 'Mon. 12', next: 'Tue. 13' },
    { current: 'Tue. 13', next: 'Wed. 14' },
    { current: 'Wed. 14', next: 'Thu. 15' },
    { current: 'Thu. 15', next: 'Fri. 16' },
  ];

  const activeDate = datePager || dates[currentDateIndex];

  const handlePrev = () => {
    if (onPrevDate) {
      onPrevDate();
    } else {
      setCurrentDateIndex((prev) => (prev > 0 ? prev - 1 : dates.length - 1));
    }
  };

  const handleNext = () => {
    if (onNextDate) {
      onNextDate();
    } else {
      setCurrentDateIndex((prev) => (prev < dates.length - 1 ? prev + 1 : 0));
    }
  };

  // Determine active pool of notes
  const sourceCards = propCards && propCards.length > 0 ? propCards : store.notes;

  // Filter notes based on active filter pill and date
  const filteredCards = sourceCards.filter((card) => {
    if (card.trashed) return false;

    if (filterMode === 'Today') {
      return card.date === activeDate.current;
    }

    if (filterMode === 'This week') {
      // Show notes belonging to active weekdays
      const weekDates = ['Mon. 12', 'Tue. 13', 'Wed. 14', 'Thu. 15', 'Fri. 16'];
      return weekDates.includes(card.date) || card.pinned;
    }

    // 'All notes'
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
      title: 'New Quick Note',
      author: 'You',
      notebook: 'Quick Notes',
      color: 'blue',
      date: activeDate.current,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tags: ['Idea'],
      content: 'Write your thoughts here...',
    });
    setShowMoreMenu(false);
    onCardClick?.(newNote);
  };

  const filterOptions = ['This week', 'Today', 'All notes'];

  return (
    <div
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col justify-between select-none relative ${className}`}
    >
      {/* Top Section */}
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

        {/* Action / Filter Bar */}
        <div className="mt-7 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Pill
                label={filterMode}
                iconRight={
                  filterPill.hasChevron ? <ChevronDown className="w-4 h-4" /> : null
                }
                onClick={() => {
                  if (onFilterClick) {
                    onFilterClick();
                  } else {
                    setShowFilterMenu((prev) => !prev);
                  }
                }}
              />

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div className="absolute top-10 left-0 z-30 bg-[#161616] border border-border-subtle rounded-card py-1.5 shadow-2xl min-w-[130px] flex flex-col">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFilterMode(opt);
                        setShowFilterMenu(false);
                      }}
                      className={`px-3.5 py-2 text-label text-left flex items-center justify-between hover:bg-divider/50 transition-colors ${
                        filterMode === opt ? 'text-text-primary font-medium' : 'text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {filterMode === opt && <Check className="w-3.5 h-3.5 text-cream-bg" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <IconButton
              icon={<Calendar className="w-4 h-4" />}
              label={calendarButton.label}
              variant="outlined"
              onClick={() => {
                if (onCalendarClick) {
                  onCalendarClick();
                } else {
                  // Jump to Mon. 12 (today)
                  setCurrentDateIndex(0);
                  setFilterMode('Today');
                }
              }}
            />
          </div>

          <div className="relative">
            <IconButton
              icon={<MoreVertical className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />}
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

            {/* Quick Action Popup Menu */}
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
                    store.resetToSeed();
                    setShowMoreMenu(false);
                  }}
                  className="px-3.5 py-2 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors border-t border-divider/40"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Sample Notes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Scroll-Snap Card Carousel */}
        {filteredCards.length > 0 ? (
          <div className="mt-9 -mx-5 px-5 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
            {filteredCards.map((card) => (
              <div key={card.id} className="snap-start shrink-0">
                <CourseCard
                  color={card.color}
                  author={card.author}
                  title={card.title}
                  time={card.time}
                  liked={card.liked}
                  onLikeToggle={(e) => handleLike(card.id, e)}
                  onClick={() => onCardClick?.(card)}
                />
              </div>
            ))}
            {/* Spacer for right peek margin */}
            <div className="w-2 shrink-0" />
          </div>
        ) : (
          <div className="mt-9 w-full h-[320px] rounded-card border border-border-subtle/50 bg-divider/20 flex flex-col items-center justify-center text-center p-6">
            <p className="text-body text-text-secondary font-light">
              No notes for {activeDate.current}
            </p>
            <button
              type="button"
              onClick={handleQuickCreate}
              className="mt-4 px-5 py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium active:scale-[0.98] transition-transform"
            >
              + Create note
            </button>
          </div>
        )}
      </div>

      {/* Bottom Date Navigation Strip */}
      <div className="mt-8 flex justify-center items-center w-full">
        <DatePager
          current={activeDate.current}
          next={activeDate.next}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
