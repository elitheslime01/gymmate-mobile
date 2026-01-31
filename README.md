# GymMate Mobile

A gym bookings, time in and out, and submitting feedbacks compatible for mobile devices.

Key Components:
- Booking Session Module
- Time in and out Module
- Feebacks Module
- Notifications 

<img width="473" height="834" alt="image" src="https://github.com/user-attachments/assets/5890479d-9455-4da7-ac1c-cfc8dfa31f93" />
<img width="471" height="833" alt="image" src="https://github.com/user-attachments/assets/04769e9a-bd26-47df-975c-5ee64e7e98fa" />

## Push notifications

- Generate VAPID keys (using the `web-push` CLI or a script) and add to `.env` in project root: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and optional `VAPID_SUBJECT` (e.g., `mailto:admin@gymmate.local`).
- Add the public key to the frontend `.env`: `VITE_VAPID_PUBLIC_KEY=<same public key>`.
- New endpoints:
	- `POST /api/notifications/subscribe` with `userId` and `subscription` (Push API object) to store the subscription on the student.
	- `POST /api/notifications/send` with `userId`, `title`, `body`, optional `link`, and `icon` to trigger a push notification.
- The service worker at `/sw.js` handles `push` and `notificationclick` events and shows native notifications with the GymMate icon.
- Push subscriptions are stored on the student document so the backend can broadcast notifications for booking reminders and queue updates.
