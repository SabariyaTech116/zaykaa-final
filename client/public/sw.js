// Service Worker for Zaykaa Push Notifications
// This file should be placed in the public folder

self.addEventListener('install', (event) => {
    console.log('Zaykaa Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Zaykaa Service Worker activated');
    event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        image: data.image,
        tag: data.tag,
        data: data.data,
        actions: data.actions || [],
        vibrate: [100, 50, 100],
        requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let url = '/';

    // Determine URL based on action or notification type
    if (event.action === 'track') {
        url = `/orders/${data.orderId}`;
    } else if (event.action === 'rate') {
        url = `/orders/${data.orderId}/rate`;
    } else if (event.action === 'accept' || event.action === 'reject') {
        url = `/dashboard?action=${event.action}&orderId=${data.orderId}`;
    } else if (data.orderId) {
        url = `/orders/${data.orderId}`;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    // Track dismissed notifications for analytics
    const data = event.notification.data || {};
    console.log('Notification closed:', data);
});

// Background sync for offline order submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncPendingOrders());
    }
});

async function syncPendingOrders() {
    // Get pending orders from IndexedDB and sync them
    console.log('Syncing pending orders...');
}
