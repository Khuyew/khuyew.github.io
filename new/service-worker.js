const CACHE_NAME = 'khai-v3.0.0';
const STATIC_CACHE = 'khai-static-v3.0.0';
const DYNAMIC_CACHE = 'khai-dynamic-v3.0.0';

// Критические ресурсы для установки
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'
];

// Ресурсы для кэширования при установке
const STATIC_ASSETS = [
    ...CRITICAL_ASSETS,
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/sounds/notification.mp3'
];

// Стратегии кэширования
const STRATEGIES = {
    STATIC: 'cache-first',
    DYNAMIC: 'network-first',
    API: 'network-only',
    IMAGES: 'cache-first'
};

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Установка');
    
    event.waitUntil(
        Promise.all([
            // Кэшируем критические ресурсы
            caches.open(STATIC_CACHE)
                .then(cache => {
                    console.log('[Service Worker] Кэширование критических ресурсов');
                    return cache.addAll(CRITICAL_ASSETS);
                }),
            // Кэшируем статические ресурсы
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('[Service Worker] Кэширование статических ресурсов');
                    return cache.addAll(STATIC_ASSETS);
                }),
            // Активируем SW сразу
            self.skipWaiting()
        ])
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Активация');
    
    event.waitUntil(
        Promise.all([
            // Очищаем старые кэши
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE) {
                            console.log('[Service Worker] Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Берем контроль над клиентами
            self.clients.claim()
        ])
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    // Пропускаем не-GET запросы и chrome-extension
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Определяем стратегию кэширования
    const url = new URL(event.request.url);
    let strategy = STRATEGIES.DYNAMIC;

    if (url.origin === location.origin) {
        if (url.pathname.startsWith('/css/') || 
            url.pathname.startsWith('/js/') ||
            url.pathname.startsWith('/assets/')) {
            strategy = STRATEGIES.STATIC;
        }
    } else if (url.hostname.includes('cdnjs.cloudflare.com') ||
               url.hostname.includes('cdn.jsdelivr.net')) {
        strategy = STRATEGIES.STATIC;
    }

    if (url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.webp')) {
        strategy = STRATEGIES.IMAGES;
    }

    if (url.pathname.includes('/api/') || 
        url.hostname.includes('puter.com')) {
        strategy = STRATEGIES.API;
    }

    event.respondWith(
        handleRequest(event.request, strategy)
            .catch(error => {
                console.error('[Service Worker] Ошибка fetch:', error);
                return handleOfflineResponse(event.request);
            })
    );
});

// Обработка запросов по стратегиям
async function handleRequest(request, strategy) {
    const cache = await caches.open(DYNAMIC_CACHE);

    switch (strategy) {
        case STRATEGIES.STATIC:
            return cacheFirst(request, cache);
        
        case STRATEGIES.IMAGES:
            return cacheFirst(request, cache, true);
        
        case STRATEGIES.DYNAMIC:
            return networkFirst(request, cache);
        
        case STRATEGIES.API:
            return networkOnly(request);
        
        default:
            return fetch(request);
    }
}

// Стратегия "Кэш первый"
async function cacheFirst(request, cache, isImage = false) {
    const cached = await cache.match(request);
    
    if (cached) {
        // Для изображений проверяем свежесть кэша
        if (isImage) {
            const cacheAge = getCacheAge(cached);
            if (cacheAge < 7 * 24 * 60 * 60 * 1000) { // 7 дней
                return cached;
            }
        } else {
            return cached;
        }
    }

    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            // Клонируем response для кэширования
            const responseToCache = response.clone();
            cache.put(request, responseToCache);
        }
        
        return response;
    } catch (error) {
        // Если сеть недоступна и нет в кэше, возвращаем fallback
        if (!cached) {
            return getFallbackResponse(request);
        }
        return cached;
    }
}

// Стратегия "Сеть первый"
async function networkFirst(request, cache) {
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const responseToCache = response.clone();
            cache.put(request, responseToCache);
        }
        
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        return getFallbackResponse(request);
    }
}

// Стратегия "Только сеть"
async function networkOnly(request) {
    return fetch(request);
}

// Офлайн-ответ
function handleOfflineResponse(request) {
    if (request.destination === 'document') {
        return caches.match('/offline.html')
            .then(response => response || new Response('Офлайн режим'));
    }
    
    if (request.destination === 'image') {
        return caches.match('/assets/icons/offline-image.png')
            .then(response => response || new Response(''));
    }
    
    return new Response('Сеть недоступна', {
        status: 503,
        statusText: 'Network Unavailable'
    });
}

// Fallback ответ
function getFallbackResponse(request) {
    if (request.destination === 'image') {
        return caches.match('/assets/icons/fallback-image.png');
    }
    
    return new Response(JSON.stringify({
        error: 'Сеть недоступна',
        offline: true
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Получение возраста кэша
function getCacheAge(cachedResponse) {
    const dateHeader = cachedResponse.headers.get('date');
    if (dateHeader) {
        const cachedTime = new Date(dateHeader).getTime();
        return Date.now() - cachedTime;
    }
    return Infinity;
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('[Service Worker] Фоновая синхронизация');
        event.waitUntil(doBackgroundSync());
    }
});

// Периодическая синхронизация
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-update') {
        console.log('[Service Worker] Периодическая синхронизация');
        event.waitUntil(updateContent());
    }
});

async function doBackgroundSync() {
    // Синхронизация данных при появлении сети
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
        });
    });
}

async function updateContent() {
    // Обновление контента в фоне
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = CRITICAL_ASSETS.map(url => new Request(url));
        
        await Promise.all(
            requests.map(request => 
                fetch(request).then(response => {
                    if (response.status === 200) {
                        return cache.put(request, response);
                    }
                }).catch(() => {})
            )
        );
    } catch (error) {
        console.error('[Service Worker] Ошибка обновления контента:', error);
    }
}

// Push уведомления
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Новое сообщение от KHAI',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
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
        self.registration.showNotification(data.title || 'KHAI', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
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
    }
});
