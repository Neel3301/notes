/**
 * Design system demo and content data
 * All demo content lives here according to project rules.
 */

/**
 * Screen 1: Timeline / Daily Notes content data
 * Reference: design-reference/study-planning.jpg
 */
export const timelineData = {
  header: {
    left: 'menu',
    logo: '.edsy',
  },
  heading: 'Daily\nNotes',
  filterPill: {
    label: 'This week',
    hasChevron: true,
  },
  calendarButton: {
    label: 'Calendar view',
  },
  cards: [
    {
      id: 'sp-blue',
      color: 'blue',
      author: 'Olivia Bennett',
      title: 'The\nScience\nof Nature',
      time: '10:00 am – 11:30 am',
    },
    {
      id: 'sp-light',
      color: 'light',
      author: 'Marcus Levin',
      title: 'Digital\nMedia\n& Society',
      time: '2:45 pm – 4:15 pm',
    },
    {
      id: 'sp-yellow',
      color: 'yellow',
      author: 'Lena Brooks',
      title: 'Intro\nto Frontend\nDevelopment',
      time: '5:00 pm – 6:30 pm',
    },
  ],
  datePager: {
    current: 'Mon. 12',
    next: 'Tue. 13',
  },
};

/** Backward compatibility alias */
export const studyPlanningData = timelineData;

/**
 * Screen 2: Notes Catalog content data
 * Reference: design-reference/course-overview.jpg
 */
export const notesCatalogData = {
  header: {
    left: 'menu',
    logo: '.edsy',
  },
  heading: 'All\nNotes',
  search: {
    placeholder: 'Search notes...',
  },
  cards: [
    {
      id: 'co-yellow',
      color: 'yellow',
      author: 'Lena Brooks',
      title: 'Intro\nto Frontend\nDevelopment',
      liked: false,
    },
    {
      id: 'co-blue',
      color: 'blue',
      author: 'Olivia Bennett',
      title: 'The\nScience\nof Nature',
      liked: true,
    },
    {
      id: 'co-light',
      color: 'light',
      author: 'Marcus Levin',
      title: 'Digital\nMedia\n& Society',
      liked: false,
    },
  ],
};

/** Backward compatibility alias */
export const courseOverviewData = notesCatalogData;

/**
 * Screen 3: Note Editor content data
 * Reference: design-reference/course-detail.jpg
 */
export const noteEditorData = {
  header: {
    left: 'back',
    logo: undefined,
  },
  heading: 'Intro to Frontend\nDevelopment',
  actionButton: {
    label: 'Edit note',
    variant: 'cream',
  },
  tabs: ['Preview', 'Write', 'Canvas'],
  details: {
    notebook: 'Design Systems',
    tags: ['Frontend', 'CSS'],
  },
};

/** Backward compatibility alias */
export const courseDetailData = noteEditorData;

/**
 * Screen 4: Menu overlay content data
 * Reference: design-reference/menu.jpg
 */
export const menuData = {
  header: {
    left: 'close',
    logo: '.edsy',
  },
  items: [
    { id: 'menu-timeline', label: 'Timeline', route: '/timeline', active: false },
    { id: 'menu-notes', label: 'All Notes', route: '/notes', active: true },
    { id: 'menu-editor', label: 'New Note', route: '/editor', active: false },
    { id: 'menu-settings', label: 'Settings', route: '#', active: false },
    { id: 'menu-account', label: 'Account', route: '#', active: false },
  ],
};
