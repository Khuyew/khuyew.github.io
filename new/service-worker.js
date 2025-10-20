// Service Worker for KHAI Pro Chat
const CACHE_NAME = 'khai-pro-v2.0.0';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activate completed');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests that we don't want to cache
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && 
      !url.href.includes('cdn.jsdelivr.net') &&
      !url.href.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background for next time
          fetchAndCache(event.request);
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetchAndCache(event.request);
      })
      .catch((error) => {
        console.error('Service Worker: Fetch failed', error);
        
        // If both cache and network fail, show offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        
        // Return offline page for HTML requests
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
        
        throw error;
      })
  );
});

// Helper function to fetch and cache requests
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone the response
      const responseToCache = response.clone();

      // Cache the response
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch((error) => {
      console.error('Fetch and cache error:', error);
      throw error;
    });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    console.log('Service Worker: Periodic sync for content updates');
    event.waitUntil(updateContent());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Новое сообщение от KHAI Pro',
    icon: './icons/icon-192x192.png',
    badge: './icons/badge-72x72.png',
    tag: 'khai-pro-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Открыть чат'
      },
      {
        action: 'dismiss',
        title: 'Закрыть'
      }
    ],
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'KHAI Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Focus existing window or open new one
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

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Sync unsent messages
    const pendingMessages = await getPendingMessages();
    for (const message of pendingMessages) {
      await syncMessage(message);
    }
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Content update implementation
async function updateContent() {
  try {
    // Check for updates to static assets
    const cache = await caches.open(STATIC_CACHE);
    const requests = STATIC_ASSETS.map(url => new Request(url));
    
    const responses = await Promise.all(
      requests.map(request => 
        fetch(request).catch(() => cache.match(request))
      )
    );
    
    // Update cache with new versions
    await Promise.all(
      responses.map((response, index) => {
        if (response && response.ok) {
          return cache.put(requests[index], response);
        }
      })
    );
    
    console.log('Service Worker: Content update completed');
  } catch (error) {
    console.error('Service Worker: Content update failed', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_DATA':
      cacheUserData(payload);
      break;
      
    case 'GET_CACHED_DATA':
      getCachedData(payload, event.ports[0]);
      break;
      
    case 'CLEAR_CACHE':
      clearUserCache();
      break;
      
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// Cache user-specific data
async function cacheUserData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(data));
    await cache.put('/user-data', response);
  } catch (error) {
    console.error('Service Worker: Failed to cache user data', error);
  }
}

// Get cached user data
async function getCachedData(key, port) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/user-data');
    
    if (response) {
      const data = await response.json();
      port.postMessage({ success: true, data: data[key] });
    } else {
      port.postMessage({ success: false, data: null });
    }
  } catch (error) {
    console.error('Service Worker: Failed to get cached data', error);
    port.postMessage({ success: false, data: null });
  }
}

// Clear user cache
async function clearUserCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    
    await Promise.all(
      keys.map(key => cache.delete(key))
    );
  } catch (error) {
    console.error('Service Worker: Failed to clear user cache', error);
  }
}

// Helper functions for background sync
async function getPendingMessages() {
  // Implementation for getting pending messages from IndexedDB
  return [];
}

async function syncMessage(message) {
  // Implementation for syncing a single message
  return Promise.resolve();
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});
