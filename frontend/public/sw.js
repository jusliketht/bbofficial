// =====================================================
// SERVICE WORKER - ENTERPRISE GRADE PWA
// Offline support, caching, and background sync
// =====================================================

const CACHE_NAME = 'burnblack-itr-v1.0.0';
const STATIC_CACHE_NAME = 'burnblack-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'burnblack-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/users/dashboard',
  '/api/members',
  '/api/itr/drafts',
  '/api/itr/filings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first strategy
    if (isStaticAsset(request)) {
      event.respondWith(cacheFirstStrategy(request));
    }
    // API requests - network first strategy
    else if (isApiRequest(request)) {
      event.respondWith(networkFirstStrategy(request));
    }
    // HTML pages - network first with offline fallback
    else if (isHtmlRequest(request)) {
      event.respondWith(networkFirstWithOfflineFallback(request));
    }
    // Other requests - network first
    else {
      event.respondWith(networkFirstStrategy(request));
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'offline-filing') {
    event.waitUntil(syncOfflineFilings());
  } else if (event.tag === 'offline-documents') {
    event.waitUntil(syncOfflineDocuments());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from BurnBlack ITR',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Dashboard',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BurnBlack ITR', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/dashboard')
    );
  }
});

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/icons/') ||
         request.url.includes('/manifest.json');
}

function isApiRequest(request) {
  return request.url.includes('/api/');
}

function isHtmlRequest(request) {
  return request.headers.get('accept').includes('text/html');
}

// Cache first strategy - for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy - for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are offline. Please check your connection.',
      offline: true
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Network first with offline fallback - for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed, serving offline page:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync functions
async function syncOfflineFilings() {
  console.log('Service Worker: Syncing offline filings');
  
  try {
    // Get offline filings from IndexedDB
    const offlineFilings = await getOfflineFilings();
    
    for (const filing of offlineFilings) {
      try {
        const response = await fetch('/api/itr/filings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${filing.token}`
          },
          body: JSON.stringify(filing.data)
        });
        
        if (response.ok) {
          await removeOfflineFiling(filing.id);
          console.log('Service Worker: Offline filing synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync offline filing', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

async function syncOfflineDocuments() {
  console.log('Service Worker: Syncing offline documents');
  
  try {
    // Get offline documents from IndexedDB
    const offlineDocuments = await getOfflineDocuments();
    
    for (const document of offlineDocuments) {
      try {
        const formData = new FormData();
        formData.append('file', document.file);
        formData.append('category', document.category);
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${document.token}`
          },
          body: formData
        });
        
        if (response.ok) {
          await removeOfflineDocument(document.id);
          console.log('Service Worker: Offline document synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync offline document', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// IndexedDB helper functions (simplified)
async function getOfflineFilings() {
  // Implementation would use IndexedDB
  return [];
}

async function removeOfflineFiling(id) {
  // Implementation would use IndexedDB
  console.log('Service Worker: Removing offline filing', id);
}

async function getOfflineDocuments() {
  // Implementation would use IndexedDB
  return [];
}

async function removeOfflineDocument(id) {
  // Implementation would use IndexedDB
  console.log('Service Worker: Removing offline document', id);
}

console.log('Service Worker: Script loaded');
