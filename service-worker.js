importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// ================= CONFIGURACIÓN PRINCIPAL =================
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '2' },
  { url: '/juego/juego.html', revision: '1' },
  { url: '/offline.html', revision: '1' },
  { url: '/stylesBiblia.css', revision: '1' },
  { url: '/styles.css', revision: '2' },
  { url: '/script.js', revision: '2' },
  { url: '/auth.js', revision: '1' },
  { url: '/scriptBiblia.js', revision: '1' },
  { url: '/presentacion.jpg', revision: '1' },
  { url: '/icon.png', revision: '1' },
  { url: '/favicon.ico', revision: '1' },
  { url: '/juego/preguntas.json', revision: '1' },
  { url: '/icon-192x192.png', revision: '1' },
  { url: '/badge.png', revision: '1' }
]);

// ================= ESTRATEGIAS DE CACHÉ =================
// Bootstrap y dependencias externas
workbox.routing.registerRoute(
  /https:\/\/cdn\.jsdelivr\.net/,
  new workbox.strategies.CacheFirst({
    cacheName: 'cdn-resources',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 5 })]
  })
);

// Palabra del día (estrategia híbrida)
workbox.routing.registerRoute(
  ({ url }) => url.href.startsWith('https://palabra-del-dia-backend.vercel.app/devotional'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'palabra-del-dia-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 7,
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Contenido dinámico
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'dynamic-content',
    networkTimeoutSeconds: 3,
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 10 })]
  })
);

// ================= MANEJO OFFLINE =================
workbox.routing.setCatchHandler(({ event }) => {
  return event.request.destination === 'document' 
    ? caches.match('/offline.html')
    : Response.error();
});

// ================= BACKGROUND SYNC =================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-palabra') {
    event.waitUntil(
      fetch('https://palabra-del-dia-backend.vercel.app/devotional')
        .then(response => response.json())
        .then(data => 
          caches.open('palabra-del-dia-cache').then(cache =>
            cache.put(
              new Request(`https://palabra-del-dia-backend.vercel.app/devotional?date=${new Date().toISOString().split('T')[0]}`),
              new Response(JSON.stringify(data))
            )
          )
        )
    );
  }
});

// ================= ACTUALIZACIÓN PERIÓDICA =================
const updateCache = async () => {
  try {
    const response = await fetch('https://palabra-del-dia-backend.vercel.app/devotional');
    const data = await response.json();
    const cache = await caches.open('palabra-del-dia-cache');
    await cache.put(
      new Request(`https://palabra-del-dia-backend.vercel.app/devotional?date=${new Date().toISOString().split('T')[0]}`),
      new Response(JSON.stringify(data))
    );
  } catch (error) {
    console.error('Error en actualización periódica:', error);
  }
};

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-update') event.waitUntil(updateCache());
});

// ================= ACTIVACIÓN =================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.periodicSync.register('periodic-update', {
        minInterval: 6 * 60 * 60 * 1000 // 6 horas
      }),
      clients.claim(),
      self.skipWaiting()
    ])
  );
});

// ================= MENSAJES =================
self.addEventListener('message', (event) => {
  if (event.data.type === 'force-update') updateCache();
});

// ================= INSTALACIÓN =================
self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('🔥 Service Worker instalado');
});



/////////////////////////////////////////////////////////////
// ================= NOTIFICACIONES PUSH =================
/////////////////////////////////////////////////////////////
// ================= NOTIFICACIONES PUSH CORREGIDAS =================
self.addEventListener('push', async event => {
  const data = event.data.json();
  
  // Obtener el cliente activo para verificar conexión
  const clients = await self.clients.matchAll({ type: 'window' });
  const isOnline = clients.length > 0 && clients[0].visibilityState === 'visible';

  const options = {
    body: isOnline ? data.body : '📬 Mensaje guardado (conexión recuperada)',
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener('pushsubscriptionchange', async event => {
  const newSubscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
  });

  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: newSubscription })
  });
});

// Helper para conversión de clave
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4;
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}