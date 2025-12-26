/**
 * CDN Integration for TV Calibration Pro
 * 
 * This module handles loading calibration data from the CDN (jsDelivr)
 * which is automatically updated by GitHub Actions.
 * 
 * Add this code to your app.js or create a new cdn-loader.js file
 */

/**
 * CDN Configuration
 * Replace 'yourusername' and 'tv-calibration-pro' with your actual GitHub username and repo name
 */
const CDN_CONFIG = {
  // GitHub repo info (UPDATE THESE!)
  username: 'YOUR_GITHUB_USERNAME',  // e.g., 'johndoe'
  repo: 'tv-calibration-pro',         // Your repo name
  branch: 'main',                      // Default branch
  
  // CDN URLs
  jsdelivr: 'https://cdn.jsdelivr.net/gh',
  
  // Cache settings
  cacheEnabled: true,
  cacheDuration: 3600000, // 1 hour in milliseconds
  
  // File paths
  dataFile: 'data/calibrations.json'
};

/**
 * Build CDN URL for the calibration database
 */
function getCDNUrl(bustCache = false) {
  const baseUrl = `${CDN_CONFIG.jsdelivr}/${CDN_CONFIG.username}/${CDN_CONFIG.repo}@${CDN_CONFIG.branch}/${CDN_CONFIG.dataFile}`;
  
  if (bustCache) {
    // Add timestamp to bypass cache
    return `${baseUrl}?t=${Date.now()}`;
  }
  
  return baseUrl;
}

/**
 * Load calibration database from CDN
 * 
 * @param {boolean} forceRefresh - Force bypass cache and get latest
 * @returns {Promise<Object>} The calibration database
 */
async function loadCalibrationDatabase(forceRefresh = false) {
  console.log('📥 Loading calibration database from CDN...');
  
  try {
    // Check local cache first (if enabled and not forcing refresh)
    if (CDN_CONFIG.cacheEnabled && !forceRefresh) {
      const cached = getFromLocalCache();
      if (cached) {
        console.log('✅ Loaded from local cache');
        return cached;
      }
    }
    
    // Fetch from CDN
    const url = getCDNUrl(forceRefresh);
    console.log(`🌐 Fetching from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    if (!data.tv_models || !data.calibration_settings) {
      throw new Error('Invalid database structure');
    }
    
    // Save to local cache
    if (CDN_CONFIG.cacheEnabled) {
      saveToLocalCache(data);
    }
    
    console.log('✅ Database loaded successfully');
    console.log(`📊 Models: ${data.tv_models.length}, Settings: ${data.calibration_settings.length}`);
    console.log(`🕐 Last updated: ${data.last_updated}`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error loading from CDN:', error);
    
    // Try to use cached version as fallback
    const cached = getFromLocalCache();
    if (cached) {
      console.warn('⚠️ Using stale cached data as fallback');
      return cached;
    }
    
    throw new Error(`Failed to load calibration database: ${error.message}`);
  }
}

/**
 * Get data from browser localStorage cache
 */
function getFromLocalCache() {
  try {
    const cached = localStorage.getItem('calibration_db');
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    const age = Date.now() - timestamp;
    if (age > CDN_CONFIG.cacheDuration) {
      console.log('⏰ Cache expired');
      return null;
    }
    
    console.log(`⏱️ Cache age: ${Math.round(age / 60000)} minutes`);
    return data;
    
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Save data to browser localStorage cache
 */
function saveToLocalCache(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem('calibration_db', JSON.stringify(cacheData));
    console.log('💾 Saved to local cache');
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Clear local cache (useful for debugging)
 */
function clearCalibrationCache() {
  localStorage.removeItem('calibration_db');
  console.log('🗑️ Cache cleared');
}

/**
 * Get database last updated timestamp
 */
async function getDatabaseUpdateTime() {
  try {
    const data = await loadCalibrationDatabase();
    return new Date(data.last_updated);
  } catch (error) {
    return null;
  }
}

/**
 * Check if database needs updating
 * Returns true if local cache is older than server version
 */
async function checkForUpdates() {
  try {
    // Get cached version timestamp
    const cached = getFromLocalCache();
    if (!cached) return true; // No cache, needs update
    
    const cachedTime = new Date(cached.last_updated);
    
    // Fetch only headers to check last-modified
    const url = getCDNUrl(true);
    const response = await fetch(url, { method: 'HEAD' });
    const lastModified = response.headers.get('last-modified');
    
    if (!lastModified) return false; // Can't determine, assume current
    
    const serverTime = new Date(lastModified);
    
    return serverTime > cachedTime;
    
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

/**
 * Integration with existing API class
 * Add these methods to your APIService class in api.js
 */
const CDNIntegration = {
  /**
   * Initialize CDN data loader
   * Call this in your app's init() method
   */
  async init() {
    try {
      // Load database from CDN
      const database = await loadCalibrationDatabase();
      
      // Store in memory for quick access
      this.cachedDatabase = database;
      
      // Check for updates periodically (every hour)
      setInterval(async () => {
        const hasUpdates = await checkForUpdates();
        if (hasUpdates) {
          console.log('🔄 New calibrations available, refreshing...');
          await this.refresh();
        }
      }, 3600000); // 1 hour
      
      return database;
      
    } catch (error) {
      console.error('Failed to initialize CDN:', error);
      throw error;
    }
  },
  
  /**
   * Refresh database from CDN
   */
  async refresh() {
    try {
      const database = await loadCalibrationDatabase(true);
      this.cachedDatabase = database;
      
      // Trigger app-wide refresh event
      window.dispatchEvent(new CustomEvent('calibration-db-updated', {
        detail: { database }
      }));
      
      return database;
    } catch (error) {
      console.error('Failed to refresh database:', error);
      throw error;
    }
  },
  
  /**
   * Get TV models from CDN database
   */
  getAllModels() {
    return this.cachedDatabase?.tv_models || [];
  },
  
  /**
   * Get calibration settings from CDN database
   */
  getCalibrationSettings(modelId) {
    return this.cachedDatabase?.calibration_settings.filter(
      s => s.tv_model_id === modelId
    ) || [];
  },
  
  /**
   * Get database statistics
   */
  getStatistics() {
    return this.cachedDatabase?.statistics || {};
  }
};

/**
 * Example: Update your TVCalibrationApp initialization
 */
/*
class TVCalibrationApp {
  constructor() {
    this.currentView = 'home';
    this.currentUser = null;
    this.calibrationDB = null;
    this.init();
  }

  async init() {
    try {
      // Load calibration database from CDN
      this.calibrationDB = await CDNIntegration.init();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Listen for database updates
      window.addEventListener('calibration-db-updated', (event) => {
        this.calibrationDB = event.detail.database;
        this.showToast('📊 Calibration database updated!');
        // Refresh current view if needed
        if (this.currentView === 'mytvs' || this.currentView === 'calibrate') {
          this.loadView(this.currentView);
        }
      });
      
      // Load initial view
      this.loadView('home');
      
    } catch (error) {
      console.error('App initialization failed:', error);
      this.showToast('Failed to load calibration data. Please refresh.', 'error');
    }
  }
}
*/

// Export functions for use in your app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadCalibrationDatabase,
    clearCalibrationCache,
    getDatabaseUpdateTime,
    checkForUpdates,
    CDNIntegration
  };
}
