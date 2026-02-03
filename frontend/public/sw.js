self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  console.log("Push payload:", payload);
  const title = payload.title || "GymMate";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: payload.icon || "/gymmate_logo.png",
    data: payload.data || {},
    badge: payload.badge || "/gymmate_logo.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
