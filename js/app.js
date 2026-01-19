/**
 * APP.JS v3.1 - COMPLETO
 * Sistema de Controle de Presença
 * Baseado em Email + Google Sheets
 */

(function() {
  'use strict';
  
  console.log('📋 Sistema de Controle de Presença v3.1');
  console.log('🔐 Modo: Email + Google Sheets');
  
  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      console.log('🚀 Inicializando sistema...');
      
      // 1. Verifica se API está configurada
      if (!API_CONFIG.API_URL) {
        showSetupRequired();
        return;
      }
      
      // 2. Ativa sincronização com planilha
      if (typeof SheetSync !== 'undefined') {
        SheetSync.enable();
      }
      
      // 3. Configura event listeners
      setupEventListeners();
      setupKeyboardShortcuts();
      
      // 4. Inicia sistema de autenticação
      if (typeof AuthSystem !== 'undefined') {
        AuthSystem.init();
      } else {
        console.error('❌ AuthSystem não carregado');
        alert('Erro ao carregar sistema de autenticação. Recarregue a página.');
      }
      
      console.log('✅ Sistema inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      alert('Erro ao iniciar sistema: ' + error.message);
    }
  });
  
  // ========================================
  // MENU HANDLERS
  // ========================================
  
  function setupEventListeners() {
    // Menu dropdowns
    setupMenuDropdowns();
    
    // Ações de arquivo
    addActionListener('new-event', handleNewEvent);
    addActionListener('save', handleSave);
    addActionListener('cloud-backup', handleCloudBackup);
    addActionListener('qr-sync', handleQRSync);
    addActionListener('export-pdf', handleExportPDF);
    addActionListener('export-txt', handleExportTXT);
    addActionListener('export-csv', handleExportCSV);
    addActionListener('print', handlePrint);
    addActionListener('duplicate-event', handleDuplicateEvent);
    addActionListener('clear-all', handleClearAll);
    
    // Ações de editar
    addActionListener('quick-add', handleQuickAdd);
    addActionListener('bulk-edit', handleBulkEdit);
    addActionListener('select-all', handleSelectAll);
    addActionListener('confirm-all', handleConfirmAll);
    addActionListener('reject-all', handleRejectAll);
    addActionListener('reset-all', handleResetAll);
    
    // Ações de visualizar
    addActionListener('toggle-compact', handleToggleCompact);
    addActionListener('filter-all', () => handleFilter('all'));
    addActionListener('filter-yes', () => handleFilter('yes'));
    addActionListener('filter-no', () => handleFilter('no'));
    addActionListener('filter-pending', () => handleFilter('pending'));
    addActionListener('sort-name', () => handleSort('name'));
    addActionListener('sort-status', () => handleSort('status'));
    
    // Ações de ferramentas
    addActionListener('detailed-stats', handleDetailedStats);
    addActionListener('backup', handleBackup);
    addActionListener('restore', handleRestore);
    
    // Ações de ajuda
    addActionListener('help', handleHelp);
    addActionListener('shortcuts', handleShortcuts);
    addActionListener('about', handleAbout);
    
    // Modal actions
    setupModalActions();
    
    console.log('✅ Event listeners configurados');
  }
  
  function addActionListener(action, handler) {
    const elements = document.querySelectorAll(`[data-action="${action}"]`);
    elements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        handler();
      });
    });
  }
  
  function setupMenuDropdowns() {
    const menuButtons = document.querySelectorAll('.menu-button');
    
    menuButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = button.nextElementSibling;
        const isOpen = dropdown.classList.contains('active');
        
        // Fecha todos
        document.querySelectorAll('.dropdown').forEach(d => {
          d.classList.remove('active');
        });
        
        // Abre este
        if (!isOpen) {
          dropdown.classList.add('active');
        }
      });
    });
    
    // Fecha ao clicar fora
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown').forEach(d => {
        d.classList.remove('active');
      });
    });
  }
  
  // ========================================
  // AÇÕES DE ARQUIVO
  // ========================================
  
  function handleNewEvent() {
    const modal = document.getElementById('new-event-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.getElementById('new-event-name').value = '';
      document.getElementById('new-event-date').value = '';
      setTimeout(() => document.getElementById('new-event-name').focus(), 100);
    }
  }
  
  function handleSave() {
    Storage.save();
    showNotification('✓ Salvo com sucesso!');
  }
  
  function handleCloudBackup() {
    if (typeof CloudAssist !== 'undefined' && CloudAssist.backup) {
      CloudAssist.backup();
    } else {
      alert('Recurso de backup na nuvem não disponível');
    }
  }
  
  function handleQRSync() {
    if (typeof QRSync !== 'undefined' && QRSync.show) {
      QRSync.show();
    } else {
      alert('Recurso de QR Code não disponível');
    }
  }
  
  function handleExportPDF() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    if (typeof Exports !== 'undefined' && Exports.exportPDF) {
      Exports.exportPDF(currentEvent);
    } else {
      alert('Recurso de exportação não disponível');
    }
  }
  
  function handleExportTXT() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    if (typeof Exports !== 'undefined' && Exports.exportTXT) {
      Exports.exportTXT(currentEvent);
    } else {
      alert('Recurso de exportação não disponível');
    }
  }
  
  function handleExportCSV() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    if (typeof Exports !== 'undefined' && Exports.exportCSV) {
      Exports.exportCSV(currentEvent);
    } else {
      alert('Recurso de exportação não disponível');
    }
  }
  
  function handlePrint() {
    window.print();
  }
  
  function handleDuplicateEvent() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    const newName = prompt('Nome do novo evento:', currentEvent.name + ' (Cópia)');
    if (!newName) return;
    
    State.createEvent(newName, currentEvent.date).then(newEvent => {
      if (newEvent) {
        // Copia convidados
        currentEvent.guests.forEach(guest => {
          State.addGuest(newEvent.id, {...guest});
        });
        
        UI.renderTabs();
        UI.switchToEvent(newEvent.id);
        showNotification('✓ Evento duplicado!');
      }
    });
  }
  
  function handleClearAll() {
    showConfirmModal(
      'LIMPAR TUDO',
      'Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!',
      () => {
        State.events = [];
        Storage.save();
        UI.init();
        showNotification('Todos os dados foram limpos');
      }
    );
  }
  
  // ========================================
  // AÇÕES DE EDITAR
  // ========================================
  
  function handleQuickAdd() {
    const modal = document.getElementById('quick-add-modal');
    const currentEvent = State.getCurrentEvent();
    
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    if (modal) {
      modal.style.display = 'flex';
      
      // Gera campos
      const fields = document.getElementById('quick-add-fields');
      fields.innerHTML = `
        <div class="form-group">
          <label class="label">NOME</label>
          <input type="text" class="input" id="quick-name" placeholder="Nome completo">
        </div>
        <div class="form-group">
          <label class="label">TELEFONE</label>
          <input type="text" class="input" id="quick-phone" placeholder="(00) 00000-0000">
        </div>
      `;
      
      setTimeout(() => document.getElementById('quick-name').focus(), 100);
    }
  }
  
  function handleBulkEdit() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    const selected = getSelectedGuests();
    if (selected.length === 0) {
      alert('Nenhum convidado selecionado');
      return;
    }
    
    const modal = document.getElementById('bulk-edit-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.guest-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
  }
  
  function handleConfirmAll() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) return;
    
    currentEvent.guests.forEach(guest => {
      State.updateGuestStatus(currentEvent.id, guest.id, 'yes');
    });
    
    UI.renderEvent(currentEvent.id);
    showNotification('✓ Todos confirmados!');
  }
  
  function handleRejectAll() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) return;
    
    currentEvent.guests.forEach(guest => {
      State.updateGuestStatus(currentEvent.id, guest.id, 'no');
    });
    
    UI.renderEvent(currentEvent.id);
    showNotification('✓ Todos recusados!');
  }
  
  function handleResetAll() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) return;
    
    currentEvent.guests.forEach(guest => {
      State.updateGuestStatus(currentEvent.id, guest.id, 'pending');
    });
    
    UI.renderEvent(currentEvent.id);
    showNotification('✓ Status resetado!');
  }
  
  // ========================================
  // AÇÕES DE VISUALIZAR
  // ========================================
  
  function handleToggleCompact() {
    document.body.classList.toggle('compact-mode');
    const isCompact = document.body.classList.contains('compact-mode');
    showNotification(isCompact ? 'Modo compacto ativado' : 'Modo normal ativado');
  }
  
  function handleFilter(type) {
    State.currentFilter = type;
    const currentEvent = State.getCurrentEvent();
    if (currentEvent) {
      UI.renderEvent(currentEvent.id);
    }
  }
  
  function handleSort(type) {
    State.currentSort = type;
    const currentEvent = State.getCurrentEvent();
    if (currentEvent) {
      UI.renderEvent(currentEvent.id);
    }
  }
  
  // ========================================
  // AÇÕES DE FERRAMENTAS
  // ========================================
  
  function handleDetailedStats() {
    const currentEvent = State.getCurrentEvent();
    if (!currentEvent) {
      alert('Nenhum evento selecionado');
      return;
    }
    
    const total = currentEvent.guests.length;
    const confirmed = currentEvent.guests.filter(g => g.status === 'yes').length;
    const rejected = currentEvent.guests.filter(g => g.status === 'no').length;
    const pending = currentEvent.guests.filter(g => g.status === 'pending').length;
    
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    
    if (modal && content) {
      content.innerHTML = `
        <div style="padding: var(--space-4);">
          <h3>${currentEvent.name}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); margin-top: var(--space-3);">
            <div style="background: #f0f9ff; padding: var(--space-3); border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; color: #0284c7;">${total}</div>
              <div style="color: #0c4a6e;">Total de Convidados</div>
            </div>
            <div style="background: #d1fae5; padding: var(--space-3); border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; color: #059669;">${confirmed}</div>
              <div style="color: #065f46;">Confirmados</div>
            </div>
            <div style="background: #fee2e2; padding: var(--space-3); border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${rejected}</div>
              <div style="color: #991b1b;">Recusas</div>
            </div>
            <div style="background: #fef3c7; padding: var(--space-3); border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; color: #d97706;">${pending}</div>
              <div style="color: #92400e;">Pendentes</div>
            </div>
          </div>
          <div style="margin-top: var(--space-4);">
            <strong>Taxa de Confirmação:</strong> ${total > 0 ? Math.round(confirmed/total*100) : 0}%
          </div>
        </div>
      `;
      modal.style.display = 'flex';
    }
  }
  
  function handleBackup() {
    const data = {
      version: '3.1',
      email: localStorage.getItem('userEmail'),
      spreadsheetId: localStorage.getItem('spreadsheetId'),
      events: State.events,
      exportedAt: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-presenca-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    showNotification('✓ Backup baixado!');
  }
  
  function handleRestore() {
    const modal = document.getElementById('restore-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  // ========================================
  // AÇÕES DE AJUDA
  // ========================================
  
  function handleHelp() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  function handleShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  function handleAbout() {
    const modal = document.getElementById('about-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  // ========================================
  // MODAL ACTIONS
  // ========================================
  
  function setupModalActions() {
    // Botões de cancelar
    document.querySelectorAll('[data-modal-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });
    
    // Criar evento
    const createEventBtn = document.querySelector('[data-modal-action="create-event"]');
    if (createEventBtn) {
      createEventBtn.addEventListener('click', async () => {
        const name = document.getElementById('new-event-name').value.trim();
        const date = document.getElementById('new-event-date').value;
        
        if (!name) {
          alert('Digite o nome do evento');
          return;
        }
        
        const event = await State.createEvent(name, date);
        if (event) {
          closeAllModals();
          UI.renderTabs();
          UI.switchToEvent(event.id);
          showNotification('✓ Evento criado!');
        }
      });
    }
    
    // Salvar edição
    const saveEditBtn = document.querySelector('[data-modal-action="save-edit"]');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', () => {
        // Implementado em ui.js
      });
    }
    
    // Quick add
    const quickAddBtn = document.querySelector('[data-modal-action="save-quick-add"]');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', async () => {
        const currentEvent = State.getCurrentEvent();
        if (!currentEvent) return;
        
        const name = document.getElementById('quick-name').value.trim();
        const phone = document.getElementById('quick-phone').value.trim();
        
        if (!name) {
          alert('Digite o nome');
          return;
        }
        
        await State.addGuest(currentEvent.id, {
          name: name,
          phone: phone,
          status: 'pending'
        });
        
        closeAllModals();
        UI.renderEvent(currentEvent.id);
        showNotification('✓ Convidado adicionado!');
      });
    }
    
    // Bulk actions
    document.querySelectorAll('[data-bulk-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.getAttribute('data-bulk-action');
        const currentEvent = State.getCurrentEvent();
        if (!currentEvent) return;
        
        const selected = getSelectedGuests();
        if (selected.length === 0) {
          alert('Nenhum convidado selecionado');
          return;
        }
        
        for (const guestId of selected) {
          await State.updateGuestStatus(currentEvent.id, guestId, action);
        }
        
        closeAllModals();
        UI.renderEvent(currentEvent.id);
        showNotification(`✓ ${selected.length} convidados atualizados!`);
      });
    });
    
    // Restaurar backup
    const restoreBtn = document.querySelector('[data-modal-action="restore-backup"]');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('restore-file');
        const file = fileInput.files[0];
        
        if (!file) {
          alert('Selecione um arquivo');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            
            if (!data.events) {
              alert('Arquivo inválido');
              return;
            }
            
            if (confirm('Restaurar backup? Os dados atuais serão substituídos.')) {
              State.events = data.events;
              Storage.save();
              closeAllModals();
              UI.init();
              showNotification('✓ Backup restaurado!');
            }
          } catch (error) {
            alert('Erro ao ler arquivo: ' + error.message);
          }
        };
        reader.readAsText(file);
      });
    }
    
    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }
  
  // ========================================
  // ATALHOS DE TECLADO
  // ========================================
  
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+S - Salvar
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Ctrl+P - Imprimir
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      
      // Ctrl+N - Novo evento
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewEvent();
      }
    });
  }
  
  // ========================================
  // HELPERS
  // ========================================
  
  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
  
  function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-action');
    
    // Remove listeners antigos
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    
    // Adiciona novo listener
    newBtn.addEventListener('click', () => {
      onConfirm();
      closeAllModals();
    });
    
    modal.style.display = 'flex';
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  function getSelectedGuests() {
    const checkboxes = document.querySelectorAll('.guest-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.guestId);
  }
  
  function showSetupRequired() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.innerHTML = `
      <div style="
        max-width: 600px;
        margin: 100px auto;
        padding: 40px;
        background: #fff3cd;
        border: 3px solid #ffc107;
        border-radius: 8px;
        text-align: center;
      ">
        <h2 style="margin-bottom: 20px;">⚠️ Configuração Necessária</h2>
        <p style="margin-bottom: 20px; line-height: 1.6;">
          O sistema precisa ser configurado antes de usar.<br>
          Siga as instruções no README ou documentação.
        </p>
        <p style="font-size: 14px; color: #666;">
          Você precisa:
        </p>
        <ol style="text-align: left; display: inline-block; margin-top: 10px;">
          <li>Fazer deploy do Apps Script v3.1</li>
          <li>Configurar a URL da API no config.js</li>
          <li>Recarregar esta página</li>
        </ol>
      </div>
    `;
  }
  
  // Exporta funções globais (se necessário)
  window.App = {
    showNotification,
    closeAllModals,
    showConfirmModal
  };
  
})();

console.log('✅ App v3.1 inicializado');
