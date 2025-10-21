const CACHE_NAME = 'khai-v2.4.0';
const API_CACHE_NAME = 'khai-api-v1';
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
    '/css/themes/belarus.css',
    '/js/app.js',
    '/js/modules/utils.js',
    '/js/modules/chat.js',
    '/js/modules/ai.js',
    '/js/modules/voice.js',
    '/js/modules/images.js',
    '/js/modules/security.js',
    '/js/modules/analytics.js',
    '/js/vendors/puter-integration.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

const externalResources = [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js'
];

// Установка и кэширование ресурсов
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Установка');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Кэширование основных ресурсов');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Все ресурсы закэшированы');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Ошибка кэширования:', error);
            })
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Активация');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('[Service Worker] Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Активирован');
            return self.clients.claim();
        })
    );
});

// Стратегия кэширования: Network First для API, Cache First для статики
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // API запросы - Network First
    if (url.pathname.startsWith('/api/') || url.hostname.includes('puter.com')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Кэшируем успешные API ответы
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // При ошибке сети пробуем взять из кэша
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Статические ресурсы - Cache First
    if (url.origin === self.location.origin && 
        (url.pathname.endsWith('.css') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.html') ||
         url.pathname.startsWith('/icons/'))) {
        
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
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
                        })
                        .catch(() => {
                            // Fallback для критических ресурсов
                            if (event.request.destination === 'document') {
                                return caches.match('/offline.html');
                            }
                            return new Response('Оффлайн режим');
                        });
                })
        );
        return;
    }

    // Внешние ресурсы - Network First
    if (externalResources.some(resource => event.request.url.includes(resource))) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
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

    // По умолчанию - Network First
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('[Service Worker] Фоновая синхронизация');
        event.waitUntil(doBackgroundSync());
    }
});

// Пуш-уведомления
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть'
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
    const cache = await caches.open(API_CACHE_NAME);
    // Логика синхронизации...
}
