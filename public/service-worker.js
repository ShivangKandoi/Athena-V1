// Service Worker for Athena PWA
const CACHE_NAME = 'athena-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-96x96.png',
  '/icons/water-reminder.png',
  '/icons/motivation.png',
  '/icons/health-reminder.png',
  // Add more assets as needed
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients to ensure the service worker is in control
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Always bypass cache for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { redirect: 'follow' })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request, { redirect: 'follow' })
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.log('Fetch failed; returning offline page.', error);
            
            // If the fetch failed for a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return caches.match(event.request);
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-96x96.png',
      data: data.data || {},
      tag: data.tag || 'default',
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Athena Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Handle notification click action
  const action = event.action;
  const notification = event.notification;
  const notificationData = notification.data;

  // Send message to client about the notification click
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If we have an open window, focus it and send a message
        if (clientList.length > 0) {
          const client = clientList[0];
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action: action,
            notificationData: notificationData
          });
          return;
        }
        
        // Otherwise, open a new window
        if (action === 'open-health') {
          return self.clients.openWindow('/health');
        } else if (notificationData && notificationData.type === 'water') {
          return self.clients.openWindow('/health?tab=water');
        } else {
          return self.clients.openWindow('/');
        }
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const options = event.data.options;
    
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-96x96.png',
      data: options.data || {},
      tag: options.tag || 'default',
      actions: options.actions || []
    });
  }
}); 