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
};
