const CACHE_NAME = 'khai-v3.0.0';
const STATIC_CACHE = 'khai-static-v3';
const DYNAMIC_CACHE = 'khai-dynamic-v3';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icons/icon-192.png',
    '/images/icons/icon-512.png',
    '/images/icons/apple-touch-icon.png',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.open(DYNAMIC_CACHE).then(cache => {
            return fetch(event.request)
                .then(response => {
                    // Cache successful responses
                    if (response.status === 200) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                })
                .catch(() => {
                    // Return from cache if network fails
                    return cache.match(event.request).then(cachedResponse => {
                        return cachedResponse || caches.match('/offline.html');
                    });
                });
        })
    );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    const db = await openDB();
    const tx = db.transaction(['messages'], 'readonly');
    const store = tx.objectStore('messages');
    const messages = await store.getAll();
    
    for (const message of messages) {
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            
            // Remove from storage if successful
            const tx = db.transaction(['messages'], 'readwrite');
            await tx.objectStore('messages').delete(message.id);
        } catch (error) {
            console.error('Failed to sync message:', error);
        }
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('KHAI_Messages', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
}
