// KHAI Assistant Service Worker v1.0
const CACHE_NAME = 'khai-assistant-v3.0.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './logo.svg',
    './favicon.svg'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activate completed');
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // Check if we received a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        // Add to cache for future visits
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        if (event.request.destination === 'document') {
                            return caches.match('./');
                        }
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
