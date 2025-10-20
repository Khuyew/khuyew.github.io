// Khuyew AI Service Worker
// Enhanced caching and offline functionality

const CACHE_NAME = 'khuyew-ai-v3.0.0';
const STATIC_CACHE = 'khuyew-ai-static-v3';
const DYNAMIC_CACHE = 'khuyew-ai-dynamic-v3';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
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

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache the new response
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        // Network failed, try to serve fallback
                        console.log('Service Worker: Network failed, serving fallback', error);
                        
                        // For navigation requests, serve offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                        
                        // For other requests, you could serve a fallback
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
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync for offline messages
    // This would sync messages when connection is restored
    console.log('Service Worker: Performing background sync');
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Новое сообщение в Khuyew AI',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'khuyew-ai-notification',
        renotify: true,
        actions: [
            {
                action: 'open',
                title: 'Открыть чат'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Khuyew AI', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
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

// Periodic sync for updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-update') {
        console.log('Service Worker: Periodic sync for content updates');
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    // Check for updates to static content
    const cache = await caches.open(STATIC_CACHE);
    const requests = STATIC_ASSETS.map(url => new Request(url));
    
    const responses = await Promise.all(
        requests.map(request => fetch(request))
    );
    
    // Update cache with new versions
    await Promise.all(
        responses.map((response, i) => {
            if (response.status === 200) {
                return cache.put(requests[i], response);
            }
        })
    );
    
    console.log('Service Worker: Content updated');
}
