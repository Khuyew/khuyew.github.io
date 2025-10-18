// Service Worker для KHAI Assistant
const CACHE_NAME = 'khai-assistant-v1.0.0';
const STATIC_CACHE = 'khai-static-v1.0.0';
const DYNAMIC_CACHE = 'khai-dynamic-v1.0.0';

// Файлы для кэширования при установке
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.webmanifest',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/apple-touch-icon.png',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png'
];

// Файлы для кэширования из CDN
const EXTERNAL_FILES = [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://js.puter.com/v2/',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Установка');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Кэширование статических файлов');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Все статические файлы закэшированы');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Ошибка кэширования статических файлов:', error);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активация');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Удаление старого кэша', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Активирован');
            return self.clients.claim();
        })
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    // Пропускаем неподходящие запросы
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // Пропускаем запросы к Puter AI API
    if (event.request.url.includes('api.puter.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный response если он есть
                if (response) {
                    return response;
                }

                // Клонируем запрос
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then((response) => {
                        // Проверяем валидность response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Клонируем response
                        const responseToCache = response.clone();

                        // Кэшируем динамические запросы
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Fallback для страниц
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Fallback для изображений
                        if (event.request.destination === 'image') {
                            return new Response(
                                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">Изображение недоступно</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Обработка сообщений
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Новое уведомление от KHAI Assistant',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
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
        self.registration.showNotification(data.title || 'KHAI Assistant', options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
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
