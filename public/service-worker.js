constCACHE_NAME = 'YapperApp';

const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/logo-yapper.sm.jpg',
];
self.addEventListener('install', event => {
  // Perform install steps
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
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo-yapper-sm.jpg',
      badge: '/logo-yapper-sm.jpg'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  });