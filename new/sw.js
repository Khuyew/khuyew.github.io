// Service Worker for KHAI Pro Chat
const CACHE_NAME = 'khai-pro-chat-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
