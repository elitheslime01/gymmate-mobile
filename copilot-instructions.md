# Copilot Instructions for GymMate Mobile

## Project Overview
GymMate Mobile is a full-stack application with a Node.js/Express backend and a React frontend using Vite and Chakra UI. It manages gym bookings, queues, schedules, and user accounts.

## Coding Standards
- Use ES6+ syntax with async/await for asynchronous operations.
- Follow React best practices: functional components with hooks.
- Use Zustand for state management in the frontend.
- Backend: Use Express.js with MongoDB via Mongoose.
- Error handling: Use try-catch blocks and return appropriate HTTP status codes.
- Naming: camelCase for variables/functions, PascalCase for components.

## File Structure
- `backend/`: Server-side code (routes, controllers, models, utils).
- `frontend/src/`: React components, pages, stores, utils.
- Keep components modular and reusable.

## API Guidelines
- RESTful endpoints with consistent naming (e.g., `/api/students/login`).
- Use JWT for authentication.
- Validate inputs on both client and server.
- CORS enabled for cross-origin requests.

## UI/UX
- Use Chakra UI components for consistent design.
- Toasts for notifications, positioned at the top.
- Responsive design for mobile access.

## Security
- Sanitize inputs to prevent injection attacks.
- Use environment variables for sensitive data (e.g., MongoDB URI, JWT secret).
- Implement proper authentication and authorization.

## Testing
- Write unit tests for critical functions.
- Use Jest for backend testing.
- Validate API endpoints and UI interactions.

## Deployment
- Frontend: Deploy via Vite build.
- Backend: Use Node.js hosting (e.g., Heroku, Vercel).
- Use Cloudflare Tunnel for local development access.

## Cloudflare Tunneling
For testing on mobile devices or external access during development:
1. Install cloudflared: `winget install Cloudflare.cloudflared`
2. For frontend: `cloudflared tunnel --url http://localhost:5174` (Vite default port)
3. For backend: `cloudflared tunnel --url http://localhost:5001` (Express default port)
4. Copy the generated public URL (e.g., `https://random-id.trycloudflare.com`)
5. Update `frontend/.env`: `VITE_API_BASE_URL=https://backend-tunnel-url`
6. For frontend tunnel, add hostname to `vite.config.js` `server.allowedHosts`
7. Access the app via the tunnel URL on any device.

## Best Practices
- Commit frequently with descriptive messages.
- Use branches for features/bugs.
- Keep code DRY (Don't Repeat Yourself).
- Document complex logic with comments.