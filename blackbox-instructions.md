# BLACKBOXAI Instructions for GymMate Mobile Project

## Overview
As BLACKBOXAI, I am assisting with the GymMate Mobile project, a full-stack application for gym booking and management. This file contains personalized instructions and guidelines for handling tasks efficiently.

## Project Context
- **Backend**: Node.js/Express with MongoDB (Mongoose), handles API routes for admins, students, schedules, bookings, queues, AR features, feedback.
- **Frontend**: React with Vite, Chakra UI, Zustand for state management, supports mobile-responsive design.
- **Key Features**: User authentication, booking system, walk-in management, AR integration, queue handling, feedback collection.

## Task Handling Workflow
1. **Understand Task**: Analyze the user's request thoroughly.
2. **Search Code**: If many files (>10), use search_code tool to find relevant code snippets.
3. **Read Files**: Examine potential files to understand current implementation.
4. **Brainstorm Plan**: Create a detailed plan including:
   - Information gathered
   - File-level changes
   - Dependent files
   - Followup steps (installations, testing)
   - Ask for user confirmation before proceeding.
5. **Execute Plan**: Break into steps, use TODO.md if complex, update progress.
6. **Test**: Confirm changes work, use browser_action for UI verification if needed.
7. **Complete**: Use attempt_completion with final result.

## Coding Standards (Adhere Strictly)
- **Syntax**: ES6+ with async/await.
- **React**: Functional components with hooks.
- **State**: Zustand stores.
- **Backend**: Express with Mongoose, try-catch for errors.
- **Naming**: camelCase for vars/functions, PascalCase for components.
- **API**: RESTful, JWT auth, input validation.
- **UI**: Chakra UI, toasts at top, responsive.
- **Security**: Sanitize inputs, env vars for secrets.

## File Structure Guidelines
- `backend/`: Routes, controllers, models, utils.
- `frontend/src/`: Components, pages, stores.
- Keep modular and reusable.

## Tool Use Best Practices
- Use one tool per message.
- Wait for user confirmation after each tool use.
- Prefer read_file over search if specific file known.
- For edits: Use edit_file with exact match strings.
- For new files: create_file with complete content.
- Test changes: Use browser_action for frontend, execute_command for backend.

## Testing Protocol
- After changes: Verify functionality.
- Frontend: Use browser_action to launch and interact.
- Backend: Run server, test endpoints.
- If issues: Debug and fix before completion.

## Deployment/Development Notes
- Dev: `npm run dev` (backend), `npm run dev` (frontend).
- Tunneling: Use Cloudflare for mobile testing.
- Environment: .env for secrets.

## Best Practices for Me
- Be direct and technical in responses.
- Don't ask unnecessary questions; use tools to gather info.
- Follow planning: Always create plan, get approval, then execute.
- Update TODO.md for multi-step tasks.
- Ensure complete file content in edits/creations.
- Confirm success before proceeding.
