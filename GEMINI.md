# Project Gemini: Gymmate Mobile - Technical Overview

This document provides a technical overview of the Gymmate Mobile project, based on an analysis of the provided codebase snippets and file structure.

## 1. Project Overview

Gymmate Mobile appears to be a comprehensive web application designed for gym management. It includes features for user authentication, booking, scheduling, and even incorporates advanced technologies like Augmented Reality (AR) and a sophisticated AI assistant. The project is a monorepo with a React-based frontend and a Node.js/Express backend. There are also Python scripts, suggesting some backend services or utilities are written in Python.

## 2. Technology Stack

### Frontend

*   **Framework:** React (using Vite for bundling)
*   **UI Components:** Custom components are built, as seen in `src/components`.
*   **Styling:** The use of `className` suggests CSS or a CSS-in-JS library.
*   **State Management:** The `src/store` directory suggests a state management library like Redux, Zustand, or MobX is in use.
*   **Markdown Rendering:** The application uses `marked` for parsing markdown and `Prism` for syntax highlighting, with a custom fallback for basic rendering.

### Backend

*   **Runtime:** Node.js
*   **Framework:** Express.js (inferred from `server.js` and route structure)
*   **Database:** MongoDB is likely used, given the `db.js` config file and the common use of Mongoose with Express (the `.model.js` files suggest Mongoose schemas).
*   **API:** A RESTful API is exposed through the `routes` directory, with controllers handling business logic.
*   **File Uploads:** `multer.js` indicates handling of multipart/form-data, likely for file uploads.
*   **Data Structures:** Custom data structures like `maxHeap.js` and `priorityBST.js` are implemented, suggesting complex scheduling or prioritization algorithms.
*   **Python Services:** The presence of Python scripts for tasks like `seedFeedback.js` (though a `.js` file, it hints at data seeding scripts) and potentially other backend logic.

## 3. Core Features

### Gym Management

*   **User Authentication:** Full user registration and login system (`LoginPage.jsx`, `RegisterPage.jsx`, `student.controller.js`).
*   **Booking & Scheduling:** Users can book sessions, view schedules, and manage their bookings (`BookingPage.jsx`, `booking.controller.js`, `schedule.controller.js`). A calendar view (`WalkinCalendar.jsx`) and time slot selection (`WalkinTimeSlots.jsx`) are available.
*   **Queue Management:** A queueing system is in place (`queue.controller.js`, `queue.model.js`), which might be used for managing walk-in clients or access to equipment.
*   **Augmented Reality:** An AR feature is present (`ar.controller.js`, `WalkinARInput.jsx`), which could be for interactive workouts, equipment guides, or facility tours.
*   **Feedback System:** Users can provide feedback, which can be seeded into the system (`FeedbackPage.jsx`, `feedback.controller.js`, `seedFeedback.js`).

### Advanced Features

*   **AI Assistant ("Second Me"):** The application seems to feature a personal AI assistant. This "Second Me" can be configured and trained, suggesting it's a personalized model for the user.
*   **Code Indexing & Intelligence:** A `MetadataManager` class in Python suggests a system for indexing code repositories. This could be used for a RAG (Retrieval-Augmented Generation) system to provide context to the AI assistant, enabling it to answer questions about code or perform code-related tasks.
*   **Remote Browser Interaction ("Magentic-UI"):** The application includes a feature for remote browser control using `noVNC`. This could be for user support, remote development, or automated testing. The "Magentic-UI" seems to be the name of this interface.
*   **Markdown Documentation Parser:** Python functions like `parse_markdown_documentation` are used to parse and extract structured information from markdown files, possibly for populating a knowledge base or for documentation display within the app.

This overview is based on the file names and code snippets provided. A deeper analysis would require examining the full content of these files.
