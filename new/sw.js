const CACHE_NAME = 'khai-assistant-v1.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
  'https://js.puter.com/v2/'
];

// Install event - cache resources
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
      .catch(error => {
        console.error('Service Worker: Install failed', error);
      })
  );
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache or network
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
        if (response) {
          return response;
        }

        return fetch(event.request)
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
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            // You could return a custom offline page here
          });
      })
  );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Новое сообщение в KHAI',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'khai-notification',
    renotify: true,
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
    self.registration.showNotification(data.title || 'KHAI — Чат с ИИ', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
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

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Get pending messages from IndexedDB
    const db = await openDB();
    const pendingMessages = await getPendingMessages(db);
    
    if (pendingMessages.length > 0) {
      console.log(`Service Worker: Syncing ${pendingMessages.length} pending messages`);
      
      for (const message of pendingMessages) {
        try {
          // Attempt to send the message
          await sendMessage(message);
          // Remove from pending if successful
          await removePendingMessage(db, message.id);
        } catch (error) {
          console.error('Service Worker: Failed to sync message', error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KHAI_Sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_messages')) {
        const store = db.createObjectStore('pending_messages', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_messages'], 'readonly');
    const store = transaction.objectStore('pending_messages');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending_messages'], 'readwrite');
    const store = transaction.objectStore('pending_messages');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Mock send message function
async function sendMessage(message) {
  // This would be replaced with actual API call
  console.log('Service Worker: Sending message', message);
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_MESSAGE':
      cacheMessage(payload);
      break;
      
    case 'GET_CACHED_MESSAGES':
      event.ports[0].postMessage({
        type: 'CACHED_MESSAGES',
        payload: getCachedMessages()
      });
      break;
      
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// Cache message for offline use
async function cacheMessage(message) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pending_messages'], 'readwrite');
    const store = transaction.objectStore('pending_messages');
    
    const messageWithId = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    store.add(messageWithId);
  } catch (error) {
    console.error('Service Worker: Failed to cache message', error);
  }
}

// Get cached messages
async function getCachedMessages() {
  try {
    const db = await openDB();
    return await getPendingMessages(db);
  } catch (error) {
    console.error('Service Worker: Failed to get cached messages', error);
    return [];
  }
}
