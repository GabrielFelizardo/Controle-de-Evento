/**
 * APP.JS v3.1.0
 * Inicialização principal do sistema
 * ✅ CORRIGIDO: Remoção de referências a API_CONFIG
 */

const App = {
  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  
  async init() {
    console.log('🚀 Iniciando Sistema de Controle de Presença v3.1.0...');
    
    try {
      // 1. Carrega configurações
      this.loadConfig();
      
      // 2. Inicializa storage
      this.initStorage();
      
      // 3. Verifica autenticação
      const isAuthenticated = await this.checkAuth();
      
      if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado');
        return;
      }
      
      // 4. Carrega dados
      await this.loadData();
      
      // 5. Inicializa UI
      this.initUI();
      
      // 6. Inicializa features extras
      this.initFeatures();
      
      // 7. Auto-save
      this.enableAutoSave();
      
      console.log('✅ Sistema inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      
      // Mostra erro para usuário
      if (typeof UICore !== 'undefined') {
        UICore.showError('Erro ao inicializar sistema: ' + error.message);
      } else {
        alert('Erro ao inicializar sistema: ' + error.message);
      }
    }
  },
  
  // ========================================
  // CONFIGURAÇÃO
  // ========================================
  
  loadConfig() {
    if (typeof CONFIG !== 'undefined') {
      console.log('⚙️ CONFIG carregado:', CONFIG.VERSION);
    } else {
      console.warn('⚠️ CONFIG não encontrado, usando valores padrão');
    }
  },
  
  // ========================================
  // STORAGE
  // ========================================
  
  initStorage() {
    if (typeof Storage !== 'undefined') {
      Storage.init();
      console.log('💾 Storage inicializado');
    } else {
      console.warn('⚠️ Storage não disponível');
    }
  },
  
  // ========================================
  // AUTENTICAÇÃO
  // ========================================
  
  async checkAuth() {
    if (typeof AuthSystem === 'undefined') {
      console.warn('⚠️ AuthSystem não disponível');
      return true; // Assume autenticado se não tem auth
    }
    
    // Verifica se já está autenticado
    if (AuthSystem.authenticated) {
      console.log('✅ Usuário já autenticado:', AuthSystem.userEmail);
      return true;
    }
    
    // Tenta auto-login
    const hasUser = localStorage.getItem('auth_user');
    if (hasUser) {
      console.log('🔄 Tentando auto-login...');
      // AuthSystem.init() já faz auto-login
      return AuthSystem.authenticated;
    }
    
    console.log('❌ Nenhum usuário autenticado');
    return false;
  },
  
  // ========================================
  // DADOS
  // ========================================
  
  async loadData() {
    if (typeof State === 'undefined') {
      console.warn('⚠️ State não disponível');
      return;
    }
    
    // Tenta carregar do localStorage primeiro
    if (typeof Storage !== 'undefined') {
      const loaded = Storage.load();
      if (loaded && State.events.length > 0) {
        console.log(`📊 ${State.events.length} evento(s) carregado(s) do localStorage`);
        return;
      }
    }
    
    // Se não tem dados locais, tenta carregar da API
    if (typeof API !== 'undefined') {
      try {
        const result = await API.listEvents();
        
        if (result.success && result.data) {
          State.events = result.data;
          console.log(`📊 ${State.events.length} evento(s) carregado(s) da API`);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar eventos da API:', error);
      }
    }
    
    // Se ainda não tem eventos, cria array vazio
    if (!State.events || State.events.length === 0) {
      State.events = [];
      console.log('📊 Nenhum evento encontrado, iniciando vazio');
    }
  },
  
  // ========================================
  // UI
  // ========================================
  
  initUI() {
    if (typeof UICore !== 'undefined') {
      UICore.init();
      console.log('🎨 UI inicializada');
    } else if (typeof UI !== 'undefined') {
      UI.init();
      console.log('🎨 UI (legacy) inicializada');
    } else {
      console.warn('⚠️ Sistema de UI não disponível');
    }
  },
  
  // ========================================
  // FEATURES
  // ========================================
  
  initFeatures() {
    // Autocompletar
    if (typeof NameAutocomplete !== 'undefined') {
      NameAutocomplete.init();
    }
    
    // Editable Tabs
    if (typeof EditableTabs !== 'undefined') {
      EditableTabs.init();
    }
    
    // Atalhos de teclado
    if (typeof KeyboardShortcuts !== 'undefined') {
      KeyboardShortcuts.init();
    }
    
    // Scroll detector
    if (typeof ScrollDetector !== 'undefined') {
      ScrollDetector.init();
    }
    
    // Error Handler
    if (typeof ErrorHandler !== 'undefined' && !ErrorHandler.enabled) {
      ErrorHandler.init();
    }
    
    // Sheet Sync
    if (typeof SheetSync !== 'undefined') {
      SheetSync.enable();
    }
    
    console.log('✨ Features extras inicializadas');
  },
  
  // ========================================
  // AUTO-SAVE
  // ========================================
  
  enableAutoSave() {
    if (typeof Storage === 'undefined') return;
    
    // Auto-save a cada 5 minutos
    setInterval(() => {
      Storage.save();
      this.updateAutoSaveIndicator();
    }, 300000); // 5 minutos
    
    // Auto-save ao fechar janela
    window.addEventListener('beforeunload', () => {
      Storage.save();
    });
    
    console.log('💾 Auto-save ativado');
  },
  
  updateAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save');
    if (!indicator) return;
    
    indicator.textContent = '✓ SINCRONIZADO';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
      indicator.style.opacity = '0.6';
    }, 2000);
  }
};

// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

// Aguarda DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    // Pequeno delay para garantir que tudo carregou
    setTimeout(() => {
      // AuthSystem inicia primeiro (se existir)
      if (typeof AuthSystem !== 'undefined') {
        AuthSystem.init();
      } else {
        // Se não tem auth, inicia app direto
        App.init();
      }
    }, 100);
  });
} else {
  // DOM já está pronto
  setTimeout(() => {
    if (typeof AuthSystem !== 'undefined') {
      AuthSystem.init();
    } else {
      App.init();
    }
  }, 100);
}

// Exporta globalmente
window.App = App;

console.log('✅ App v3.1.0 carregado');
