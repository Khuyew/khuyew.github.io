// service-worker.js - Progressive Web App Service Worker
const CACHE_NAME = 'khai-assistant-v2.1.0';
const STATIC_CACHE = 'khai-static-v2.1.0';
const DYNAMIC_CACHE = 'khai-dynamic-v2.1.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './logo.png',
    './icon.png',
    './favicon.ico',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - network first strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache when offline
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Fallback for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        return new Response('Network error happened', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // Implement background sync for pending messages
        event.waitUntil(syncPendingMessages());
    }
});

async function syncPendingMessages() {
    // This would sync any pending messages when back online
    console.log('Syncing pending messages...');
}

// Handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Новое сообщение от KHAI Assistant',
        icon: './icon.png',
        badge: './icon.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || './'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'KHAI Assistant', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});
