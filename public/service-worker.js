const CACHE_NAME = 'YapperApp-v3';

const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/logo-yapper-sm.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('push', function(event) {
  console.log('Push event received', event);
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    const options = {
      body: data.body,
      icon: '/logo-yapper-sm.jpg',
      badge: '/logo-yapper-sm.jpg',
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
        .then(() => console.log('Notification shown'))
        .catch(error => console.error('Error showing notification:', error))
    );
  } else {
    console.log('Push event received but no data');
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click event', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/dashboard')
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});