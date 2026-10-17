/**
 * Design system demo and content data
 * All demo content lives here according to project rules.
 */

export const tokenColors = [
  { name: 'screen', hex: '#000000', role: 'Screen canvas background', bgClass: 'bg-screen', borderClass: 'border-border-subtle' },
  { name: 'text-primary', hex: '#FFFFFF', role: 'Headings, active text', bgClass: 'bg-text-primary', borderClass: 'border-transparent' },
  { name: 'text-secondary', hex: '#757575', role: 'Subtitles, inactive items', bgClass: 'bg-text-secondary', borderClass: 'border-transparent' },
  { name: 'text-dimmed', hex: '#4B4B4B', role: 'Muted indicators, pagination', bgClass: 'bg-text-dimmed', borderClass: 'border-transparent' },
  { name: 'border-subtle', hex: '#333333', role: 'Pill and search 1px outlines', bgClass: 'bg-border-subtle', borderClass: 'border-transparent' },
  { name: 'divider', hex: '#222222', role: 'Tab and lesson divider rules', bgClass: 'bg-divider', borderClass: 'border-transparent' },
  { name: 'card-blue', hex: '#6F91B6', role: 'Study Planning primary card', bgClass: 'bg-card-blue', borderClass: 'border-transparent' },
  { name: 'card-light', hex: '#DCE3EB', role: 'Study Planning secondary card', bgClass: 'bg-card-light', borderClass: 'border-transparent' },
  { name: 'card-yellow', hex: '#CABC3F', role: 'Course Overview primary card', bgClass: 'bg-card-yellow', borderClass: 'border-transparent' },
  { name: 'cream-bg', hex: '#E5E7DA', role: 'Primary CTA button background', bgClass: 'bg-cream-bg', borderClass: 'border-transparent' },
  { name: 'page', hex: '#DDE3EA', role: 'Desktop shell outer background', bgClass: 'bg-page', borderClass: 'border-transparent' },
];

export const tokenTypography = [
  {
    name: '.text-display',
    specs: '46px / 300 / 1.05 / -0.035em',
    className: 'text-display',
    sample: 'Study\nPlanning',
    colorClass: 'text-text-primary',
  },
  {
    name: '.text-title',
    specs: '30px / 300 / 1.08 / -0.03em',
    className: 'text-title',
    sample: 'The Science of Nature',
    colorClass: 'text-text-primary',
  },
  {
    name: '.text-menu',
    specs: '38px / 300 / 1.12 / -0.03em',
    className: 'text-menu',
    sample: 'Dashboard / Courses / Planning',
    colorClass: 'text-text-primary',
  },
  {
    name: '.text-body',
    specs: '14px / 400 / 1.45 / 0em',
    className: 'text-body',
    sample: 'Understand the role of frontend in web development and how it interacts with backend systems.',
    colorClass: 'text-text-secondary',
  },
  {
    name: '.text-label',
    specs: '12px / 400 / 1.25 / 0.01em',
    className: 'text-label',
    sample: 'Olivia Bennett • 10:00 am - 11:30 am',
    colorClass: 'text-text-secondary',
  },
];

export const tokenShapes = {
  card: {
    specs: 'rounded-card (8px), bg-card-blue, flat, no shadows',
    author: 'Olivia Bennett',
    title: 'The\nScience\nof Nature',
    time: '10:00 am – 11:30 am',
  },
  pill: {
    specs: 'rounded-pill (9999px), border 1px border-subtle, transparent bg',
    label: 'This week',
  },
  circleButton: {
    specs: 'rounded-circle (9999px), border 1px border-subtle, 38px circle',
    label: 'Calendar icon button',
  },
  creamButton: {
    specs: 'rounded-button (8px), bg-cream-bg, text-cream-text',
    label: 'Start course',
  },
};

export const headerDemoData = {
  title: 'Component Showcase: AppHeader',
  subtitle: 'All 3 header variants rendered on black canvas with 390px mobile viewport.',
  variants: [
    {
      id: 'menu',
      name: 'Variant 1: Menu Header',
      role: 'Study Planning & Course Overview screens',
      left: 'menu',
      logo: '.edsy',
    },
    {
      id: 'close',
      name: 'Variant 2: Close Header',
      role: 'Menu overlay screen',
      left: 'close',
      logo: '.edsy',
    },
    {
      id: 'back',
      name: 'Variant 3: Back Header',
      role: 'Course Detail screen',
      left: 'back',
      logo: undefined,
    },
  ],
};

