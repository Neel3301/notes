import React, { useState } from 'react';
import { Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Pill from '../components/ui/Pill';
import IconButton from '../components/ui/IconButton';
import CourseCard from '../components/course/CourseCard';
import DatePager from '../components/ui/DatePager';

/**
 * StudyPlanningScreen component
 * Primary dashboard view for scheduled study courses.
 * Features horizontal snap card carousel with peek offset, filter controls,
 * and bottom DatePager navigation strip.
 *
 * All content received via props.
 */
export default function StudyPlanningScreen({
  header = { left: 'menu', logo: '.edsy' },
  heading = 'Study\nPlanning',
  filterPill = { label: 'This week', hasChevron: true },
  calendarButton = { label: 'Calendar view' },
  cards = [],
  datePager = { current: 'Mon. 12', next: 'Tue. 13' },
  onMenuClick,
  onCardClick,
  onFilterClick,
  onCalendarClick,
  onMoreClick,
  onPrevDate,
  onNextDate,
  className = '',
}) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

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

  return (
    <div
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col justify-between select-none ${className}`}
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
        <div className="mt-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill
              label={filterPill.label}
              iconRight={
                filterPill.hasChevron ? <ChevronDown className="w-4 h-4" /> : null
              }
              onClick={onFilterClick}
            />
            <IconButton
              icon={<Calendar className="w-4 h-4" />}
              label={calendarButton.label}
              variant="outlined"
              onClick={onCalendarClick}
            />
          </div>

          <IconButton
            icon={<MoreVertical className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />}
            label="More options"
            variant="plain"
            onClick={onMoreClick}
          />
        </div>

        {/* Horizontal Scroll-Snap Card Carousel */}
        <div className="mt-9 -mx-5 px-5 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
          {cards.map((card) => (
            <div key={card.id} className="snap-start shrink-0">
              <CourseCard
                color={card.color}
                author={card.author}
                title={card.title}
                time={card.time}
                liked={card.liked}
                onClick={() => onCardClick?.(card)}
              />
            </div>
          ))}
          {/* Spacer for right peek margin */}
          <div className="w-2 shrink-0" />
        </div>
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
