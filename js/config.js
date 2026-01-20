/**
 * CONFIG v3.1.1
 */

const CONFIG = {
  VERSION: '3.1.1',
  BUILD_DATE: '2025-01-20',
  BUILD_TYPE: 'stable',
  
  API: {
    DEFAULT_URL: 'https://script.google.com/macros/s/AKfycbxsGjeJ_KnQIFlwKpZiCfA4YYGYucBcCbJWyyt8dBX-40YNOeK1O04oxeyDLwFZrwH4ig/exec',
    
    get CURRENT_URL() {
      return localStorage.getItem('apiUrl') || this.DEFAULT_URL;
    },
    
    set CURRENT_URL(url) {
      localStorage.setItem('apiUrl', url);
    },
    
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },
  
  STORAGE: {
    KEY: 'presenca_data_v3',
    AUTO_BACKUP: true,
    BACKUP_INTERVAL: 300000,
    COMPRESS: true
  },
  
  UI: {
    THEME: 'light',
    ANIMATIONS_ENABLED: true,
    COMPACT_MODE: false,
    NOTIFICATIONS_DURATION: 3000,
    SHOW_AUTO_SAVE_INDICATOR: true
  },
  
  FEATURES: {
    AUTOCOMPLETE: true,
    AUTOCOMPLETE_MIN_CHARS: 2,
    QR_SYNC: true,
    CLOUD_BACKUP: true,
    EDITABLE_TABS: true,
    COLUMN_TEMPLATES: true,
    ADVANCED_STATS: true
  },
  
  VALIDATION: {
    REQUIRED_FIELDS: ['name'],
    MAX_NAME_LENGTH: 100,
    MAX_NOTE_LENGTH: 500,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[0-9]{10,11}$/
  },
  
  get(path) {
    const keys = path.split('.');
    let value = this;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    
    return value;
  },
  
  set(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = this;
    
    for (const key of keys) {
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }
    
    obj[lastKey] = newValue;
    this.saveUserPreferences();
  },
  
  saveUserPreferences() {
    const prefs = {
      theme: this.UI.THEME,
      compactMode: this.UI.COMPACT_MODE,
      apiUrl: this.API.CURRENT_URL,
      autocomplete: this.FEATURES.AUTOCOMPLETE
    };
    
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
  },
  
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('user_preferences');
      if (!saved) return;
      
      const prefs = JSON.parse(saved);
      
      if (prefs.theme) this.UI.THEME = prefs.theme;
      if (prefs.compactMode !== undefined) this.UI.COMPACT_MODE = prefs.compactMode;
      if (prefs.apiUrl) this.API.CURRENT_URL = prefs.apiUrl;
      if (prefs.autocomplete !== undefined) this.FEATURES.AUTOCOMPLETE = prefs.autocomplete;
      
      console.log('✅ Preferências carregadas');
    } catch (error) {
      console.warn('⚠️ Erro ao carregar preferências:', error);
    }
  },
  
  resetToDefault() {
    localStorage.removeItem('user_preferences');
    localStorage.removeItem('apiUrl');
    console.log('🔄 Configurações resetadas');
  }
};

CONFIG.loadUserPreferences();
window.CONFIG = CONFIG;
console.log(`⚙️ CONFIG v${CONFIG.VERSION} carregado`);
