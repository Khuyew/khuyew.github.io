// Service Worker for KHAI Chat
const CACHE_NAME = 'khai-v2.1.0';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activate completed');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests that we don't want to cache
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin && 
        !url.href.includes('cdn.jsdelivr.net') &&
        !url.href.includes('cdnjs.cloudflare.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // Update cache in background for next time
                    fetchAndCache(event.request);
                    return cachedResponse;
                }

                // Otherwise fetch from network and cache
                return fetchAndCache(event.request);
            })
            .catch((error) => {
                console.error('Service Worker: Fetch failed', error);
                
                // If both cache and network fail, show offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                
                throw error;
            })
    );
});

// Helper function to fetch and cache requests
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    cache.put(request, responseToCache);
                });

            return response;
        });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New message from KHAI',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'khai-notification',
        renotify: true,
        actions: [
            {
                action: 'open',
                title: 'Open Chat'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'KHAI', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Focus existing window or open new one
                    for (const client of clientList) {
                        if (client.url === '/' && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// Background sync implementation
async function doBackgroundSync() {
    try {
        // Implement background sync logic here
        console.log('Service Worker: Background sync completed');
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_DATA':
            cacheUserData(payload);
            break;
            
        case 'GET_CACHED_DATA':
            getCachedData(payload, event.ports[0]);
            break;
            
        case 'CLEAR_CACHE':
            clearUserCache();
            break;
            
        default:
            console.log('Service Worker: Unknown message type', type);
    }
});

// Cache user-specific data
async function cacheUserData(data) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = new Response(JSON.stringify(data));
        await cache.put('/user-data', response);
    } catch (error) {
        console.error('Service Worker: Failed to cache user data', error);
    }
}

// Get cached user data
async function getCachedData(key, port) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = await cache.match('/user-data');
        
        if (response) {
            const data = await response.json();
            port.postMessage({ success: true, data: data[key] });
        } else {
            port.postMessage({ success: false, data: null });
        }
    } catch (error) {
        console.error('Service Worker: Failed to get cached data', error);
        port.postMessage({ success: false, data: null });
    }
}

// Clear user cache
async function clearUserCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const keys = await cache.keys();
        
        await Promise.all(
            keys.map(key => cache.delete(key))
        );
    } catch (error) {
        console.error('Service Worker: Failed to clear user cache', error);
    }
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});
