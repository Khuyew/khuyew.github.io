// Service Worker для KHAI - оптимизированная версия
const CACHE_NAME = 'khai-critical-v2.1.0';
const CRITICAL_ASSETS = [
    '/',
    '/styles.css',
    '/manifest.json',
    'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><rect width=\'100\' height=\'100\' fill=\'%230099ff\' rx=\'20\'/><text x=\'50\' y=\'65\' font-family=\'Arial\' font-size=\'45\' text-anchor=\'middle\' fill=\'white\'>K</text></svg>'
];

// Стратегия: Network First для критических ресурсов
self.addEventListener('install', (event) => {
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log('KHAI: Critical assets cached');
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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    
    // Критические ресурсы - Network First
    if (url.pathname === '/' || url.pathname.includes('styles.css')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Клонируем ответ для кеширования
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Для остальных - Cache First
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
    );
});
