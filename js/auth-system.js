/**
 * SISTEMA DE AUTENTICAÇÃO v3.1.0
 * Gerencia login/logout via Google
 * ✅ CORRIGIDO: try-catch em autoLogin
 */

const AuthSystem = {
  // ========================================
  // ESTADO
  // ========================================
  
  currentUser: null,
  isAuthenticated: false,
  
  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  
  /**
   * Inicializa sistema de autenticação
   */
  init() {
    console.log('🔐 Inicializando autenticação...');
    
    try {
      this.loadSavedUser();
      this.attachLoginListeners();
      
      if (this.currentUser) {
        this.autoLogin();
      } else {
        this.showLoginScreen();
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error);
      this.showLoginScreen();
    }
  },
  
  /**
   * Carrega usuário salvo
   */
  loadSavedUser() {
    try {
      const saved = localStorage.getItem('auth_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
        console.log('👤 Usuário salvo encontrado:', this.currentUser.email);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar usuário salvo:', error);
      localStorage.removeItem('auth_user');
    }
  },
  
  // ========================================
  // LOGIN
  // ========================================
  
  /**
   * Auto-login com usuário salvo
   * ✅ CORRIGIDO: adicionado try-catch
   */
  async autoLogin() {
    if (!this.currentUser || !this.currentUser.email) {
      this.showLoginScreen();
      return;
    }
    
    try {
      console.log('🔄 Tentando auto-login...');
      
      // Mostra loading
      this.showLoading('Conectando...');
      
      // Valida com API
      const response = await API.validateUser(this.currentUser.email);
      
      if (response.success) {
        this.isAuthenticated = true;
        this.hideLoginScreen();
        this.showMainApp();
        
        console.log('✅ Auto-login bem-sucedido');
      } else {
        throw new Error(response.error || 'Falha na validação');
      }
      
    } catch (error) {
      console.error('❌ Erro no auto-login:', error);
      
      // Limpa dados corrompidos
      this.logout(false);
      
      // Mostra tela de login
      this.showLoginScreen();
      
      // Notifica usuário
      if (typeof UICore !== 'undefined') {
        UICore.showError('Sessão expirada. Faça login novamente.');
      } else {
        alert('Sessão expirada. Faça login novamente.');
      }
    }
  },
  
  /**
   * Login manual
   */
  async login(email) {
    if (!email || !this.validateEmail(email)) {
      this.showError('Email inválido!');
      return false;
    }
    
    try {
      this.showLoading('Autenticando...');
      
      const response = await API.validateUser(email);
      
      if (response.success) {
        this.currentUser = {
          email: email,
          name: response.data?.name || email.split('@')[0],
          loginAt: new Date().toISOString()
        };
        
        this.isAuthenticated = true;
        
        // Salva no localStorage
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
        
        this.hideLoginScreen();
        this.showMainApp();
        
        console.log('✅ Login bem-sucedido:', email);
        return true;
        
      } else {
        throw new Error(response.error || 'Email não autorizado');
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      this.showError(error.message);
      return false;
    }
  },
  
  // ========================================
  // LOGOUT
  // ========================================
  
  /**
   * Logout
   */
  logout(showMessage = true) {
    try {
      this.currentUser = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('auth_user');
      
      this.showLoginScreen();
      this.hideMainApp();
      
      if (showMessage) {
        if (typeof UICore !== 'undefined') {
          UICore.showNotification('Logout realizado', 'success');
        }
      }
      
      console.log('👋 Logout realizado');
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  },
  
  /**
   * Troca de conta
   */
  async switchAccount() {
    const confirmed = confirm('Deseja trocar de conta?\n\nVocê será desconectado e precisará fazer login novamente.');
    
    if (confirmed) {
      this.logout(false);
    }
  },
  
  // ========================================
  // UI
  // ========================================
  
  /**
   * Mostra tela de login
   */
  showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('active');
    }
  },
  
  /**
   * Esconde tela de login
   */
  hideLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.remove('active');
    }
  },
  
  /**
   * Mostra app principal
   */
  showMainApp() {
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
      mainApp.style.display = 'block';
    }
    
    // Atualiza info do usuário
    this.updateUserInfo();
    
    // Inicializa app
    if (typeof App !== 'undefined' && App.init) {
      App.init();
    }
  },
  
  /**
   * Esconde app principal
   */
  hideMainApp() {
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
      mainApp.style.display = 'none';
    }
  },
  
  /**
   * Atualiza informações do usuário na UI
   */
  updateUserInfo() {
    if (!this.currentUser) return;
    
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    
    if (userNameEl) {
      userNameEl.textContent = this.currentUser.name || 'Usuário';
    }
    
    if (userEmailEl) {
      userEmailEl.textContent = this.currentUser.email;
    }
  },
  
  /**
   * Mostra loading
   */
  showLoading(message = 'Carregando...') {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.style.opacity = '0.5';
      loginForm.style.pointerEvents = 'none';
    }
    
    const statusEl = document.getElementById('login-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = 'var(--accent-primary)';
    }
  },
  
  /**
   * Mostra erro
   */
  showError(message) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.style.opacity = '1';
      loginForm.style.pointerEvents = 'auto';
    }
    
    const statusEl = document.getElementById('login-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = 'var(--accent-danger)';
    }
    
    // Limpa depois de 5 segundos
    setTimeout(() => {
      if (statusEl) statusEl.textContent = '';
    }, 5000);
  },
  
  // ========================================
  // EVENT LISTENERS
  // ========================================
  
  /**
   * Anexa listeners de login
   */
  attachLoginListeners() {
    // Botão de login
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLoginClick());
    }
    
    // Enter no input
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleLoginClick();
        }
      });
    }
    
    // Botão de logout (se existir)
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },
  
  /**
   * Handler do clique no login
   */
  async handleLoginClick() {
    const emailInput = document.getElementById('email-input');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    await this.login(email);
  },
  
  // ========================================
  // VALIDAÇÃO
  // ========================================
  
  /**
   * Valida email
   */
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // ========================================
  // GETTERS
  // ========================================
  
  /**
   * Retorna se está autenticado
   */
  get authenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  },
  
  /**
   * Retorna email do usuário atual
   */
  get userEmail() {
    return this.currentUser?.email || null;
  },
  
  /**
   * Retorna nome do usuário atual
   */
  get userName() {
    return this.currentUser?.name || null;
  }
};

// Exporta globalmente
window.AuthSystem = AuthSystem;

console.log('🔐 Auth System v3.1.0 carregado');
