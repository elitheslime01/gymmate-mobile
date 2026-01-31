import webPush from "web-push";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@gymmate.local";
const hasVapidConfig = Boolean(vapidPublicKey && vapidPrivateKey);

if (hasVapidConfig) {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
    console.warn("VAPID keys are missing. Push notifications will be skipped until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set.");
}

const shouldPrune = (error) => {
    if (!error?.statusCode) return false;
    return [404, 410].includes(error.statusCode);
};

export const sendPushNotification = async (subscription, payload) => {
    if (!hasVapidConfig) {
        return { ok: false, prune: false };
    }

    try {
        await webPush.sendNotification(subscription, JSON.stringify(payload));
        return { ok: true };
    } catch (error) {
        const prune = shouldPrune(error);
        console.error("Push send error", error?.statusCode || "", error?.message || error);
        return { ok: false, prune };
    }
};

export const broadcastPushNotifications = async (subscriptions = [], payload) => {
    const failures = [];
    for (const subscription of subscriptions) {
        const result = await sendPushNotification(subscription, payload);
        if (!result.ok && result.prune && subscription?.endpoint) {
            failures.push(subscription.endpoint);
        }
    }
    return failures;
};
