// ================================================
// KLIKOO Store — Service Worker + Push Notifications
// ================================================

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ⚠️ REMPLACER par ta config Firebase (voir GUIDE_NOTIFICATIONS.md)
const FIREBASE_CONFIG = {
  apiKey: "REMPLACER_API_KEY",
  authDomain: "REMPLACER.firebaseapp.com",
  projectId: "REMPLACER_PROJECT_ID",
  storageBucket: "REMPLACER.appspot.com",
  messagingSenderId: "REMPLACER_SENDER_ID",
  appId: "REMPLACER_APP_ID"
};

firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging();

const CACHE_NAME = 'klikoo-v3';
const STATIC_ASSETS = [
  '/', '/index.html', '/style.css', '/main.js', '/products.js',
  '/wishlist.html', '/wishlist.css', '/wishlist.js',
  '/about.html', '/contact.html', '/manifest.json',
  '/icon-192x192.png', '/icon-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS.map(u => new Request(u, {mode:'no-cors'})))).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('cloudinary')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(r => {
      if (!r || r.status !== 200) return r;
      caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => e.request.destination === 'document' ? caches.match('/index.html') : undefined);
  }));
});

// Background push notifications
messaging.onBackgroundMessage(payload => {
  const d = payload.notification || payload.data || {};
  self.registration.showNotification(d.title || '🛍️ KLIKOO Store', {
    body: d.body || 'Découvrez nos offres du jour !',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    image: d.image || '',
    vibrate: [200, 100, 200],
    data: { url: d.url || 'https://klikoo.ma/' },
    actions: [
      { action: 'open', title: 'Voir le produit' },
      { action: 'close', title: 'Fermer' }
    ]
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'close') return;
  const url = e.notification.data?.url || 'https://klikoo.ma/';
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
    for (const c of list) { if (c.url === url && 'focus' in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});
