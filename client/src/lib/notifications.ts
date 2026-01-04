// Push Notification Service for Zaykaa
// Uses Web Push API with Firebase Cloud Messaging (FCM) as backend

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string }>;
}

class PushNotificationService {
    private registration: ServiceWorkerRegistration | null = null;
    private permission: NotificationPermission = 'default';

    async init(): Promise<boolean> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported');
            return false;
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Get current permission
            this.permission = Notification.permission;

            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    async requestPermission(): Promise<boolean> {
        if (this.permission === 'granted') return true;
        if (this.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        this.permission = result;

        return result === 'granted';
    }

    async subscribe(): Promise<string | null> {
        if (!this.registration || this.permission !== 'granted') {
            return null;
        }

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });

            // Send subscription to backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });

            return subscription.endpoint;
        } catch (error) {
            console.error('Push subscription failed:', error);
            return null;
        }
    }

    async unsubscribe(): Promise<boolean> {
        if (!this.registration) return false;

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                // Notify backend
                await fetch('/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }
            return true;
        } catch (error) {
            console.error('Push unsubscription failed:', error);
            return false;
        }
    }

    // Show local notification (for testing or when app is open)
    async showLocalNotification(payload: NotificationPayload): Promise<void> {
        if (this.permission !== 'granted' || !this.registration) return;

        // Note: Some properties like 'actions' are only supported in service workers
        await this.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            tag: payload.tag,
            data: payload.data,
            vibrate: [100, 50, 100],
            requireInteraction: true,
        } as any);
    }

    isSupported(): boolean {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    getPermission(): NotificationPermission {
        return this.permission;
    }
}

export const pushNotificationService = new PushNotificationService();

// Notification types for Zaykaa app
export const NotificationTypes = {
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_PREPARING: 'order_preparing',
    ORDER_READY: 'order_ready',
    ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
    ORDER_DELIVERED: 'order_delivered',
    NEW_ORDER: 'new_order', // For homemakers
    PAYMENT_RECEIVED: 'payment_received',
    PROMO: 'promo',
} as const;

// Helper to create notification payloads
export function createOrderNotification(
    type: string,
    orderId: string,
    homemakerName?: string
): NotificationPayload {
    const notifications: Record<string, NotificationPayload> = {
        [NotificationTypes.ORDER_CONFIRMED]: {
            title: 'Order Confirmed! 🎉',
            body: `Your order #${orderId} has been confirmed. ${homemakerName} will start preparing soon.`,
            tag: `order-${orderId}`,
            data: { orderId, type },
            actions: [
                { action: 'track', title: 'Track Order' },
            ],
        },
        [NotificationTypes.ORDER_PREPARING]: {
            title: 'Your food is being prepared 🍳',
            body: `${homemakerName} has started cooking your order #${orderId}`,
            tag: `order-${orderId}`,
            data: { orderId, type },
        },
        [NotificationTypes.ORDER_READY]: {
            title: 'Order Ready! 📦',
            body: `Your order #${orderId} is packed and ready. Delivery partner on the way!`,
            tag: `order-${orderId}`,
            data: { orderId, type },
        },
        [NotificationTypes.ORDER_OUT_FOR_DELIVERY]: {
            title: 'Out for Delivery 🚴',
            body: `Your order #${orderId} is on its way! Track live location.`,
            tag: `order-${orderId}`,
            data: { orderId, type },
            actions: [
                { action: 'track', title: 'Track Live' },
            ],
        },
        [NotificationTypes.ORDER_DELIVERED]: {
            title: 'Delivered! Enjoy your meal 😋',
            body: `Order #${orderId} has been delivered. Rate your experience!`,
            tag: `order-${orderId}`,
            data: { orderId, type },
            actions: [
                { action: 'rate', title: 'Rate Order' },
            ],
        },
        [NotificationTypes.NEW_ORDER]: {
            title: 'New Order! 🔔',
            body: `You have a new order #${orderId}. Accept within 5 minutes.`,
            tag: `order-${orderId}`,
            data: { orderId, type },
            actions: [
                { action: 'accept', title: 'Accept' },
                { action: 'reject', title: 'Decline' },
            ],
        },
    };

    return notifications[type] || {
        title: 'Zaykaa Update',
        body: `Update for order #${orderId}`,
        tag: `order-${orderId}`,
        data: { orderId, type },
    };
}

// React hook for push notifications
import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const init = async () => {
            const supported = await pushNotificationService.init();
            setIsSupported(supported);
            setPermission(pushNotificationService.getPermission());
        };
        init();
    }, []);

    const requestPermission = useCallback(async () => {
        const granted = await pushNotificationService.requestPermission();
        setPermission(granted ? 'granted' : 'denied');
        return granted;
    }, []);

    const subscribe = useCallback(async () => {
        const endpoint = await pushNotificationService.subscribe();
        setIsSubscribed(!!endpoint);
        return !!endpoint;
    }, []);

    const unsubscribe = useCallback(async () => {
        const success = await pushNotificationService.unsubscribe();
        if (success) setIsSubscribed(false);
        return success;
    }, []);

    return {
        isSupported,
        permission,
        isSubscribed,
        requestPermission,
        subscribe,
        unsubscribe,
    };
}
