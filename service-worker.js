importScripts("/aapico-checkin/precache-manifest.39f6f5f6412c235bc0f2f49a0269483f.js", "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

console.log("Worker is working")

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])

self.addEventListener('install', event => {
  workbox.skipWaiting()
  workbox.clientsClaim()
  console.log('install')
})
self.addEventListener('activate', event => {
  console.log('activate')
})

workbox.routing.registerRoute(
  new RegExp('https:.*min\.(css|js|json)'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'cache'
  })
)

workbox.routing.registerRoute(
  new RegExp('(http|https):.*\.(png|gif|jpg|jpeg|webp|svg)'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'images',
  })
);

workbox.routing.registerRoute(
  new RegExp('https:.*?alt=json'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'google-sheet-cache'
  })
)

workbox.routing.registerRoute(
  new RegExp('https://search\.map\.powermap\.in\.th/api/v2/map/vtile.*'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'map-cache'
  })
)

workbox.routing.registerRoute(
  new RegExp('https://fonts\.googleapis\.com.*'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'font-cache'
  })
)

let notificationUrl = '';
self.addEventListener('push', function (event) {
  console.log('Push received: ', event);
  let _data = event.data ? JSON.parse(event.data.text()) : {};
  notificationUrl = _data.url;
  event.waitUntil(
      self.registration.showNotification(_data.title, {
          body: _data.message,
          icon: _data.icon,
          tag: _data.tag
      })
  );
});

//notification url redirect event click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
      clients.matchAll({
          type: "window"
      })
      .then(function (clientList) {
          if (clients.openWindow) {
              return clients.openWindow(notificationUrl);
          }
      })
  );
});

