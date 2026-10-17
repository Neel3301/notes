# Edsy Mobile Design Template

A mobile application template for course and study planning, built with **React**, **Tailwind CSS v4**, **Framer Motion**, and **Lucide Icons**, implementing the `.edsy` mobile design system.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Navigate to project directory
cd design-1

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will launch on `http://localhost:5173/`.

---

## 📱 Routes & Screens

| Route | Screen | Description |
| :--- | :--- | :--- |
| `/` or `/study-planning` | **Study Planning** | Home view: scheduled courses with horizontal snap card carousel and bottom `DatePager` |
| `/course-overview` | **Course Overview** | Course catalog with working `SearchPill` input and featured course cards |
| `/course-detail` | **Course Detail** | Detailed course outline with interactive `Tabs` ("Preview" / "Details"), cream CTA button, and video lesson previews |
| `/menu` | **Menu Overlay** | Full-screen modal overlay with Framer Motion slide-up animation and typographic routes |
| `/tokens` | **Design Tokens** | Complete design system token showcase (colors, typography, shapes) |
| `/components` | **Component Showcase** | Interactive preview of every individual UI and layout component |

---

## 📝 How to Customize Content

All application copy and data lives in a single source of truth:
👉 [`src/data/content.js`](file:///d:/Mobile%20Designs/design-1/src/data/content.js)

To update content:
1. Open `src/data/content.js`.
2. Edit the corresponding screen export object:
   - `studyPlanningData`: Scheduled course cards, dates, header.
   - `courseOverviewData`: Search placeholder, course cards catalog.
   - `courseDetailData`: Course title, lessons, descriptions, syllabus stats, instructor info.
   - `menuData`: Navigation menu items and target routes.
3. Changes will automatically update across all screens via HMR without modifying component templates.

---

## 🎨 Theme System

The design defaults to the high-contrast dark aesthetic (`#000000`). A clean light theme is built-in and switchable from:
👉 [`src/theme.js`](file:///d:/Mobile%20Designs/design-1/src/theme.js)

### Switching Themes Programmatically or Statically

```javascript
import { setTheme, toggleTheme, THEMES } from './theme';

// Switch to Light Theme:
setTheme(THEMES.LIGHT);

// Switch to Dark Theme:
setTheme(THEMES.DARK);

// Toggle between themes:
toggleTheme();
```

---

## 🧩 Component & Props Reference

| Component | Path | Key Props | Description |
| :--- | :--- | :--- | :--- |
| **`PhoneShell`** | `src/components/layout/PhoneShell.jsx` | `children` | Centered 390px mobile container with pure black canvas on `#DDE3EA` desktop background |
| **`AppHeader`** | `src/components/layout/AppHeader.jsx` | `left` ('menu' \| 'back' \| 'close'), `logo` (string), `onLeftClick` (fn) | Top navigation header with two-line menu, close, or back chevron |
| **`Heading`** | `src/components/ui/Heading.jsx` | `children`, `className` | Display heading using `.text-display` (46px, 300 weight, -0.035em tracking, preserves line breaks) |
| **`Pill`** | `src/components/ui/Pill.jsx` | `label`, `icon`, `iconRight`, `onClick` | Outlined pill container with 1px border and 9999px border radius |
| **`IconButton`** | `src/components/ui/IconButton.jsx` | `icon`, `label`, `variant` ('outlined' \| 'plain'), `onClick` | Circular 1px outlined button or plain icon button |
| **`Button`** | `src/components/ui/Button.jsx` | `children`, `variant` ('cream' \| 'outline'), `icon`, `iconRight`, `onClick` | Signature CTA button with cream background (`#E5E7DA`) and 8px border radius |
| **`SearchPill`** | `src/components/ui/SearchPill.jsx` | `value`, `onChange`, `placeholder`, `onClear` | Outlined pill search input with magnifying search icon |
| **`DatePager`** | `src/components/ui/DatePager.jsx` | `current`, `next`, `onPrev`, `onNext` | Bottom date navigation strip with chevrons and adjacent date indicators |
| **`CourseCard`** | `src/components/course/CourseCard.jsx` | `color` ('blue' \| 'light' \| 'yellow'), `author`, `title`, `time`, `liked`, `fullWidth`, `onLikeToggle`, `onClick` | Flat colored card (8px radius, no drop shadow) |
| **`Tabs`** | `src/components/ui/Tabs.jsx` | `items`, `active`, `onChange` | Segmented tab switcher with hairline bottom border rule |
| **`LessonRow`** | `src/components/course/LessonRow.jsx` | `number`, `title`, `description`, `thumbnail`, `isOpen`, `onToggle`, `showDivider` | Expandable accordion row with video preview thumbnail overlay |
| **`MenuItem`** | `src/components/ui/MenuItem.jsx` | `label`, `active`, `onClick` | Large `.text-menu` navigation item (38px / 300) with diagonal arrow indicator |

---

## ➕ Adding a New Screen

1. **Create the screen component** in `src/screens/YourScreen.jsx`:
   ```jsx
   import React from 'react';
   import AppHeader from '../components/layout/AppHeader';

   export default function YourScreen({ title, onMenuClick }) {
     return (
       <div className="w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col">
         <AppHeader left="menu" logo=".edsy" onLeftClick={onMenuClick} />
         <h1 className="text-display mt-8">{title}</h1>
       </div>
     );
   }
   ```
2. **Add demo content** in `src/data/content.js`:
   ```javascript
   export const yourScreenData = {
     title: 'New Screen Title',
   };
   ```
3. **Register Route** in `src/App.jsx`:
   ```jsx
   <Route
     path="/your-screen"
     element={<YourScreen title={yourScreenData.title} onMenuClick={() => navigate('/menu')} />}
   />
   ```
4. **Link in Menu**: Add `{ id: 'menu-your-screen', label: 'Your Screen', route: '/your-screen' }` to `menuData.items` in `src/data/content.js`.
