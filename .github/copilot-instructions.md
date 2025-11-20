# Copilot Instructions for GymMate

## Project Overview
GymMate is a full-stack web application for booking gym sessions at a university gym. It features a priority-based queue system to ensure fair access, AR integration for gym discovery, and walk-in booking capabilities. The backend uses Node.js/Express with MongoDB, while the frontend is built with React, Vite, Chakra UI, and Zustand for state management.

## Architecture
- **Backend**: RESTful API with controllers in `backend/controller/`, models in `backend/models/`, routes in `backend/routes/`. Key entities: students, admins, bookings, schedules, queues, AR codes, feedback.
- **Frontend**: Component-based in `frontend/src/components/`, pages in `frontend/src/pages/`, Zustand stores in `frontend/src/store/`.
- **Data Flow**: Frontend makes API calls to backend (default `http://localhost:5001`), stores user data in localStorage, uses Zustand for global state.
- **Priority Queue**: Custom MaxHeap in `backend/utils/maxHeap.js` prioritizes students based on attendance bonus, unsuccessful attempts, and no-show penalties (see `calculatePriorityScore` in `queue.controller.js`).

## Key Patterns
- **Models**: Mongoose schemas with fields prefixed by `_` (e.g., `_fName`, `_umakEmail`). Passwords stored in plain text (update to hashing for production).
- **Controllers**: Async functions returning JSON `{success: boolean, message: string, data?: any}`. Validate inputs manually in each endpoint.
- **API Routes**: Prefixed `/api/`, e.g., `/api/students/login`. Use JWT for auth (not implemented yet).
- **Frontend Stores**: Zustand stores export hooks like `useStudentStore`. API calls use `fetch` with `${API_BASE_URL}/api/...`.
- **UI**: Chakra UI with custom Inter font, toasts positioned at top. Responsive for mobile.
- **File Uploads**: Multer for backend, Cloudinary/ImageKit for frontend image handling.

## Developer Workflows
- **Run Backend**: From root, `npm run dev` (starts server on port 5001 with nodemon).
- **Run Frontend**: `cd frontend && npm run dev` (Vite on port 5173).
- **Build Frontend**: `cd frontend && npm run build`.
- **Test Queue Performance**: `cd backend && node test/queueSimulation.test.js` (runs simulations comparing heap vs BST).
- **Environment**: Use `.env` in backend for `MONGODB_URI`, `PORT`. Frontend uses `VITE_API_BASE_URL` for API base.
- **Debugging**: Console logs in controllers and stores. For mobile testing, use Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:5001` and update frontend env.

## Conventions
- **Imports**: ES modules (`import/export`), no default exports for controllers.
- **Error Handling**: Try-catch in async functions, return 400/500 status codes.
- **Naming**: camelCase for JS, PascalCase for React components. Routes use plural nouns.
- **State Management**: Avoid prop drilling; use Zustand stores for shared state.
- **Security**: Sanitize inputs, but passwords are not hashed—implement bcrypt.
- **Commits**: Frequent with descriptive messages; use branches for features.

## Integration Points
- **Database**: MongoDB with Mongoose; connect via `backend/config/db.js`.
- **AR Features**: AR codes stored in `ar.model.js`, images uploaded via `/api/arImage`.
- **Queue Logic**: Enqueue/dequeue via heap; updates student metrics on booking actions.
- **External Services**: Cloudinary for image hosting, ImageKit for React components.

## Examples
- **Adding a Student**: POST to `/api/students` with body matching `student.model.js` fields.
- **Priority Calculation**: `attendanceBonus + unsuccessfulPoints - noShowPenalty` (from `queue.controller.js`).
- **Store Update**: `useStudentStore.getState().createStudent(data)` triggers API call and localStorage update.