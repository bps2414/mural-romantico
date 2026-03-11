const CACHE_NAME = 'mural-romantico-v1';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
];

// Install — pre-cache offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (Spotify embeds, Supabase API, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.ok &&
          (event.request.url.includes('/icons/') ||
            event.request.url.includes('.css') ||
            event.request.url.includes('.js'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Try cache first
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // For navigation requests, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        return new Response('Offline', { status: 503 });
      })
  );
});

// Push Notification — show notification when push received
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  // Define fallback notification object
  const notificationPromise = self.registration.showNotification(data.title ?? 'Nosso Mural 💕', {
    body: data.body ?? 'Algo novo te espera!',
    icon: '/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url ?? '/' },
    // Remove "badge" because Android requires alpha-channel only masked icon here,
    // which causes a white square issue with normal color icons.
  });

  event.waitUntil(notificationPromise);
});

// Notification Click — open app on the correct page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(event.notification.data.url);
    })
  );
});
