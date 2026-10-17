# Edsy Mobile UI Kit — Design Specification

This specification documents the visual system, typography, colors, layout metrics, component inventory, and interactions extracted from the reference screens in `/design-reference` (`all.webp`, `study-planning.jpg`, `course-overview.jpg`, `course-detail.jpg`, `menu.jpg`). All dimensions and metrics assume a standard mobile viewport width of **390px**.

---

## 1. COLORS

Every distinct color extracted directly from the reference assets with its semantic role:

| Role | Hex Value | Description & Usage |
| :--- | :--- | :--- |
| **Page Background** | `#DDE3EA` | Light grey-blue surrounding desktop viewport shell |
| **Screen Background** | `#000000` | Pure deep black canvas for all mobile screens |
| **Primary Text** | `#FFFFFF` | Pure white for headers, active tabs, titles, primary labels |
| **Secondary / Muted Text** | `#757575` | Medium muted neutral grey for inactive menu items, subtitles, placeholders, inactive tabs |
| **Tertiary / Dimmed Text** | `#4B4B4B` (estimate) | Subtle grey for inactive pagination arrows and minor indicators |
| **Border / Outline** | `#333333` | 1px outline for pill controls, calendar button, search pill |
| **Divider Line** | `#222222` | 1px horizontal rule separating tabs and lesson list rows |
| **Card Blue (Primary)** | `#6F91B6` | Desaturated slate / denim blue card on Study Planning |
| **Card Light (Secondary)** | `#DCE3EB` | Soft pale ice-blue / cool off-white card on Study Planning |
| **Card Yellow / Olive** | `#CABC3F` | Warm earthy mustard / olive yellow card on Course Overview |
| **Card Dark Text** | `#111111` | Pure dark charcoal / black text inside colored cards for high legibility |
| **Cream Button Background** | `#E5E7DA` | Soft warm cream / off-white background for "Start course" CTA |
| **Cream Button Text** | `#111111` | Dark near-black text on cream button |
| **Media Overlay** | `rgba(0,0,0,0.45)` (estimate) | Dark translucent scrim over video preview thumbnail |

---

## 2. TYPOGRAPHY

Target typeface: **Inter Tight** (Google Font). Proportions calibrated for a **390px** wide mobile viewport.

| Text Style | Font Size (px) | Weight | Line Height | Letter Spacing | Color | Notes / Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Logo** (`.edsy`) | 14px (estimate) | 400 (Regular) | 1.1 | -0.01em | `#FFFFFF` | Lowercase brand mark in top right header |
| **Screen Title** | 46px (estimate) | 300 (Light) | 1.05 | -0.035em | `#FFFFFF` | Multi-line hero headers ("Study\nPlanning", "Course\nOverview") |
| **Detail Screen Title** | 32px (estimate) | 300 (Light) | 1.10 | -0.03em | `#FFFFFF` | Multi-line header on Course Detail ("Intro to Frontend\nDevelopment") |
| **Menu Item (Active)** | 42px (estimate) | 300 (Light) | 1.10 | -0.03em | `#FFFFFF` | "Courses" with diagonal arrow icon |
| **Menu Item (Inactive)** | 36px (estimate) | 300 (Light) | 1.15 | -0.025em | `#757575` | "Dashboard", "Planning", "Settings", "Account" |
| **Card Title (Large)** | 30px (estimate) | 300 (Light) | 1.08 | -0.03em | `#111111` | "The\nScience\nof Nature", "Intro\nto Frontend\nDevelopment" |
| **Card Subtitle / Author** | 13px (estimate) | 400 (Regular) | 1.30 | 0.00em | `#111111` | "Olivia Bennett", "Lena Brooks" |
| **Card Timestamp / Meta** | 12px (estimate) | 400 (Regular) | 1.30 | 0.00em | `#111111` | "10:00 am – 11:30 am", "2:45 pm – ..." |
| **Pill / Control Label** | 13px (estimate) | 400 (Regular) | 1.20 | 0.00em | `#FFFFFF` | "This week" inside pill selector |
| **Search Placeholder** | 14px (estimate) | 400 (Regular) | 1.20 | 0.00em | `#757575` | "Course title" inside SearchPill |
| **Primary CTA Button** | 14px (estimate) | 500 (Medium) | 1.20 | -0.01em | `#111111` | "Start course" inside cream button |
| **Active Tab** | 14px (estimate) | 500 (Medium) | 1.20 | -0.01em | `#FFFFFF` | "Preview" tab on Course Detail |
| **Inactive Tab** | 14px (estimate) | 400 (Regular) | 1.20 | -0.01em | `#757575` | "Details" tab on Course Detail |
| **Lesson Index Number** | 14px (estimate) | 400 (Regular) | 1.20 | 0.00em | `#757575` | "01", "02", "03" in lesson list |
| **Lesson Title** | 15px (estimate) | 400 (Regular) | 1.25 | -0.01em | `#FFFFFF` | "What is Frontend?", "Box Model & Positioning" |
| **Lesson Description Body** | 13px (estimate) | 300 (Light) | 1.45 | 0.00em | `#8E8E93` | Explanatory copy below active lesson title |
| **Date Pager (Active)** | 14px (estimate) | 500 (Medium) | 1.20 | 0.00em | `#FFFFFF` | "Mon. 12" in bottom date strip |
| **Date Pager (Inactive)** | 14px (estimate) | 400 (Regular) | 1.20 | 0.00em | `#757575` | "Tue. 13" in bottom date strip |