export const uiComponentsDemoData = {
  pills: [
    { id: 'p1', label: 'This week', hasChevron: true },
    { id: 'p2', label: 'All Courses', hasChevron: false },
  ],
  iconButtons: [
    { id: 'ib1', name: 'IconButton (outlined)', variant: 'outlined', icon: 'Calendar', label: 'Calendar action' },
    { id: 'ib2', name: 'IconButton (plain)', variant: 'plain', icon: 'MoreVertical', label: 'More options' },
  ],
  buttons: [
    { id: 'btn1', label: 'Start course', variant: 'cream' },
    { id: 'btn2', label: 'Outline Action', variant: 'outline' },
  ],
  headings: [
    { id: 'h1', text: 'Study\nPlanning', label: 'Multi-line Hero Display' },
    { id: 'h2', text: 'Course\nOverview', label: 'Screen Header' },
  ],
  courseCards: [
    {
      id: 'cc1',
      color: 'blue',
      author: 'Olivia Bennett',
      title: 'The\nScience\nof Nature',
      time: '10:00 am – 11:30 am',
      liked: undefined,
    },
    {
      id: 'cc2',
      color: 'light',
      author: 'Marcus Levin',
      title: 'Digital\nMedia\n& Society',
      time: '2:45 pm – 4:15 pm',
      liked: undefined,
    },
    {
      id: 'cc3',
      color: 'yellow',
      author: 'Lena Brooks',
      title: 'Intro\nto Frontend\nDevelopment',
      time: undefined,
      liked: false,
    },
  ],
  datePager: {
    current: 'Mon. 12',
    next: 'Tue. 13',
  },
  searchPill: {
    placeholder: 'Course title',
  },
  tabs: ['Preview', 'Details'],
  lessons: [
    {
      id: 'l1',
      number: '01',
      title: 'What is Frontend?',
      description: 'Understand the role of frontend in web development and how it interacts with backend systems.',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      isOpen: true,
    },
    {
      id: 'l2',
      number: '02',
      title: 'Box Model & Positioning',
      description: 'Master margins, borders, padding, and the document layout flow.',
      isOpen: false,
    },
    {
      id: 'l3',
      number: '03',
      title: 'Flexbox & Grid Layouts',
      description: 'Build modern responsive layouts using 1D flexbox and 2D css grids.',
      isOpen: false,
    },
  ],
  menuItems: [
    { id: 'm1', label: 'Dashboard', active: false },
    { id: 'm2', label: 'Courses', active: true },
    { id: 'm3', label: 'Planning', active: false },
    { id: 'm4', label: 'Settings', active: false },
    { id: 'm5', label: 'Account', active: false },
  ],
};

/**
 * Screen 1: Study Planning content data
 * Reference: design-reference/study-planning.jpg
 */
export const studyPlanningData = {
  header: {
    left: 'menu',
    logo: '.edsy',
  },
  heading: 'Study\nPlanning',
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

/**
 * Screen 2: Course Overview content data
 * Reference: design-reference/course-overview.jpg
 */
export const courseOverviewData = {
  header: {
    left: 'menu',
    logo: '.edsy',
  },
  heading: 'Course\nOverview',
  search: {
    placeholder: 'Course title',
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

/**
 * Screen 3: Course Detail content data
 * Reference: design-reference/course-detail.jpg
 */
export const courseDetailData = {
  header: {
    left: 'back',
    logo: undefined,
  },
  heading: 'Intro to Frontend\nDevelopment',
  actionButton: {
    label: 'Start course',
    variant: 'cream',
  },
  tabs: ['Preview', 'Details'],
  previewLessons: [
    {
      id: 'cd-lesson-1',
      number: '01',
      title: 'What is Frontend?',
      description:
        'Understand the role of frontend in web development and how it interacts with backend systems.',
      thumbnail:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      isOpen: true,
    },
    {
      id: 'cd-lesson-2',
      number: '02',
      title: 'Box Model & Positioning',
      description:
        'Master margin, padding, border, flexbox alignment, and document flow positioning.',
      thumbnail:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      isOpen: false,
    },
    {
      id: 'cd-lesson-3',
      number: '03',
      title: 'Flexbox & Grid Layouts',
      description:
        'Learn 1-dimensional flexbox and 2-dimensional CSS grid systems for responsive web designs.',
      thumbnail:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      isOpen: false,
    },
  ],
  details: {
    description:
      'This comprehensive course covers modern frontend web development from foundational HTML/CSS architecture to reactive component states. Designed for beginners and intermediate engineers seeking visual excellence.',
    instructor: {
      name: 'Lena Brooks',
      role: 'Principal Design Technologist',
    },
    stats: [
      { label: 'Modules', value: '3 Lessons' },
      { label: 'Duration', value: '3.5 Hours' },
      { label: 'Level', value: 'Beginner' },
    ],
  },
};

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
    { id: 'menu-dash', label: 'Dashboard', route: '/', active: false },
    { id: 'menu-courses', label: 'Courses', route: '/course-overview', active: true },
    { id: 'menu-planning', label: 'Planning', route: '/study-planning', active: false },
    { id: 'menu-settings', label: 'Settings', route: '#', active: false },
    { id: 'menu-account', label: 'Account', route: '#', active: false },
  ],
};
