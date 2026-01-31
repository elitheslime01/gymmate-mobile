import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useStudentStore } from "../store/student";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const safeBase64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(safeBase64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotificationManager = () => {
  const { user } = useStudentStore();
  const toast = useToast();

  useEffect(() => {
    if (!user?._id) return;
    if (!VAPID_PUBLIC_KEY) {
      console.warn("VAPID public key is missing. Set VITE_VAPID_PUBLIC_KEY to enable push subscriptions.");
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        console.log("Starting push notification setup...");
        const permission = Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

        console.log("Notification permission:", permission);
        if (permission !== "granted") {
          toast({
            status: "info",
            title: "Notifications disabled",
            description: "Enable browser notifications to get booking updates.",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        // Ensure service worker is registered, then wait until it's ready
        console.log("Checking service worker registration...");
        const existingRegistration = await navigator.serviceWorker.getRegistration("/sw.js");
        const registration = existingRegistration || (await navigator.serviceWorker.register("/sw.js"));
        console.log("Service worker registered:", registration);
        const readyRegistration = await navigator.serviceWorker.ready;
        console.log("Service worker ready:", readyRegistration);

        const existingSubscription = await readyRegistration.pushManager.getSubscription();
        console.log("Existing subscription:", existingSubscription);

        const subscription = existingSubscription || (await readyRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
        console.log("Subscription created:", subscription);

        const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id, subscription }),
        });
        console.log("Subscription sent to backend, response status:", response.status);
      } catch (error) {
        console.error("Push setup failed:", error);
        toast({
          status: "warning",
          title: "Push setup failed",
          description: "We could not enable push notifications. Please try again later.",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    registerAndSubscribe();
  }, [user?._id, toast]);

  return null;
};

export default PushNotificationManager;
