# PlayerHub Frontend

The React/Vite frontend for the PlayerHub application.

## Technologies Used
- React (Vite)
- TypeScript
- Tailwind CSS (Styling)
- React Query (Data Fetching & State)
- React Hook Form + Zod (Form Validation)
- Lucide React (Icons)
- Framer Motion (Animations)

## Day 13: UI/UX Enhancements & Integrations
During Day 13, several critical updates were made to the frontend architecture:
- **Instant Autocomplete Search**: Rebuilt the `SearchBar.tsx` to connect to the backend Redis Sorted Set via `GET /api/players/autocomplete`, featuring a 180ms debounce and responsive dropdown UI.
- **Form Validation (Pre-Submit)**: Enhanced `PlayerForm.tsx` and `ImageUploader.tsx` to enforce strict "Avatar Required" rules before API submission, showing clear error states visually.
- **Backend Error Mapping**: Fixed a critical bug in `useMutations.ts` so that actual backend error strings (e.g. `400 Bad Request` or `429 Too Many Requests` from Idempotency locks) are passed into Toast notifications rather than being swallowed.
- **Player Details Dialog**: Created `PlayerDetailsDialog.tsx` and a "View" button in `PlayerTable.tsx` to consume the `GET /api/players/:id` endpoint for full profile previews (including avatars and gallery grids).
- **Navigation Layout Fixes**: Restored missing route links to the `Sidebar.tsx` (Upload Players, Enrollments).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.
