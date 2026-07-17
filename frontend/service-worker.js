const CACHE_NAME = 'finance-planner-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/config.example.js',
  '/app.js',
  '/shared/utils/storage.js',
  '/shared/utils/notifications.js',
  '/shared/utils/gamification.js',
  '/shared/utils/charts.js',
  '/shared/components/bottom-nav.js',
  '/shared/components/modal-overlay.js',
  '/shared/components/toast-notification.js',
  '/shared/components/confetti-effect.js',
  '/shared/components/xp-bar.js',
  '/screens/onboarding.js',
  '/screens/home.js',
  '/screens/ai-advisor.js',
  '/screens/calendar.js',
  '/screens/expenses.js',
  '/screens/income.js',
  '/screens/bills.js',
  '/screens/debt-tracker.js',
  '/screens/budget.js',
  '/screens/shopping-list.js',
  '/screens/goals.js',
  '/screens/reports.js',
  '/screens/profile.js',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  if (event.request.url.indexOf('/api/') !== -1) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

function cacheFirst(request) {
  return caches.match(request).then(function(response) {
    return response || fetch(request).then(function(networkResponse) {
      if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
        var clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, clone);
        });
      }
      return networkResponse;
    });
  });
}

function networkFirst(request) {
  return fetch(request).then(function(response) {
    if (response && response.ok) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, clone);
      });
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || new Response(JSON.stringify({ error: 'You are offline' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
}
