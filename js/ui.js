/**
 * UI.JS v3.1 - Interface do Usuário
 * ✅ VERSÃO CONSOLIDADA - SEM DUPLICAÇÕES
 * Renderiza e manipula DOM do sistema
 */

"use strict";

const UI = {
  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  /**
   * Renderiza a UI completa do evento atual
   */
  render() {
    const event = State.getCurrentEvent();
    
    if (!event) {
      this.renderEmptyState();
      return;
    }
    
    const container = document.getElementById('event-content');
    if (!container) return;
    
    container.innerHTML = `
      <!-- ESTATÍSTICAS -->
      <div class="stats-grid">
        ${this.renderStats(event)}
      </div>
      
      <!-- ESCOLHA DO MÉTODO -->
      <div class="choice-section section" id="choice-section">
        <div class="section-header">
          <h2 class="heading-2">COMO ADICIONAR CONVIDADOS?</h2>
        </div>
        ${this.renderChoiceCards()}
      </div>
      
      <!-- SEÇÃO DE IMPORTAÇÃO -->
      <div class="import-section" id="import-section">
        ${this.renderImportSection(event)}
      </div>
      
      <!-- SEÇÃO MANUAL -->
      <div class="manual-section" id="manual-section">
        ${this.renderManualSection(event)}
      </div>
      
      <!-- TABELA DE CONVIDADOS -->
      ${this.renderGuestsTable(event)}
    `;
    
    this.attachEventListeners();
  },
  
  /**
   * Renderiza estado vazio (nenhum evento)
   */
  renderEmptyState() {
    const container = document.getElementById('event-content');
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: var(--space-8) var(--space-4);">
        <div style="font-size: 64px; margin-bottom: var(--space-4); opacity: 0.3;">📋</div>
        <h2 class="heading-2" style="margin-bottom: var(--space-2);">
          NENHUM EVENTO CRIADO
        </h2>
        <p class="body-text-small" style="margin-bottom: var(--space-4);">
          Clique no botão abaixo para criar seu primeiro evento
        </p>
        <button class="btn btn-primary" data-action="new-event">
          + CRIAR PRIMEIRO EVENTO
        </button>
      </div>
    `;
  },
  
  // ========================================
  // ESTATÍSTICAS
  // ========================================
  
  renderStats(event) {
    const stats = this.calculateStats(event);
    
    return `
      <div class="stat-card">
        <div class="label">TOTAL</div>
        <div class="stat-value">${stats.total}</div>
        <div class="stat-meta">CONVIDADOS</div>
      </div>
      
      <div class="stat-card success">
        <div class="label">CONFIRMADOS</div>
        <div class="stat-value">${stats.confirmed}</div>
        <div class="stat-meta">${stats.confirmedPercent}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.confirmedPercent}%"></div>
        </div>
      </div>
      
      <div class="stat-card danger">
        <div class="label">RECUSAS</div>
        <div class="stat-value">${stats.rejected}</div>
        <div class="stat-meta">${stats.rejectedPercent}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.rejectedPercent}%; background: var(--accent-danger);"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="label">PENDENTES</div>
        <div class="stat-value">${stats.pending}</div>
        <div class="stat-meta">${stats.pendingPercent}%</div>
      </div>
    `;
  },
  
  calculateStats(event) {
    const total = event.guests.length;
    const confirmed = event.guests.filter(g => g.status === 'yes').length;
    const rejected = event.guests.filter(g => g.status === 'no').length;
    const pending = event.guests.filter(g => g.status === 'pending').length;
    
    return {
      total,
      confirmed,
      rejected,
      pending,
      confirmedPercent: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      rejectedPercent: total > 0 ? Math.round((rejected / total) * 100) : 0,
      pendingPercent: total > 0 ? Math.round((pending / total) * 100) : 0
    };
  },
  
  // ========================================
  // CARDS DE ESCOLHA
  // ========================================
  
  renderChoiceCards() {
    return `
      <div class="choice-grid">
        <div class="choice-card" data-choice="manual">
          <div class="choice-icon">✍️</div>
          <div class="choice-title">MANUAL</div>
          <div class="choice-description">
            Adicione convidados um por um através de formulário
          </div>
        </div>
        
        <div class="choice-card" data-choice="import">
          <div class="choice-icon">📋</div>
          <div class="choice-title">IMPORTAR</div>
          <div class="choice-description">
            Cole uma lista de nomes e o sistema organiza automaticamente
          </div>
        </div>
      </div>
    `;
  },
  
  // ========================================
  // SEÇÃO DE IMPORTAÇÃO
  // ========================================
  
  renderImportSection(event) {
    return `
      <div class="section-header">
        <h2 class="heading-2">IMPORTAR LISTA</h2>
      </div>
      
      <div class="form-group">
        <label class="label">COLE SUA LISTA AQUI</label>
        <textarea 
          id="import-textarea" 
          class="input" 
          rows="10" 
          placeholder="Cole aqui sua lista de nomes (um por linha)
          
