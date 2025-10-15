const CACHE_NAME = 'khuyew-ai-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/components/header.css',
    '/css/components/chat.css',
    '/css/components/input.css',
    '/css/components/modal.css',
    '/css/themes/dark.css',
    '/css/themes/light.css',
    '/js/app.js',
    '/js/modules/utils.js',
    '/js/modules/chat.js',
    '/js/modules/ai.js',
    '/js/modules/voice.js',
    '/js/modules/images.js',
    '/js/vendors/puter-integration.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urllsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
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
        })
    );
});
