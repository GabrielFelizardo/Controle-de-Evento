/**
 * ERROR HANDLER - v1.0
 * Sistema global de tratamento de erros
 * ✅ Captura erros, salva estado e notifica usuário
 */

"use strict";

const ErrorHandler = {
  // Histórico de erros (máximo 50)
  errorLog: [],
  maxLogSize: 50,
  
  /**
   * Inicializa handlers globais
   */
  init() {
    // Captura erros JavaScript
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
    });
    
    // Captura promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason,
        promise: event.promise,
        stack: event.reason?.stack
      });
    });
    
    console.log('🛡️ Error Handler inicializado');
  },
  
  /**
   * Processa erro capturado
   */
  handleError(errorInfo) {
    // Log no console
    console.error('💥 Erro capturado:', errorInfo);
    
    // Adiciona ao histórico
    this.addToLog({
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Salva estado de emergência
    this.saveEmergencyState();
    
    // Notifica usuário (se UI disponível)
    this.showUserNotification(errorInfo);
    
    // Envia para analytics (opcional)
    // this.sendToAnalytics(errorInfo);
  },
  
  /**
   * Adiciona erro ao log
   */
  addToLog(error) {
    this.errorLog.unshift(error);
    
    // Limita tamanho do log
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
    
    // Salva em localStorage para debug
    try {
      localStorage.setItem('error_log', JSON.stringify(this.errorLog));
    } catch (e) {
      console.warn('Não foi possível salvar log de erros');
    }
  },
  
  /**
   * Salva estado atual antes de crash
   */
  saveEmergencyState() {
    try {
      if (typeof State !== 'undefined' && State.events) {
        const snapshot = {
          version: '3.1',
          timestamp: new Date().toISOString(),
          events: State.events,
          isEmergencyBackup: true
        };
        
        localStorage.setItem('emergency_backup', JSON.stringify(snapshot));
        console.log('💾 Estado de emergência salvo');
      }
    } catch (e) {
      console.error('❌ Falha ao salvar estado de emergência:', e);
    }
  },
  
  /**
   * Mostra notificação para o usuário
   */
  showUserNotification(errorInfo) {
    // Não mostra notificação se estiver em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }
    
    // Cria notificação visual
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #ff3333 0%, #ff5555 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(255, 51, 51, 0.4);
      z-index: 100000;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      border: 2px solid white;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">⚠️</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">Ops! Algo deu errado</div>
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">
            ${this.getUserFriendlyMessage(errorInfo)}
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="location.reload()" style="
              background: white;
              color: #ff3333;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              font-size: 12px;
            ">
              RECARREGAR
            </button>
            <button onclick="this.closest('div[style]').remove()" style="
              background: rgba(255,255,255,0.2);
              color: white;
              border: 1px solid white;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            ">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Adiciona animação
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove automaticamente após 10 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  },
  
  /**
   * Converte erro técnico em mensagem amigável
   */
  getUserFriendlyMessage(errorInfo) {
    const message = errorInfo.message?.toLowerCase() || '';
    
    // Erros de rede
    if (message.includes('fetch') || message.includes('network')) {
      return 'Problema de conexão. Verifique sua internet.';
    }
    
    // Erros da API
    if (message.includes('api') || message.includes('spreadsheet')) {
      return 'Erro ao sincronizar com Google Sheets. Suas alterações foram salvas localmente.';
    }
    
    // Erros de localStorage
    if (message.includes('quota') || message.includes('storage')) {
      return 'Memória do navegador cheia. Faça backup e limpe dados antigos.';
    }
    
    // Erro genérico
    return 'Um erro inesperado ocorreu. Seus dados foram salvos.';
  },
  
  /**
   * Verifica se há backup de emergência
   */
  hasEmergencyBackup() {
    try {
      const backup = localStorage.getItem('emergency_backup');
      return !!backup;
    } catch {
      return false;
    }
  },
  
  /**
   * Restaura backup de emergência
   */
  restoreEmergencyBackup() {
    try {
      const backup = localStorage.getItem('emergency_backup');
      if (!backup) {
        return { success: false, error: 'Nenhum backup encontrado' };
      }
      
      const data = JSON.parse(backup);
      
      if (typeof State !== 'undefined' && State.importState) {
        State.importState(data);
        
        if (typeof Storage !== 'undefined' && Storage.save) {
          Storage.save();
        }
        
        // Limpa backup de emergência após restaurar
        localStorage.removeItem('emergency_backup');
        
        return { 
          success: true, 
          message: 'Backup de emergência restaurado com sucesso',
          timestamp: data.timestamp
        };
      }
      
      return { success: false, error: 'Sistema ainda não carregado' };
      
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Mostra console de debug
   */
  showDebugConsole() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h2 class="modal-title">🐛 DEBUG CONSOLE</h2>
        </div>
        
        <div style="padding: var(--space-4);">
          <h3 style="margin-bottom: 1rem;">Últimos Erros (${this.errorLog.length})</h3>
          
          <div style="max-height: 400px; overflow-y: auto; background: #1a1a1a; color: #00ff00; padding: var(--space-2); font-family: monospace; font-size: 12px; border-radius: 4px;">
            ${this.errorLog.length === 0 ? 
              '<div style="color: #666;">Nenhum erro registrado</div>' :
              this.errorLog.map((err, idx) => `
                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #333;">
                  <div style="color: #ff6666;">[${idx + 1}] ${err.type}</div>
                  <div style="color: #ffff66;">${new Date(err.timestamp).toLocaleString()}</div>
                  <div style="margin-top: 4px;">${err.message}</div>
                  ${err.stack ? `<div style="color: #666; margin-top: 4px; font-size: 11px;">${err.stack.split('\n').slice(0, 3).join('\n')}</div>` : ''}
                </div>
              `).join('')
            }
          </div>
          
          <div style="margin-top: var(--space-3); display: flex; gap: var(--space-2);">
            <button class="btn btn-small" onclick="ErrorHandler.clearLog()">
              LIMPAR LOG
            </button>
            <button class="btn btn-small" onclick="ErrorHandler.exportLog()">
              EXPORTAR LOG
            </button>
            ${this.hasEmergencyBackup() ? `
              <button class="btn btn-small btn-success" onclick="ErrorHandler.restoreEmergencyBackup(); location.reload();">
                RESTAURAR BACKUP
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()" style="grid-column: 1 / -1;">
            FECHAR
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  /**
   * Limpa log de erros
   */
  clearLog() {
    this.errorLog = [];
    localStorage.removeItem('error_log');
    console.log('✅ Log de erros limpo');
    alert('Log de erros limpo com sucesso!');
  },
  
  /**
   * Exporta log como arquivo
   */
  exportLog() {
    const data = {
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      errors: this.errorLog
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ Log exportado');
  }
};

// Inicializa automaticamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
  ErrorHandler.init();
}

// Exporta globalmente
window.ErrorHandler = ErrorHandler;

// Comando de debug no console
console.log('🛡️ Error Handler carregado');
console.log('💡 Use ErrorHandler.showDebugConsole() para ver erros');