Exemplo:
João Silva
Maria Santos
Pedro Oliveira"></textarea>
        
        <div class="help-note">
          <p class="body-text-small">
            💡 <strong>Dica:</strong> Cole uma lista com um nome por linha. 
            O sistema vai processar e adicionar automaticamente.
          </p>
        </div>
      </div>
      
      <div class="action-bar">
        <button class="btn btn-success" data-action="import-list">
          IMPORTAR LISTA
        </button>
        <button class="btn" data-action="cancel-import">
          CANCELAR
        </button>
      </div>
    `;
  },
  
  // ========================================
  // SEÇÃO MANUAL (CONSOLIDADA - SEM DUPLICAÇÃO)
  // ========================================
  
  /**
   * Renderiza seção manual consolidada
   * ✅ Versão única combinando ui.js + usability-fixes.js
   */
  renderManualSection(event) {
    const fields = event.customFields || [];
    
    return `
      <div class="section-header">
        <h2 class="heading-2">ADICIONAR MANUALMENTE</h2>
      </div>
      
      <div id="manual-entries">
        ${this.renderManualEntry(0, fields)}
      </div>
      
      <div class="action-bar" style="margin-top: var(--space-3);">
        <button class="btn btn-success" data-action="save-manual">
          ✓ ADICIONAR CONVIDADO
        </button>
        <button class="btn" data-action="add-more-rows">
          + ADICIONAR MAIS CAMPOS
        </button>
        <button class="btn" data-action="cancel-manual">
          CANCELAR
        </button>
      </div>
      
      <div class="help-note" style="margin-top: var(--space-3);">
        <p class="body-text-small">
          💡 <strong>Dica:</strong> Preencha os campos e clique em "Adicionar Convidado". 
          Use "Adicionar Mais Campos" para criar linhas extras se precisar adicionar vários de uma vez.
        </p>
      </div>
    `;
  },
  
  /**
   * Renderiza uma linha de entrada manual
   */
  renderManualEntry(index, fields) {
    const baseFields = `
      <div class="manual-entry-row" data-entry-index="${index}">
        <div class="form-group">
          <label class="label">NOME COMPLETO *</label>
          <input 
            type="text" 
            class="input manual-name" 
            data-index="${index}"
            placeholder="Ex: João Silva"
            required
          >
        </div>
        
        <div class="form-group">
          <label class="label">TELEFONE</label>
          <input 
            type="tel" 
            class="input manual-phone" 
            data-index="${index}"
            placeholder="(00) 00000-0000"
          >
        </div>
        
        <div class="form-group">
          <label class="label">EMAIL</label>
          <input 
            type="email" 
            class="input manual-email" 
            data-index="${index}"
            placeholder="email@exemplo.com"
          >
        </div>
    `;
    
    // Campos customizados
    let customFieldsHTML = '';
    if (fields && fields.length > 0) {
      customFieldsHTML = fields.map(field => `
        <div class="form-group">
          <label class="label">${field.name.toUpperCase()}</label>
          <input 
            type="text" 
            class="input manual-custom" 
            data-index="${index}"
            data-field-key="${field.key}"
            placeholder="${field.placeholder || ''}"
          >
        </div>
      `).join('');
    }
    
    return baseFields + customFieldsHTML + `</div>`;
  },
  
  // ========================================
  // TABELA DE CONVIDADOS
  // ========================================
  
  renderGuestsTable(event) {
    if (!event.guests || event.guests.length === 0) {
      return `
        <div class="section" style="text-align: center; padding: var(--space-6);">
          <p class="body-text-small" style="opacity: 0.5;">
            Nenhum convidado adicionado ainda.
          </p>
        </div>
      `;
    }
    
    return `
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">LISTA DE CONVIDADOS (${event.guests.length})</h3>
          <input 
            type="text" 
            class="search-input" 
            id="search-guests"
            placeholder="🔍 BUSCAR CONVIDADO..."
          >
        </div>
        
        <div class="table-wrapper">
          ${this.renderGuestsList(event)}
        </div>
        
        <div class="table-footer">
          <div class="footer-info">
            TOTAL: ${event.guests.length} CONVIDADOS
          </div>
          <div class="footer-actions">
            <button class="btn btn-small" data-action="select-all">
              SELECIONAR TODOS
            </button>
            <button class="btn btn-small btn-success" data-action="confirm-all">
              ✓ CONFIRMAR TODOS
            </button>
            <button class="btn btn-small btn-danger" data-action="reject-all">
              ✗ RECUSAR TODOS
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Renderiza lista de convidados (delegado para ui-guests.js)
   */
  renderGuestsList(event) {
    // Se ui-guests.js estiver carregado, usa ele
    if (typeof UIGuests !== 'undefined' && UIGuests.renderList) {
      return UIGuests.renderList(event);
    }
    
    // Fallback simples
    return event.guests.map(guest => this.renderGuestCard(guest, event)).join('');
  },
  
  /**
   * Renderiza card individual de convidado (fallback)
   */
  renderGuestCard(guest, event) {
    const statusBadge = {
      'yes': '<span class="status-badge yes">✓ CONFIRMADO</span>',
      'no': '<span class="status-badge no">✗ RECUSOU</span>',
      'pending': '<span class="status-badge pending">⏳ PENDENTE</span>'
    }[guest.status] || '';
    
    return `
      <div class="guest-card" data-guest-id="${guest.id}" data-status="${guest.status}">
        <div class="guest-name">
          ${guest.name}
          ${statusBadge}
        </div>
        
        <div class="guest-fields">
          ${guest.phone ? `<div>📞 ${guest.phone}</div>` : ''}
          ${guest.email ? `<div>📧 ${guest.email}</div>` : ''}
        </div>
        
        <div class="guest-actions">
          <button class="btn btn-small btn-success" data-action="confirm-guest" data-guest-id="${guest.id}">
            ✓ CONFIRMAR
          </button>
          <button class="btn btn-small btn-danger" data-action="reject-guest" data-guest-id="${guest.id}">
            ✗ RECUSAR
          </button>
          <button class="btn btn-small" data-action="edit-guest" data-guest-id="${guest.id}">
            ✏️ EDITAR
          </button>
        </div>
      </div>
    `;
  },
  
  // ========================================
  // MODAIS
  // ========================================
  
  /**
   * Abre modal genérico
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.warn(`Modal ${modalId} não encontrado`);
      return;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Fecha modal genérico
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
  },
  
  /**
   * Fecha todos os modais
   */
  closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  },
  
  /**
   * Mostra modal de confirmação
   */
  showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    const titleEl = modal.querySelector('#confirm-title');
    const messageEl = modal.querySelector('#confirm-message');
    const confirmBtn = modal.querySelector('#confirm-action');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    // Remove listeners antigos
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.replaceWith(newConfirmBtn);
    
    // Adiciona novo listener
    newConfirmBtn.addEventListener('click', () => {
      this.closeModal('confirm-modal');
      if (onConfirm) onConfirm();
    });
    
    this.openModal('confirm-modal');
  },
  
  // ========================================
  // NOTIFICAÇÕES
  // ========================================
  
  /**
   * Mostra notificação toast
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? 'var(--accent-success)' : type === 'error' ? 'var(--accent-danger)' : 'var(--black)'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      font-weight: bold;
      font-size: 14px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
  
  // ========================================
  // EVENT LISTENERS
  // ========================================
  
  attachEventListeners() {
    // Choice cards
    document.querySelectorAll('.choice-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const choice = card.dataset.choice;
        this.handleChoiceSelection(choice);
      });
    });
    
    // Botões de ação
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        this.handleAction(action, btn);
      });
    });
    
    // Busca de convidados
    const searchInput = document.getElementById('search-guests');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterGuests(e.target.value);
      });
    }
    
    // Fechar modal ao clicar no fundo
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
    
    // Botões de cancelar modal
    document.querySelectorAll('[data-modal-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });
  },
  
  /**
   * Trata seleção de método (Manual/Import)
   */
  handleChoiceSelection(choice) {
    const choiceSection = document.getElementById('choice-section');
    const importSection = document.getElementById('import-section');
    const manualSection = document.getElementById('manual-section');
    
    if (choice === 'import') {
      choiceSection.style.display = 'none';
      importSection.classList.add('active');
      manualSection.classList.remove('active');
    } else if (choice === 'manual') {
      choiceSection.style.display = 'none';
      manualSection.classList.add('active');
      importSection.classList.remove('active');
    }
  },
  
  /**
   * Trata ações gerais
   */
  handleAction(action, button) {
    const handlers = {
      'cancel-import': () => this.cancelImport(),
      'cancel-manual': () => this.cancelManual(),
      'import-list': () => this.importList(),
      'save-manual': () => this.saveManualGuest(),
      'add-more-rows': () => this.addMoreManualRows(),
      'select-all': () => this.selectAllGuests(),
      'confirm-all': () => this.confirmAllGuests(),
      'reject-all': () => this.rejectAllGuests()
    };
    
    const handler = handlers[action];
    if (handler) {
      handler();
    } else {
      console.warn(`Ação não implementada: ${action}`);
    }
  },
  
  // ========================================
  // AÇÕES ESPECÍFICAS
  // ========================================
  
  cancelImport() {
    document.getElementById('import-section').classList.remove('active');
    document.getElementById('choice-section').style.display = 'block';
    document.getElementById('import-textarea').value = '';
  },
  
  cancelManual() {
    document.getElementById('manual-section').classList.remove('active');
    document.getElementById('choice-section').style.display = 'block';
    document.getElementById('manual-entries').innerHTML = this.renderManualEntry(0, State.getCurrentEvent()?.customFields || []);
  },
  
  async importList() {
    const textarea = document.getElementById('import-textarea');
    const text = textarea.value.trim();
    
    if (!text) {
      this.showNotification('Cole uma lista de nomes primeiro', 'error');
      return;
    }
    
    const names = text.split('\n').filter(name => name.trim());
    
    if (names.length === 0) {
      this.showNotification('Nenhum nome válido encontrado', 'error');
      return;
    }
    
    // Adiciona cada nome
    for (const name of names) {
      await State.addGuest({
        name: name.trim(),
        status: 'pending'
      });
    }
    
    this.showNotification(`${names.length} convidado(s) importado(s) com sucesso!`, 'success');
    this.cancelImport();
    this.render();
  },
  
  async saveManualGuest() {
    const entries = document.querySelectorAll('.manual-entry-row');
    let added = 0;
    
    for (const entry of entries) {
      const index = entry.dataset.entryIndex;
      const name = entry.querySelector(`.manual-name[data-index="${index}"]`)?.value.trim();
      
      if (!name) continue;
      
      const phone = entry.querySelector(`.manual-phone[data-index="${index}"]`)?.value.trim() || '';
      const email = entry.querySelector(`.manual-email[data-index="${index}"]`)?.value.trim() || '';
      
      await State.addGuest({
        name,
        phone,
        email,
        status: 'pending'
      });
      
      added++;
    }
    
    if (added > 0) {
      this.showNotification(`${added} convidado(s) adicionado(s)!`, 'success');
      this.cancelManual();
      this.render();
    } else {
      this.showNotification('Preencha ao menos o nome', 'error');
    }
  },
  
  addMoreManualRows() {
    const container = document.getElementById('manual-entries');
    const currentCount = container.querySelectorAll('.manual-entry-row').length;
    const event = State.getCurrentEvent();
    
    container.insertAdjacentHTML('beforeend', this.renderManualEntry(currentCount, event?.customFields || []));
  },
  
  filterGuests(searchTerm) {
    const term = searchTerm.toLowerCase();
    const cards = document.querySelectorAll('.guest-card');
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? '' : 'none';
    });
  },
  
  selectAllGuests() {
    this.showNotification('Seleção em desenvolvimento', 'info');
  },
  
  async confirmAllGuests() {
    const event = State.getCurrentEvent();
    if (!event) return;
    
    this.showConfirmDialog(
      'CONFIRMAR TODOS',
      'Tem certeza que deseja confirmar TODOS os convidados?',
      async () => {
        for (const guest of event.guests) {
          await State.updateGuest(guest.id, { status: 'yes' });
        }
        this.showNotification('Todos confirmados!', 'success');
        this.render();
      }
    );
  },
  
  async rejectAllGuests() {
    const event = State.getCurrentEvent();
    if (!event) return;
    
    this.showConfirmDialog(
      'RECUSAR TODOS',
      'Tem certeza que deseja recusar TODOS os convidados?',
      async () => {
        for (const guest of event.guests) {
          await State.updateGuest(guest.id, { status: 'no' });
        }
        this.showNotification('Todos recusados!', 'success');
        this.render();
      }
    );
  }
};

// Exporta globalmente
window.UI = UI;

console.log('✅ UI.js v3.1 carregado - SEM DUPLICAÇÕES');