---

## 3. FONT: TOP 3 CLOSEST GOOGLE FONTS

1. **Inter Tight** *(Selected & Configured)*
   - **Why**: Designed explicitly by Rasmus Andersson as a condensed companion to Inter for tight editorial display and mobile headers. Features razor-sharp light weights (300) that match the reference’s delicate, non-geometric grotesk strokes, tall x-height, neutral modern letterforms, and negative default tracking tailored for compact mobile viewports.
2. **Plus Jakarta Sans**
   - **Why**: An elegant, contemporary grotesk with geometric clean lines and slightly sculpted counters. Its 300 and 400 weights render exceptionally crisp on dark backgrounds, offering near-identical character metrics for headings when set with tight tracking (`tracking-tight`).
3. **DM Sans**
   - **Why**: Low-contrast geometric neo-grotesque with clean circular forms and simplified modern terminals. Produces a very clean, Scandinavian aesthetic comparable to the minimalist feel of `.edsy`, though slightly wider in default character widths than Inter Tight.

---

## 4. SPACING & METRICS

Based on a **390px** mobile canvas:

- **Screen Horizontal Margin / Padding**: `20px` (estimate, `px-5`) to `24px` (`px-6`).
- **Screen Top Padding (Status bar / safe area to Header)**: `24px` (estimate, `pt-6`).
- **Header Height**: `32px` (estimate).
- **Gap between Header and Screen Title**: `36px` (estimate, `mt-9`).
- **Gap between Screen Title and Controls Row**: `24px` (estimate, `mt-6`).
- **Controls Row Height**: `38px` (estimate).
- **Gap between Controls Row and Card Section**: `28px` (estimate, `mt-7`).
- **Card Dimensions**:
  - Carousel Card Width: `245px` (estimate, ~63% of 390px viewport, leaving peeking space for next card).
  - Carousel Card Height: `320px` (estimate).
  - Single Full Card Width (Course Overview): `342px` (estimate, `w-full` minus margins).
- **Card Padding**: `22px` (estimate, `p-[22px]`).
- **Card Gap (Horizontal Carousel)**: `16px` (estimate, `gap-4`).
- **Gap between Card Section and Bottom Date Pager**: `36px` (estimate, `mt-9`).
- **Date Pager Row Height**: `32px` (estimate).
- **Gap between Screen Title and Primary Button (Detail Screen)**: `24px` (estimate).
- **Gap between Primary Button and Tabs (Detail Screen)**: `28px` (estimate).
- **Gap between Tabs and Divider Line**: `14px` (estimate).
- **Lesson List Row Padding**: `16px` vertical (estimate, `py-4`), `0px` horizontal (spans content width).
- **Gap between Lesson Number and Title**: `16px` (estimate).
- **Gap between Lesson Title and Video Preview**: `14px` (estimate).
- **Menu Items Vertical Gap**: `18px` (estimate, `gap-[18px]`).

---

## 5. SHAPES & BORDERS

