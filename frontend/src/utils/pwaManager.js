// =====================================================
// PWA UTILITY FUNCTIONS - ENTERPRISE GRADE
// Offline support, installation, and sync management
// =====================================================

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    
    this.init();
  }

  init() {
    this.setupInstallPrompt();
    this.setupOnlineOfflineListeners();
    this.setupBackgroundSync();
    this.checkInstallationStatus();
  }

  // =====================================================
  // INSTALLATION MANAGEMENT
  // =====================================================

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.trackEvent('pwa_installed');
    });
  }

  showInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.installApp());
    }
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`PWA: Install prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.trackEvent('pwa_install_accepted');
      } else {
        this.trackEvent('pwa_install_declined');
      }
      
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install failed', error);
      return false;
    }
  }

  checkInstallationStatus() {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: Running as installed app');
    }
  }

  // =====================================================
  // ONLINE/OFFLINE MANAGEMENT
  // =====================================================

  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      console.log('PWA: Connection restored');
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Connection lost');
      this.isOnline = false;
      this.handleOffline();
    });
  }

  handleOnline() {
    // Show online indicator
    this.showStatusMessage('Connection restored', 'success');
    
    // Sync offline data
    this.syncOfflineData();
    
    // Clear offline indicators
    document.body.classList.remove('offline');
  }

  handleOffline() {
    // Show offline indicator
    this.showStatusMessage('You are offline', 'warning');
    
    // Add offline class for styling
    document.body.classList.add('offline');
    
    // Track offline event
    this.trackEvent('pwa_offline');
  }

  showStatusMessage(message, type = 'info') {
    // Create or update status message
    let statusElement = document.getElementById('pwa-status-message');
    
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'pwa-status-message';
      statusElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transition: all 0.3s ease;
        transform: translateX(100%);
      `;
      document.body.appendChild(statusElement);
    }

    // Set message and type
    statusElement.textContent = message;
    statusElement.className = `pwa-status-${type}`;
    
    // Set colors based on type
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };
    statusElement.style.backgroundColor = colors[type] || colors.info;

    // Show message
    setTimeout(() => {
      statusElement.style.transform = 'translateX(0)';
    }, 100);

    // Hide message after 3 seconds
    setTimeout(() => {
      statusElement.style.transform = 'translateX(100%)';
    }, 3000);
  }

  // =====================================================
  // BACKGROUND SYNC
  // =====================================================

  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        this.registration = registration;
        console.log('PWA: Background sync ready');
      });
    }
  }

  async syncOfflineData() {
    if (!this.registration) return;

    try {
      // Sync offline filings
      await this.registration.sync.register('offline-filing');
      
      // Sync offline documents
      await this.registration.sync.register('offline-documents');
      
      console.log('PWA: Background sync registered');
    } catch (error) {
      console.error('PWA: Background sync failed', error);
    }
  }

  // =====================================================
  // OFFLINE DATA MANAGEMENT
  // =====================================================

  async storeOfflineData(type, data) {
    try {
      const offlineData = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };

      // Store in IndexedDB
      await this.storeInIndexedDB('offlineQueue', offlineData);
      
      // Add to memory queue
      this.offlineQueue.push(offlineData);
      
      console.log('PWA: Data stored offline', offlineData);
      return offlineData.id;
    } catch (error) {
      console.error('PWA: Failed to store offline data', error);
      throw error;
    }
  }

  async getOfflineData(type) {
    try {
      const data = await this.getFromIndexedDB('offlineQueue');
      return data.filter(item => item.type === type && !item.synced);
    } catch (error) {
      console.error('PWA: Failed to get offline data', error);
      return [];
    }
  }

  async markAsSynced(id) {
    try {
      await this.updateInIndexedDB('offlineQueue', id, { synced: true });
      
      // Remove from memory queue
      this.offlineQueue = this.offlineQueue.filter(item => item.id !== id);
      
      console.log('PWA: Data marked as synced', id);
    } catch (error) {
      console.error('PWA: Failed to mark as synced', error);
    }
  }

  // =====================================================
  // INDEXEDDB HELPERS
  // =====================================================

  async storeInIndexedDB(storeName, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BurnBlackPWA', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const addRequest = store.add(data);
        
        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async getFromIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BurnBlackPWA', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async updateInIndexedDB(storeName, id, updates) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BurnBlackPWA', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const data = getRequest.result;
          if (data) {
            Object.assign(data, updates);
            const putRequest = store.put(data);
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            reject(new Error('Data not found'));
          }
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  // =====================================================
  // ANALYTICS AND TRACKING
  // =====================================================

  trackEvent(eventName, properties = {}) {
    // Track PWA-specific events
    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        isPWA: this.isInstalled,
        isOnline: this.isOnline,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };

    console.log('PWA: Event tracked', eventData);
    
    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  isPWA() {
    return this.isInstalled;
  }

  isOnline() {
    return this.isOnline;
  }

  getOfflineQueueLength() {
    return this.offlineQueue.length;
  }

  async clearOfflineData() {
    try {
      const request = indexedDB.open('BurnBlackPWA', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offlineQueue'], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
      };
      
      this.offlineQueue = [];
      console.log('PWA: Offline data cleared');
    } catch (error) {
      console.error('PWA: Failed to clear offline data', error);
    }
  }
}

// Create global instance
const pwaManager = new PWAManager();

// Export for use in other modules
export default pwaManager;

// Also make available globally for debugging
window.pwaManager = pwaManager;
