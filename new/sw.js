const CACHE_NAME='khai-assistant-v2.2.0';
const urlsToCache=[
    './',
    './index.html',
    './styles.min.css',
    './script.min.js',
    './manifest.json',
    './assets/logo.webp',
    './assets/logo.png',
    './assets/favicon.ico',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/og-image.jpg',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
];

self.addEventListener('install',event=>{
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache=>cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch',event=>{
    event.respondWith(
        caches.match(event.request)
            .then(response=>response||fetch(event.request))
    );
});

self.addEventListener('activate',event=>{
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.map(cacheName=>{
                    if(cacheName!==CACHE_NAME){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