- **Cards**:
  - Border radius: `8px` (`rounded-lg` / `rounded-[8px]`).
  - Border: None (`0px`, completely flat).
  - Shadow: None (`shadow-none`, no drop shadows or elevations).
- **Outlined Pills & Buttons**:
  - Border radius: Fully rounded `9999px` (`rounded-full`).
  - Border width: `1px`.
  - Border color: `#333333` (subtle dark grey).
  - Background: Transparent (`bg-transparent`).
- **Primary Action Button ("Start course")**:
  - Border radius: `8px` (`rounded-lg` / `rounded-[8px]`).
  - Border: None (`0px`).
  - Background: `#E5E7DA` (Cream).
  - Padding: `10px 22px` (estimate).
- **Divider Rules**:
  - Height: `1px`.
  - Color: `#222222` (subtle dark divider).
- **Video Preview Thumbnail**:
  - Border radius: `8px` (`rounded-lg`).
  - Aspect ratio: `16:9` (estimate).
  - Overlay: Soft dark vignette with a white circular play icon button (~36px diameter).

---

## 6. COMPONENT INVENTORY & SCREEN MAPPING

| Component | Description | Screens Used |
| :--- | :--- | :--- |
| **`PhoneShell`** | Centered 390px mobile viewport container with black canvas on `#DDE3EA` background | All Screens |
| **`AppHeader`** | Top navigation bar with left action (Menu icon / Back chevron / Close icon) and right `.edsy` brandmark | All Screens |
| **`ScreenTitle`** | Ultra-clean large title block with light weight (300) and tight leading | Study Planning, Course Overview, Course Detail |
| **`PillButton`** | 1px outlined pill button for dropdown filters or contextual actions (e.g. "This week" + chevron) | Study Planning |
| **`IconButton`** | 1px outlined circular/pill button housing standalone icons (Calendar icon, More vertical dots) | Study Planning, Course Overview |
| **`SearchPill`** | 1px outlined pill input containing magnifying search icon and placeholder text | Course Overview |
| **`CourseCard`** | Reusable 8px rounded flat colored card displaying author, large title, and footer meta/heart icon | Study Planning, Course Overview |
| **`CardCarousel`** | Horizontal scroll container with peek offset and snap alignment | Study Planning, Course Overview |
| **`DatePager`** | Bottom date navigation strip with chevron arrows (`<`, `>`), active date ("Mon. 12"), and adjacent date ("Tue. 13") | Study Planning |
| **`PrimaryButton`** | Cream-colored compact CTA button with dark text and 8px border radius | Course Detail |
| **`TabNav`** | Segmented text tab switcher ("Preview" / "Details") with hairline bottom divider | Course Detail |
| **`LessonRow`** | Expandable/collapsible lesson row displaying index ("01"), title, description, and nested video preview | Course Detail |
| **`VideoPlayerCard`** | 16:9 media thumbnail card with play button icon overlay | Course Detail |
| **`MenuOverlay`** | Full-screen modal navigation overlay with staggered typographic menu items and diagonal arrow indicator | Menu |

---

## 7. INFERRED INTERACTIONS & STATE FLOWS

1. **Menu Navigation Transition (Open / Close)**:
   - Tapping the two-line hamburger icon in `AppHeader` triggers the full-screen `MenuOverlay`.
   - The menu appears with a smooth slide-in or fade transition against the black background.
   - Tapping the "X" close icon returns to the previous screen.
2. **Horizontal Card Carousel Swiping**:
   - On `Study Planning`, users swipe horizontally through scheduled courses.
   - Cards snap into primary focus (`snap-x snap-mandatory`), with the secondary card peeking from the right edge.
3. **Course Selection & Detail Navigation**:
   - Tapping a course card on `Course Overview` navigates to `Course Detail`.
   - Tapping the back chevron (`<`) on `Course Detail` transitions back to `Course Overview`.
4. **Tab Switching**:
   - Tapping "Preview" displays the video lesson outline; tapping "Details" switches to course syllabus/metadata without page reload.
5. **Lesson Accordion / Media Preview**:
   - Tapping a collapsed lesson row (e.g., "02 Box Model & Positioning") expands its description and video preview while collapsing active lesson "01".
6. **Date Pager Stepping**:
   - Tapping left/right chevrons or tapping the next date ("Tue. 13") shifts the active calendar date and filters the carousel cards.
