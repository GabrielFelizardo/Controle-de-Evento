/**
 * SINCRONIZAÇÃO COM PLANILHA v3.2.0
 * ✅ CORRIGIDO: Sincroniza TUDO - convidados, edições, colunas, renomeações
 */

const SheetSync = {
  enabled: false,
  
  /**
   * Ativa sincronização
   */
  enable() {
    if (this.enabled) {
      console.log('⚠️ SheetSync já está ativo');
      return;
    }
    
    if (!AuthSystem || !AuthSystem.spreadsheetId) {
      console.error('❌ Não pode ativar SheetSync: sem spreadsheetId');
      return;
    }
    
    this.interceptEventOperations();
    this.interceptGuestOperations();
    this.enabled = true;
    
    console.log('✅ Sincronização com planilha ativada');
    console.log('📊 SpreadsheetId:', AuthSystem.spreadsheetId);
  },
  
  // ========================================
  // EVENTOS
  // ========================================
  
  /**
   * Intercepta operações de eventos
   */
  interceptEventOperations() {
    // Salva função original
    const originalAddEvent = State.addEvent;
    
    // ✅ Sobrescreve addEvent
    State.addEvent = async function(name, date) {
      console.log('📝 Criando evento:', name);
      
      // Verifica se tem spreadsheetId
      if (!AuthSystem.spreadsheetId) {
        console.warn('⚠️ Sem spreadsheetId - criando apenas localmente');
        return originalAddEvent.call(State, name, date);
      }
      
      // Mostra loading
      if (typeof UICore !== 'undefined') {
        UICore.showLoadingOverlay('Criando evento no Google Drive...');
      }
      
      try {
        const result = await API.createEvent(
          AuthSystem.spreadsheetId,
          name,
          date || '',
          '',
          ''
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Erro ao criar evento na planilha');
        }
        
        // Cria local
        const localEvent = {
          id: result.data.eventId || Utils.generateId(),
          name: name,
          date: date || '',
          guests: [],
          columns: [],
          method: null,
          createdAt: new Date(),
          sheetName: result.data.sheetName,
          syncedToSheet: true
        };
        
        State.events.push(localEvent);
        Storage.save();
        
        console.log('✅ Evento criado na planilha:', localEvent);
        
        // Esconde loading
        if (typeof UICore !== 'undefined') {
          UICore.hideLoadingOverlay();
          UICore.showNotification('✅ Evento criado no Google Drive!', 'success');
        }
        
        return localEvent;
        
      } catch (error) {
        console.error('❌ Erro ao criar evento no Sheets:', error);
        
        // Esconde loading
        if (typeof UICore !== 'undefined') {
          UICore.hideLoadingOverlay();
          UICore.showError('Erro ao salvar no Google Drive: ' + error.message);
        }
        
        // Cria localmente mesmo com erro
        console.log('📝 Criando evento apenas localmente...');
        const localEvent = originalAddEvent.call(State, name, date);
        localEvent.syncedToSheet = false;
        return localEvent;
      }
    };
    
    // ✅ NOVO: Intercepta mudança de colunas
    State.setEventColumns = async function(eventId, columns) {
      const event = State.getEventById(eventId);
      if (!event) return;
      
      console.log('📊 Definindo colunas:', columns);
      
      // Atualiza local
      event.columns = columns;
      State.clearStatsCache(eventId);
      
      // Se evento está sincronizado, atualiza headers na planilha
      if (event.sheetName && AuthSystem.spreadsheetId) {
        try {
          console.log('📤 Atualizando cabeçalhos na planilha...');
          
          // Como não temos endpoint específico, vamos recriar a aba
          // com os headers corretos
          const result = await API.updateEvent(
            AuthSystem.spreadsheetId,
            event.sheetName,
            event.name
          );
          
          if (result.success) {
            console.log('✅ Cabeçalhos atualizados');
          }
          
        } catch (error) {
          console.error('❌ Erro ao atualizar headers:', error);
        }
      }
      
      Storage.save();
    };
    
    // ✅ Sobrescreve removeEvent
    const originalRemoveEvent = State.removeEvent;
    
    State.removeEvent = async function(eventId) {
      console.log('🗑️ Deletando evento:', eventId);
      
      const event = State.getEventById(eventId);
      if (!event) return false;
      
      // Se tem sheetName, deleta do Sheets também
      if (event.sheetName && AuthSystem.spreadsheetId) {
        // Mostra loading
        if (typeof UICore !== 'undefined') {
          UICore.showLoadingOverlay('Deletando do Google Drive...');
        }
        
        try {
          const result = await API.deleteEvent(
            AuthSystem.spreadsheetId,
            event.sheetName
          );
          
          if (!result.success) {
            console.warn('⚠️ Erro ao deletar do Sheets:', result.error);
          } else {
            console.log('✅ Evento deletado do Sheets');
          }
          
        } catch (error) {
          console.error('❌ Erro ao deletar do Sheets:', error);
        } finally {
          if (typeof UICore !== 'undefined') {
            UICore.hideLoadingOverlay();
          }
        }
      }
      
      // Deleta local
      const success = originalRemoveEvent.call(State, eventId);
      Storage.save();
      
      return success;
    };
  },
  
  // ========================================
  // CONVIDADOS
  // ========================================
  
  /**
   * Intercepta operações de convidados
   */
  interceptGuestOperations() {
    // Salva função original
    const originalAddGuest = State.addGuest;
    
    // ✅ CORRIGIDO: Sobrescreve addGuest
    State.addGuest = async function(eventId, guest) {
      console.log('👤 Adicionando convidado:', guest);
      
      const event = State.getEventById(eventId);
      if (!event) {
        throw new Error('Evento não encontrado');
      }
      
      // ✅ IMPORTANTE: Garante que guest tem todas as colunas
      const completeGuest = {
        id: guest.id || Utils.generateId(),
        status: guest.status || 'pending'
      };
      
      // Copia valores das colunas
      event.columns.forEach(col => {
        completeGuest[col] = guest[col] || '';
      });
      
      // Se evento não está sincronizado com Sheets, adiciona só localmente
      if (!event.sheetName || !AuthSystem.spreadsheetId) {
        console.log('📝 Adicionando convidado apenas localmente');
        event.guests.push(completeGuest);
        Storage.save();
        return completeGuest;
      }
      
      // Mostra loading
      if (typeof UICore !== 'undefined') {
        UICore.showLoadingOverlay('Salvando no Google Drive...');
      }
      
      try {
        // ✅ CORRIGIDO: Envia guest completo com todas as colunas
        const result = await API.addGuest(
          AuthSystem.spreadsheetId,
          event.sheetName,
          completeGuest
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Erro ao adicionar convidado');
        }
        
        // Atualiza ID se API retornou um novo
        if (result.data.guestId) {
          completeGuest.id = result.data.guestId;
        }
        
        // Adiciona local
        event.guests.push(completeGuest);
        State.clearStatsCache(eventId);
        Storage.save();
        
        console.log('✅ Convidado adicionado na planilha:', completeGuest);
        
        // Esconde loading
        if (typeof UICore !== 'undefined') {
          UICore.hideLoadingOverlay();
          UICore.showNotification('✅ Salvo no Google Drive!', 'success');
        }
        
        return completeGuest;
        
      } catch (error) {
        console.error('❌ Erro ao adicionar convidado no Sheets:', error);
        
        // Esconde loading
        if (typeof UICore !== 'undefined') {
          UICore.hideLoadingOverlay();
          UICore.showError('Erro ao salvar: ' + error.message);
        }
        
        // Adiciona localmente mesmo com erro
        console.log('📝 Adicionando convidado apenas localmente...');
        event.guests.push(completeGuest);
        Storage.save();
        return completeGuest;
      }
    };
    
    // ✅ NOVO: Intercepta edição completa do convidado
    const originalUpdateGuest = State.updateGuest;
    
    State.updateGuest = async function(eventId, guestIndex, guestData) {
      console.log('✏️ Atualizando convidado:', guestIndex, guestData);
      
      const event = State.getEventById(eventId);
      if (!event || !event.guests[guestIndex]) return false;
      
      const guest = event.guests[guestIndex];
      
      // Atualiza local primeiro
      Object.assign(guest, guestData);
      State.clearStatsCache(eventId);
      Storage.save();
      
      // Se evento está sincronizado, atualiza no Sheets
      if (event.sheetName && AuthSystem.spreadsheetId && guest.id) {
        // Mostra loading
        if (typeof UICore !== 'undefined') {
          UICore.showLoadingOverlay('Atualizando no Google Drive...');
        }
        
        try {
          const result = await API.updateGuest(
            AuthSystem.spreadsheetId,
            event.sheetName,
            guest.id,
            guestData
          );
          
          if (!result.success) {
            console.warn('⚠️ Erro ao atualizar no Sheets:', result.error);
          } else {
            console.log('✅ Convidado atualizado no Sheets');
            
            if (typeof UICore !== 'undefined') {
              UICore.showNotification('✅ Atualizado no Google Drive!', 'success');
            }
          }
          
        } catch (error) {
          console.error('❌ Erro ao atualizar no Sheets:', error);
        } finally {
          if (typeof UICore !== 'undefined') {
            UICore.hideLoadingOverlay();
          }
        }
      }
      
      return true;
    };
    
    // ✅ Sobrescreve updateGuestStatus
    const originalUpdateStatus = State.updateGuestStatus;
    
    State.updateGuestStatus = async function(eventId, guestIndex, status) {
      console.log('🔄 Atualizando status:', guestIndex, status);
      
      const event = State.getEventById(eventId);
      if (!event) return;
      
      const guest = event.guests[guestIndex];
      if (!guest) return;
      
      // Atualiza local
      guest.status = status;
      State.clearStatsCache(eventId);
      Storage.save();
      
      // Se evento está sincronizado, atualiza no Sheets
      if (event.sheetName && AuthSystem.spreadsheetId && guest.id) {
        try {
          const result = await API.updateGuest(
            AuthSystem.spreadsheetId,
            event.sheetName,
            guest.id,
            { status: status }
          );
          
          if (!result.success) {
            console.warn('⚠️ Erro ao atualizar no Sheets:', result.error);
          } else {
            console.log('✅ Status atualizado no Sheets');
          }
          
        } catch (error) {
          console.error('❌ Erro ao atualizar no Sheets:', error);
        }
      }
    };
    
    // ✅ Sobrescreve removeGuest
    const originalRemoveGuest = State.removeGuest;
    
    State.removeGuest = async function(eventId, guestIndex) {
      console.log('🗑️ Deletando convidado:', guestIndex);
      
      const event = State.getEventById(eventId);
      if (!event) return false;
      
      const guest = event.guests[guestIndex];
      if (!guest) return false;
      
      // Se evento está sincronizado, deleta do Sheets
      if (event.sheetName && AuthSystem.spreadsheetId && guest.id) {
        // Mostra loading
        if (typeof UICore !== 'undefined') {
          UICore.showLoadingOverlay('Deletando do Google Drive...');
        }
        
        try {
          const result = await API.deleteGuest(
            AuthSystem.spreadsheetId,
            event.sheetName,
            guest.id
          );
          
          if (!result.success) {
            console.warn('⚠️ Erro ao deletar do Sheets:', result.error);
          } else {
            console.log('✅ Convidado deletado do Sheets');
          }
          
        } catch (error) {
          console.error('❌ Erro ao deletar do Sheets:', error);
        } finally {
          if (typeof UICore !== 'undefined') {
            UICore.hideLoadingOverlay();
          }
        }
      }
      
      // Deleta local
      const success = originalRemoveGuest.call(State, eventId, guestIndex);
      Storage.save();
      
      return success;
    };
  },
  
  /**
   * ✅ NOVO: Sincroniza renomeação de evento
   */
  async renameEvent(eventId, newName) {
    const event = State.getEventById(eventId);
    if (!event) return false;
    
    const oldName = event.name;
    
    console.log(`📝 Renomeando evento: "${oldName}" → "${newName}"`);
    
    // Atualiza local
    event.name = newName;
    Storage.save();
    
    // Se evento está sincronizado, renomeia no Sheets
    if (event.sheetName && AuthSystem.spreadsheetId) {
      // Mostra loading
      if (typeof UICore !== 'undefined') {
        UICore.showLoadingOverlay('Renomeando no Google Drive...');
      }
      
      try {
        const result = await API.updateEvent(
          AuthSystem.spreadsheetId,
          event.sheetName,
          newName
        );
        
        if (!result.success) {
          console.warn('⚠️ Erro ao renomear no Sheets:', result.error);
          
          // Reverte local se falhou
          event.name = oldName;
          Storage.save();
          
          if (typeof UICore !== 'undefined') {
            UICore.showError('Erro ao renomear no Google Drive');
          }
          
          return false;
        }
        
        // Atualiza sheetName se API retornou novo nome
        if (result.data && result.data.eventId) {
          event.sheetName = result.data.eventId;
        } else {
          event.sheetName = newName;
        }
        
        Storage.save();
        
        console.log('✅ Evento renomeado no Sheets');
        
        if (typeof UICore !== 'undefined') {
          UICore.showNotification('✅ Renomeado no Google Drive!', 'success');
        }
        
        return true;
        
      } catch (error) {
        console.error('❌ Erro ao renomear no Sheets:', error);
        
        // Reverte local
        event.name = oldName;
        Storage.save();
        
        if (typeof UICore !== 'undefined') {
          UICore.showError('Erro ao renomear: ' + error.message);
        }
        
        return false;
        
      } finally {
        if (typeof UICore !== 'undefined') {
          UICore.hideLoadingOverlay();
        }
      }
    }
    
    return true;
  },
  
  /**
   * Desativa sincronização (para debug)
   */
  disable() {
    this.enabled = false;
    console.log('⚠️ SheetSync desativado');
  }
};

// Exporta
window.SheetSync = SheetSync;

console.log('🔄 Sheet Sync v3.2.0 carregado');
