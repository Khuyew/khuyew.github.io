const CACHE_NAME = 'khai-chat-v1.2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Return cached version or fetch from network
                    if (response) {
                        return response;
                    }

                    return fetch(event.request)
                        .then((response) => {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // Clone the response
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        })
                        .catch(() => {
                            // If both cache and network fail, show offline page
                            if (event.request.destination === 'document') {
                                return caches.match('/');
                            }
                        });
                })
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
