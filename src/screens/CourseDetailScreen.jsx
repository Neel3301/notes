import React, { useState } from 'react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import LessonRow from '../components/course/LessonRow';

/**
 * CourseDetailScreen component
 * Detailed syllabus and preview player screen.
 * Features cream primary action button, interactive tab switching,
 * and expandable lesson accordion with video preview.
 *
 * All content received via props according to project rules.
 */
export default function CourseDetailScreen({
  header = { left: 'back', logo: undefined },
  heading = 'Intro to Frontend\nDevelopment',
  actionButton = { label: 'Start course', variant: 'cream' },
  tabs = ['Preview', 'Details'],
  previewLessons = [],
  details = {},
  onBackClick,
  onStartCourse,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(tabs[0] || 'Preview');
  const [openLessonId, setOpenLessonId] = useState(
    previewLessons.find((l) => l.isOpen)?.id || previewLessons[0]?.id || 'cd-lesson-1'
  );

  const toggleLesson = (id) => {
    setOpenLessonId((prev) => (prev === id ? null : id));
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
          onLeftClick={onBackClick}
        />

        {/* Hero Title */}
        <div className="mt-8">
          <Heading>{heading}</Heading>
        </div>

        {/* Start Course CTA Button */}
        <div className="mt-7 flex items-center">
          <Button
            variant={actionButton.variant || 'cream'}
            onClick={onStartCourse}
          >
            {actionButton.label}
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8">
          <Tabs
            items={tabs}
            active={activeTab}
            onChange={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'Preview' || activeTab === tabs[0] ? (
            /* Preview Lessons List */
            <div className="flex flex-col">
              {previewLessons.map((lesson, idx) => (
                <LessonRow
                  key={lesson.id || idx}
                  number={lesson.number}
                  title={lesson.title}
                  description={lesson.description}
                  thumbnail={lesson.thumbnail}
                  isOpen={openLessonId === lesson.id}
                  onToggle={() => toggleLesson(lesson.id)}
                  showDivider={idx < previewLessons.length - 1}
                />
              ))}
            </div>
          ) : (
            /* Details Tab */
            <div className="flex flex-col gap-6 py-4 animate-fadeIn">
              {details.description && (
                <div>
                  <h3 className="text-body font-medium text-text-primary mb-2">
                    About this course
                  </h3>
                  <p className="text-body text-text-secondary leading-relaxed">
                    {details.description}
                  </p>
                </div>
              )}

              {details.stats && (
                <div className="grid grid-cols-3 gap-3 p-4 rounded-card bg-divider/30 border border-border-subtle/40">
                  {details.stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <span className="text-label text-text-secondary">
                        {stat.label}
                      </span>
                      <span className="text-body font-medium text-text-primary mt-0.5">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {details.instructor && (
                <div className="border-t border-divider pt-4 flex flex-col gap-1">
                  <span className="text-label text-text-secondary">Instructor</span>
                  <span className="text-body font-medium text-text-primary">
                    {details.instructor.name}
                  </span>
                  <span className="text-label text-text-secondary">
                    {details.instructor.role}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
