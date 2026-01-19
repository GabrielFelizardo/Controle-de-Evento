/**
 * SISTEMA DE PRESENÇA - APPS SCRIPT v3.1
 * Sistema baseado em EMAIL
 * 1 planilha por usuário
 * Cada evento = 1 aba na planilha
 * 
 * Desenvolvido por: Gabriel Felizardo
 */

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  FOLDER_NAME: 'Sistema Presença - Dados',
  VERSION: '3.1'
};

// ========================================
// BUSCAR OU CRIAR PLANILHA POR EMAIL
// ========================================

/**
 * Endpoint principal - recebe todas as requisições
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    logRequest(data);
    
    let result;
    switch(data.action) {
      case 'getOrCreateSpreadsheet':
        result = getOrCreateSpreadsheet(data);
        break;
      case 'createEvent':
        result = createEvent(data);
        break;
      case 'getEvents':
        result = getEvents(data);
        break;
      case 'updateEvent':
        result = updateEvent(data);
        break;
      case 'deleteEvent':
        result = deleteEvent(data);
        break;
      case 'addGuest':
        result = addGuest(data);
        break;
      case 'updateGuest':
        result = updateGuest(data);
        break;
      case 'deleteGuest':
        result = deleteGuest(data);
        break;
      case 'getGuests':
        result = getGuests(data);
        break;
      case 'createEventForm':
        result = createEventForm(data);
        break;
      case 'syncFormResponses':
        result = syncFormResponses(data);
        break;
      default:
        result = errorResponse('Ação inválida: ' + data.action);
    }
    
    return createResponse(result);
    
  } catch (error) {
    logError(error);
    return createResponse(errorResponse(error.message));
  }
}

function doGet(e) {
  return createResponse({
    success: true,
    message: 'Sistema de Presença API v' + CONFIG.VERSION,
    timestamp: new Date().toISOString()
  });
}

// ========================================
// BUSCAR/CRIAR PLANILHA POR EMAIL
// ========================================

/**
 * Busca planilha existente ou cria nova
 */
function getOrCreateSpreadsheet(data) {
  try {
    const { email } = data;
    
    if (!email) {
      return errorResponse('Email é obrigatório');
    }
    
    // Busca planilha existente
    const existing = findSpreadsheetByEmail(email);
    
    if (existing) {
      // Planilha já existe
      return successResponse({
        spreadsheetId: existing.getId(),
        spreadsheetUrl: existing.getUrl(),
        email: email,
        isNew: false,
        message: 'Planilha encontrada'
      });
    }
    
    // Não existe - criar nova
    const newSpreadsheet = createSpreadsheetForEmail(email);
    
    return successResponse({
      spreadsheetId: newSpreadsheet.getId(),
      spreadsheetUrl: newSpreadsheet.getUrl(),
      email: email,
      isNew: true,
      message: 'Planilha criada'
    });
    
  } catch (error) {
    return errorResponse('Erro ao buscar/criar planilha: ' + error.message);
  }
}

/**
 * Busca planilha existente por email
 */
function findSpreadsheetByEmail(email) {
  try {
    const fileName = `Sistema Presença - ${email}`;
    const files = DriveApp.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      return SpreadsheetApp.open(file);
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Erro ao buscar planilha: ' + error.message);
    return null;
  }
}

/**
 * Cria nova planilha para o email
 */
function createSpreadsheetForEmail(email) {
  const fileName = `Sistema Presença - ${email}`;
  
  // Cria planilha
  const ss = SpreadsheetApp.create(fileName);
  
  // Cria pasta se não existir
  const folder = getOrCreateFolder();
  
  // Move pra pasta
  const file = DriveApp.getFileById(ss.getId());
  file.moveTo(folder);
  
  // Compartilha com usuário
  try {
    ss.addEditor(email);
  } catch (e) {
    Logger.log('Aviso: Não foi possível compartilhar com ' + email);
  }
  
  // Configura primeira aba
  const firstSheet = ss.getSheets()[0];
  firstSheet.setName('📋 Instruções');
  
  // Adiciona instruções
  firstSheet.getRange('A1').setValue('SISTEMA DE CONTROLE DE PRESENÇA');
  firstSheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  firstSheet.getRange('A3').setValue('Como usar:');
  firstSheet.getRange('A4').setValue('1. Cada aba desta planilha = 1 evento');
  firstSheet.getRange('A5').setValue('2. Crie eventos no sistema web');
  firstSheet.getRange('A6').setValue('3. Abas serão criadas automaticamente aqui');
  firstSheet.getRange('A7').setValue('4. Você pode abrir e ver seus dados a qualquer momento');
  
  firstSheet.getRange('A9').setValue('Email:').setFontWeight('bold');
  firstSheet.getRange('B9').setValue(email);
  
  firstSheet.getRange('A10').setValue('Criado em:').setFontWeight('bold');
  firstSheet.getRange('B10').setValue(new Date());
  
  // Formata
  firstSheet.setColumnWidth(1, 150);
  firstSheet.setColumnWidth(2, 300);
  
  return ss;
}

