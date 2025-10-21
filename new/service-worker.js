// service-worker.js
const CACHE_NAME = 'khai-belarus-ai-v3.0.0';
const DYNAMIC_CACHE = 'khai-dynamic-v3.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/js/modules/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Стратегия: Cache First с обновлением в фоне
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Стратегия кэширования
self.addEventListener('fetch', (event) => {
    // Пропускаем non-GET запросы и chrome-extension
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
        return;
    }

    // Для API запросов - Network First
    if (event.request.url.includes('/api/') || event.request.url.includes('puter.ai')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Клонируем ответ для кэша
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Для статики - Cache First
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then((fetchResponse) => {
                        // Проверяем валидность ответа
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Клонируем ответ
                        const responseToCache = fetchResponse.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(() => {
                        // Fallback для критических ресурсов
                        if (event.request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Push уведомления
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть приложение'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

async function doBackgroundSync() {
    // Фоновая синхронизация данных
    const cache = await caches.open(DYNAMIC_CACHE);
    // Логика синхронизации...
}
