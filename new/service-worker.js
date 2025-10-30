// Service Worker для KHAI Assistant
const CACHE_NAME = 'khai-assistant-v2.1.0';
const urlsToCache = [
  './',
  './index.html',
  './welcome.html', 
  './guide.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
  'https://js.puter.com/v2/'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Стратегия кэширования: Network First
self.addEventListener('fetch', event => {
  // Пропускаем non-GET запросы и chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Клонируем ответ, т.к. он может быть использован только один раз
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Fallback для страниц
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Фоновая синхронизация данных
  console.log('Background sync completed');
}

// Получение push-уведомлений
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Новое сообщение от KHAI Assistant',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230099FF" rx="20"/><text x="50" y="70" font-family="Arial" font-size="60" text-anchor="middle" fill="white">🧠</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230099FF" rx="20"/><text x="50" y="70" font-family="Arial" font-size="60" text-anchor="middle" fill="white">🧠</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
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
    self.registration.showNotification(data.title || 'KHAI Assistant', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === './' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  }
});

// Сообщение между окнами
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