/**
 * Busca ou cria pasta
 */
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return DriveApp.createFolder(CONFIG.FOLDER_NAME);
}

// ========================================
// EVENTOS (ABAS NA PLANILHA)
// ========================================

/**
 * Cria novo evento (nova aba)
 */
function createEvent(data) {
  try {
    const { spreadsheetId, name, date, description } = data;
    
    if (!spreadsheetId || !name) {
      return errorResponse('spreadsheetId e name são obrigatórios');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Verifica se já existe aba com esse nome
    let sheet = ss.getSheetByName(name);
    
    if (sheet) {
      // Aba já existe, retorna ela
      return successResponse({
        eventId: name,
        name: name,
        date: date || '',
        description: description || '',
        sheetName: name,
        alreadyExists: true
      });
    }
    
    // Cria nova aba
    sheet = ss.insertSheet(name);
    
    // Headers
    sheet.getRange('A1:F1').setValues([[
      'Nome',
      'Telefone',
      'Email',
      'Status',
      'Adicionado Em',
      'Observações'
    ]]);
    
    // Formata header
    sheet.getRange('A1:F1')
      .setBackground('#000000')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Auto-resize
    for (let i = 1; i <= 6; i++) {
      sheet.autoResizeColumn(i);
    }
    
    // Congela header
    sheet.setFrozenRows(1);
    
    // Adiciona nota na aba de instruções
    const infoSheet = ss.getSheetByName('📋 Instruções');
    if (infoSheet) {
      const lastRow = infoSheet.getLastRow();
      infoSheet.getRange(lastRow + 1, 1).setValue(`✓ Evento criado: ${name}`);
      infoSheet.getRange(lastRow + 1, 2).setValue(new Date());
    }
    
    return successResponse({
      eventId: name,
      name: name,
      date: date || '',
      description: description || '',
      sheetName: name,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    return errorResponse('Erro ao criar evento: ' + error.message);
  }
}

/**
 * Lista eventos (abas da planilha)
 */
function getEvents(data) {
  try {
    const { spreadsheetId } = data;
    
    if (!spreadsheetId) {
      return errorResponse('spreadsheetId é obrigatório');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheets = ss.getSheets();
    
    const events = [];
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      
      // Pula aba de instruções
      if (name === '📋 Instruções') {
        return;
      }
      
      events.push({
        id: name,
        name: name,
        sheetName: name,
        guestCount: Math.max(0, sheet.getLastRow() - 1) // -1 pra não contar header
      });
    });
    
    return successResponse({ events: events });
    
  } catch (error) {
    return errorResponse('Erro ao listar eventos: ' + error.message);
  }
}

/**
 * Atualiza evento (renomeia aba)
 */
function updateEvent(data) {
  try {
    const { spreadsheetId, eventId, newName } = data;
    
    if (!spreadsheetId || !eventId || !newName) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    // Renomeia aba
    sheet.setName(newName);
    
    return successResponse({
      eventId: newName,
      name: newName,
      oldName: eventId
    });
    
  } catch (error) {
    return errorResponse('Erro ao atualizar evento: ' + error.message);
  }
}

/**
 * Deleta evento (deleta aba)
 */
function deleteEvent(data) {
  try {
    const { spreadsheetId, eventId } = data;
    
    if (!spreadsheetId || !eventId) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    // Deleta aba
    ss.deleteSheet(sheet);
    
    return successResponse({ deleted: true, eventId: eventId });
    
  } catch (error) {
    return errorResponse('Erro ao deletar evento: ' + error.message);
  }
}

// ========================================
// CONVIDADOS (LINHAS NA ABA)
// ========================================

/**
 * Adiciona convidado (adiciona linha)
 */
function addGuest(data) {
  try {
    const { spreadsheetId, eventId, guest } = data;
    
    if (!spreadsheetId || !eventId || !guest || !guest.name) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    // Adiciona linha
    sheet.appendRow([
      guest.name,
      guest.phone || '',
      guest.email || '',
      guest.status || 'pending',
      new Date(),
      guest.notes || ''
    ]);
    
    return successResponse({
      guestId: sheet.getLastRow(), // Usa número da linha como ID
      eventId: eventId,
      name: guest.name,
      addedAt: new Date().toISOString()
    });
    
  } catch (error) {
    return errorResponse('Erro ao adicionar convidado: ' + error.message);
  }
}

/**
 * Lista convidados de um evento
 */
function getGuests(data) {
  try {
    const { spreadsheetId, eventId } = data;
    
    if (!spreadsheetId || !eventId) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const guests = [];
    
    // Pula header (linha 1)
    for (let i = 1; i < values.length; i++) {
      guests.push({
        id: i + 1, // Número da linha
        name: values[i][0],
        phone: values[i][1],
        email: values[i][2],
        status: values[i][3],
        addedAt: values[i][4],
        notes: values[i][5]
      });
    }
    
    return successResponse({ guests: guests });
    
  } catch (error) {
    return errorResponse('Erro ao listar convidados: ' + error.message);
  }
}

/**
 * Atualiza convidado
 */
function updateGuest(data) {
  try {
    const { spreadsheetId, eventId, guestId, updates } = data;
    
    if (!spreadsheetId || !eventId || !guestId) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    const row = guestId; // guestId É o número da linha
    
    // Atualiza células
    if (updates.name !== undefined) sheet.getRange(row, 1).setValue(updates.name);
    if (updates.phone !== undefined) sheet.getRange(row, 2).setValue(updates.phone);
    if (updates.email !== undefined) sheet.getRange(row, 3).setValue(updates.email);
    if (updates.status !== undefined) sheet.getRange(row, 4).setValue(updates.status);
    if (updates.notes !== undefined) sheet.getRange(row, 6).setValue(updates.notes);
    
    return successResponse({ updated: true });
    
  } catch (error) {
    return errorResponse('Erro ao atualizar convidado: ' + error.message);
  }
}

/**
 * Deleta convidado
 */
function deleteGuest(data) {
  try {
    const { spreadsheetId, eventId, guestId } = data;
    
    if (!spreadsheetId || !eventId || !guestId) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    // Deleta linha
    sheet.deleteRow(guestId);
    
    return successResponse({ deleted: true });
    
  } catch (error) {
    return errorResponse('Erro ao deletar convidado: ' + error.message);
  }
}

// ========================================
// FORMULÁRIOS GOOGLE FORMS
// ========================================

/**
 * Cria Google Form para evento
 */
function createEventForm(data) {
  try {
    const { spreadsheetId, eventId, eventName } = data;
    
    if (!spreadsheetId || !eventId) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    // Cria formulário
    const form = FormApp.create(`Confirmação - ${eventName || eventId}`);
    
    form.setTitle(`🎉 ${eventName || eventId}`);
    form.setDescription('Confirme sua presença preenchendo o formulário abaixo:');
    form.setCollectEmail(false);
    form.setConfirmationMessage('✅ Presença confirmada! Obrigado!');
    
    // Campos
    form.addTextItem().setTitle('Nome Completo').setRequired(true);
    form.addTextItem().setTitle('Telefone').setHelpText('(21) 99999-9999');
    form.addTextItem().setTitle('Email');
    form.addMultipleChoiceItem()
      .setTitle('Você vai comparecer?')
      .setChoiceValues(['✅ Sim, estarei presente', '❌ Não poderei comparecer'])
      .setRequired(true);
    
    // Define destino (mesma planilha, nova aba)
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    return successResponse({
      formId: form.getId(),
      formUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl()
    });
    
  } catch (error) {
    return errorResponse('Erro ao criar formulário: ' + error.message);
  }
}

/**
 * Sincroniza respostas do formulário
 */
function syncFormResponses(data) {
  try {
    const { spreadsheetId, eventId, formId } = data;
    
    if (!spreadsheetId || !eventId || !formId) {
      return errorResponse('Dados incompletos');
    }
    
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado');
    }
    
    let synced = 0;
    
    responses.forEach(response => {
      const items = response.getItemResponses();
      const responseData = {};
      
      items.forEach(item => {
        responseData[item.getItem().getTitle()] = item.getResponse();
      });
      
      const name = responseData['Nome Completo'];
      const phone = responseData['Telefone'] || '';
      const email = responseData['Email'] || '';
      const statusText = responseData['Você vai comparecer?'];
      const status = statusText && statusText.includes('Sim') ? 'yes' : 'no';
      
      if (name) {
        // Adiciona na planilha
        sheet.appendRow([name, phone, email, status, new Date(), 'Via formulário']);
        synced++;
      }
    });
    
    return successResponse({
      synced: synced,
      total: responses.length
    });
    
  } catch (error) {
    return errorResponse('Erro ao sincronizar: ' + error.message);
  }
}

// ========================================
// HELPERS
// ========================================

function successResponse(data) {
  return {
    success: true,
    data: data,
    timestamp: new Date().toISOString()
  };
}

function errorResponse(message) {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function logRequest(data) {
  Logger.log('Action: ' + data.action);
}

function logError(error) {
  Logger.log('ERRO: ' + error.message);
  Logger.log('Stack: ' + error.stack);
}
