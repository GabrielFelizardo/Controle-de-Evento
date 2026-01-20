/**
 * ERROR HANDLER v3.1.0
 * Sistema centralizado de tratamento e log de erros
 * ✅ CORRIGIDO: Removida duplicação de declaração
 */

// Verifica se já foi declarado (evita duplicação)
if (typeof window.ErrorHandler === 'undefined') {
  
  window.ErrorHandler = {
    // ========================================
    // CONFIGURAÇÃO
    // ========================================
    
    enabled: true,
    maxLogs: 100,
    logs: [],
    
    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    
    init() {
      this.loadLogs();
      this.attachGlobalHandlers();
      console.log('🛡️ Error Handler v3.1.0 inicializado');
    },
    
    // ========================================
    // HANDLERS GLOBAIS
    // ========================================
    
    attachGlobalHandlers() {
      // Erros não capturados
      window.addEventListener('error', (event) => {
        this.handleError({
          type: 'Uncaught Error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });
      
      // Promises rejeitadas não tratadas
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          type: 'Unhandled Promise Rejection',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        });
      });
    },
    
    // ========================================
    // TRATAMENTO DE ERROS
    // ========================================
    
    handleError(error) {
      if (!this.enabled) return;
      
      const errorLog = {
        timestamp: new Date().toISOString(),
        type: error.type || 'Error',
        message: error.message || 'Unknown error',
        filename: error.filename || '',
        lineno: error.lineno || 0,
        colno: error.colno || 0,
        stack: error.stack || '',
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Adiciona ao log
      this.logs.push(errorLog);
      
      // Limita tamanho do log
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      
      // Salva
      this.saveLogs();
      
      // Log no console
      console.error('🔴 Error Handler:', errorLog);
      
      // Notifica usuário (se erro crítico)
      if (this.isCritical(error)) {
        this.notifyUser(error);
      }
    },
    
    // ========================================
    // CLASSIFICAÇÃO
    // ========================================
    
    isCritical(error) {
      const criticalKeywords = [
        'cannot read',
        'undefined is not',
        'null is not',
        'failed to fetch',
        'network error'
      ];
      
      const message = (error.message || '').toLowerCase();
      
      return criticalKeywords.some(keyword => message.includes(keyword));
    },
    
    // ========================================
    // NOTIFICAÇÃO
    // ========================================
    
    notifyUser(error) {
      if (typeof UICore !== 'undefined' && UICore.showError) {
        const userMessage = this.getUserFriendlyMessage(error);
        UICore.showError(userMessage);
      }
    },
    
    getUserFriendlyMessage(error) {
      const message = error.message || '';
      
      // Mapeia erros técnicos para mensagens amigáveis
      if (message.includes('fetch')) {
        return 'Erro de conexão. Verifique sua internet.';
      }
      
      if (message.includes('undefined')) {
        return 'Erro interno. Tente recarregar a página.';
      }
      
      if (message.includes('timeout')) {
        return 'Operação demorou muito. Tente novamente.';
      }
      
      return 'Ocorreu um erro. Tente novamente.';
    },
    
    // ========================================
    // PERSISTÊNCIA
    // ========================================
    
    saveLogs() {
      try {
        const logsToSave = this.logs.slice(-this.maxLogs);
        localStorage.setItem('error_logs', JSON.stringify(logsToSave));
      } catch (error) {
        console.warn('Erro ao salvar logs:', error);
      }
    },
    
    loadLogs() {
      try {
        const saved = localStorage.getItem('error_logs');
        if (saved) {
          this.logs = JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Erro ao carregar logs:', error);
        this.logs = [];
      }
    },
    
    // ========================================
    // UTILITIES
    // ========================================
    
    getLogs() {
      return [...this.logs];
    },
    
    clearLogs() {
      this.logs = [];
      localStorage.removeItem('error_logs');
      console.log('🗑️ Logs de erro limpos');
    },
    
    exportLogs() {
      const data = JSON.stringify(this.logs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-logs-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log('📥 Logs exportados');
    },
    
    getStats() {
      const stats = {
        total: this.logs.length,
        byType: {},
        recent: this.logs.slice(-10)
      };
      
      this.logs.forEach(log => {
        stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      });
      
      return stats;
    }
  };
  
  console.log('✅ ErrorHandler v3.1.0 definido');
  
} else {
  console.log('ℹ️ ErrorHandler já existe, pulando redefinição');
}

// Auto-inicializa se DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ErrorHandler && window.ErrorHandler.init) {
      window.ErrorHandler.init();
    }
  });
} else {
  if (window.ErrorHandler && window.ErrorHandler.init) {
    window.ErrorHandler.init();
  }
}
