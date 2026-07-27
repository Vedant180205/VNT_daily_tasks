# Frontend: Enterprise UX/UI & SaaS Dashboard Engine ????

This is the React/Vite/Tailwind frontend for the Player Management application, completely overhauled for **Day 11** to transform the product into a high-end enterprise sports management platform.

---

## ? Day 11 Highlights & Key Components

### 1. Unified Card Design System (`src/components/ui/Card.tsx`)
Replaced basic scattered table layouts with a robust, modular design system:
* Introduced `<Card>` and `<CardContent>` wrappers globally.
* Applied enterprise styling: soft drop shadows (`shadow-[0_8px_30px_rgba(15,23,42,0.05)]`), sleek border radiuses (`rounded-[18px]`), and high-contrast typography schemas.

### 2. Standardized Data Grids
Every module was overhauled to match the new visual guidelines:
* **Players & Organizers**: Added robust sticky toolbars, global search bars, custom status filters, and universal `<Pagination>`.
* **Enrollments**: Completely refactored the complex dual-action grid into a standardized `<Card>` layout.
* **Activity Logs**: Integrated the standardized backend paginated logs directly into a responsive table structure showing raw MVP performance data.

### 3. Tailwind v4 Architecture
Successfully migrated the platform to **Tailwind CSS v4**:
* Updated `index.css` to use modern `@theme` token definitions and `@config` integrations.
* Resolved deprecated opacity utilities, migrating entire codebases to slash syntax (e.g., `bg-white/70`, `border-white/20`).

### 4. Interactive KPI Dashboard
* Integrated Recharts to provide dynamic line charts mapping player registration trends.
* Refactored static KPI cards with hover-animations and rich gradients.

---

## ?? Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *(The dashboard will be active on `http://localhost:5173`)*

