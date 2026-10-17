import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import SearchPill from '../components/ui/SearchPill';
import IconButton from '../components/ui/IconButton';
import CourseCard from '../components/course/CourseCard';

/**
 * CourseOverviewScreen component
 * Course catalog and search screen.
 * Features search input with clear action, options button, and course cards.
 *
 * All content received via props according to project rules.
 */
export default function CourseOverviewScreen({
  header = { left: 'menu', logo: '.edsy' },
  heading = 'Course\nOverview',
  search = { placeholder: 'Course title' },
  cards = [],
  onMenuClick,
  onCardClick,
  onLikeToggle,
  onMoreClick,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [likes, setLikes] = useState({});

  const filteredCards = cards.filter((card) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = card.title.toLowerCase().includes(q);
    const authorMatch = card.author?.toLowerCase().includes(q);
    return titleMatch || authorMatch;
  });

  const handleLike = (cardId, e) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [cardId]: prev[cardId] !== undefined ? !prev[cardId] : true,
    }));
    onLikeToggle?.(cardId);
  };

  return (
    <div
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col justify-between select-none ${className}`}
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
        <div className="mt-7 flex items-center gap-3">
          <div className="flex-1">
            <SearchPill
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={search.placeholder}
              onClear={() => setQuery('')}
            />
          </div>

          <IconButton
            icon={
              <MoreVertical className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
            }
            label="More options"
            variant="plain"
            onClick={onMoreClick}
          />
        </div>

        {/* Course Cards Catalog */}
        <div className="mt-8 flex flex-col gap-5">
          {filteredCards.length > 0 ? (
            filteredCards.map((card, idx) => {
              const isLiked =
                likes[card.id] !== undefined ? likes[card.id] : card.liked;

              return (
                <div key={card.id} className="w-full">
                  <CourseCard
                    color={card.color}
                    author={card.author}
                    title={card.title}
                    time={card.time}
                    liked={isLiked}
                    fullWidth={true}
                    onLikeToggle={(e) => handleLike(card.id, e)}
                    onClick={() => onCardClick?.(card)}
                  />
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <p className="text-body text-text-secondary">
                No courses matching "{query}"
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 text-label text-cream-bg underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
