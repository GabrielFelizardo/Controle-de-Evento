function autorizarPermissoes() {
  try {
    Logger.log('🔍 Testando acesso ao Drive...');
    
    const folders = DriveApp.getFoldersByName('teste');
    Logger.log('✅ Drive OK');
    
    Logger.log('📊 Testando criação de planilha...');
    const ss = SpreadsheetApp.create('Teste Autorização - Pode Deletar');
    Logger.log('✅ Planilha criada: ' + ss.getId());
    
    Logger.log('🗑️ Deletando planilha teste...');
    DriveApp.getFileById(ss.getId()).setTrashed(true);
    Logger.log('✅ Planilha teste deletada');
    
    Logger.log('');
    Logger.log('🎉 SUCESSO!');
    Logger.log('✅ Todas as permissões foram autorizadas!');
    
    return {
      success: true,
      message: '✅ Autorização concluída!'
    };
    
  } catch (error) {
    Logger.log('❌ ERRO: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  FOLDER_NAME: 'Sistema Presença - Dados',
  VERSION: '3.1.3'
};

// ========================================
// ENDPOINT PRINCIPAL
// ========================================

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

function getOrCreateSpreadsheet(data) {
  try {
    const { email } = data;
    
    if (!email) {
      return errorResponse('Email é obrigatório');
    }
    
    const existing = findSpreadsheetByEmail(email);
    
    if (existing) {
      return successResponse({
        spreadsheetId: existing.getId(),
        spreadsheetUrl: existing.getUrl(),
        email: email,
        isNew: false,
        message: 'Planilha encontrada'
      });
    }
    
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

function createSpreadsheetForEmail(email) {
  const fileName = `Sistema Presença - ${email}`;
  const ss = SpreadsheetApp.create(fileName);
  
  const folder = getOrCreateFolder();
  const file = DriveApp.getFileById(ss.getId());
  file.moveTo(folder);
  
  try {
    ss.addEditor(email);
  } catch (e) {
    Logger.log('Aviso: Não foi possível compartilhar com ' + email);
  }
  
  const firstSheet = ss.getSheets()[0];
  firstSheet.setName('📋 Instruções');
  
  firstSheet.getRange('A1').setValue('SISTEMA DE CONTROLE DE PRESENÇA v3.1.3');
  firstSheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  firstSheet.getRange('A3').setValue('Como usar:');
  firstSheet.getRange('A4').setValue('1. Cada aba = 1 evento');
  firstSheet.getRange('A5').setValue('2. Crie eventos no sistema web');
  firstSheet.getRange('A6').setValue('3. Abas são criadas automaticamente');
  firstSheet.getRange('A7').setValue('4. Convidados aparecem como linhas');
  
  firstSheet.getRange('A9').setValue('Email:').setFontWeight('bold');
  firstSheet.getRange('B9').setValue(email);
  
  firstSheet.getRange('A10').setValue('Criado em:').setFontWeight('bold');
  firstSheet.getRange('B10').setValue(new Date());
  
  firstSheet.setColumnWidth(1, 150);
  firstSheet.setColumnWidth(2, 300);
  
  return ss;
}

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
 * ✅ CORRIGIDO: Agora aceita colunas personalizadas!
 */
function createEvent(data) {
  try {
    const { spreadsheetId, name, date, description, columns } = data;
    
    if (!spreadsheetId || !name) {
      return errorResponse('spreadsheetId e name são obrigatórios');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    let sheet = ss.getSheetByName(name);
    
    if (sheet) {
      return successResponse({
        eventId: name,
        name: name,
        date: date || '',
        description: description || '',
        sheetName: name,
        alreadyExists: true
      });
    }
    
    sheet = ss.insertSheet(name);
    
    // ✅ NOVO: Usa colunas personalizadas se fornecidas
    let headerColumns;
    if (columns && Array.isArray(columns) && columns.length > 0) {
      // Colunas personalizadas + Status + Data
      headerColumns = [...columns, 'Status', 'Adicionado Em'];
    } else {
      // Colunas padrão
      headerColumns = ['Nome', 'Telefone', 'Email', 'Status', 'Adicionado Em', 'Observações'];
    }
    
    // Cria header
    const headerRange = sheet.getRange(1, 1, 1, headerColumns.length);
    headerRange.setValues([headerColumns]);
    
    // Formata header
    headerRange
      .setBackground('#000000')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Auto-resize
    for (let i = 1; i <= headerColumns.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    sheet.setFrozenRows(1);
    
    // ✅ NOVO: Salva metadados das colunas
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(
      `columns_${spreadsheetId}_${name}`,
      JSON.stringify(columns || [])
    );
    
    const infoSheet = ss.getSheetByName('📋 Instruções');
    if (infoSheet) {
      const lastRow = infoSheet.getLastRow();
      infoSheet.getRange(lastRow + 1, 1).setValue(`✓ Evento: ${name}`);
      infoSheet.getRange(lastRow + 1, 2).setValue(new Date());
    }
    
    return successResponse({
      eventId: name,
      name: name,
      date: date || '',
      description: description || '',
      sheetName: name,
      columns: headerColumns,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    return errorResponse('Erro ao criar evento: ' + error.message);
  }
}

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
      
      if (name === '📋 Instruções') {
        return;
      }
      
      // ✅ NOVO: Lê colunas do evento
      const properties = PropertiesService.getScriptProperties();
      const columnsJson = properties.getProperty(`columns_${spreadsheetId}_${name}`);
      const columns = columnsJson ? JSON.parse(columnsJson) : [];
      
      events.push({
        id: name,
        name: name,
        sheetName: name,
        columns: columns,
        guestCount: Math.max(0, sheet.getLastRow() - 1)
      });
    });
    
    return successResponse({ events: events });
    
  } catch (error) {
    return errorResponse('Erro ao listar eventos: ' + error.message);
  }
}

/**
 * ✅ NOVO: Atualiza evento (renomeia aba)
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
    
    // ✅ NOVO: Transfere metadados de colunas
    const properties = PropertiesService.getScriptProperties();
    const oldKey = `columns_${spreadsheetId}_${eventId}`;
    const newKey = `columns_${spreadsheetId}_${newName}`;
    
    const columnsJson = properties.getProperty(oldKey);
    if (columnsJson) {
      properties.setProperty(newKey, columnsJson);
      properties.deleteProperty(oldKey);
    }
    
    sheet.setName(newName);
    
    return successResponse({
      eventId: newName,
      name: newName,
      oldName: eventId,
      updated: true
    });
    
  } catch (error) {
    return errorResponse('Erro ao atualizar evento: ' + error.message);
  }
}

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
    
    // ✅ NOVO: Remove metadados
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty(`columns_${spreadsheetId}_${eventId}`);
    
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
 * ✅ CORRIGIDO: Usa colunas dinâmicas!
 */
function addGuest(data) {
  try {
    const { spreadsheetId, eventId, guest } = data;
    
    if (!spreadsheetId || !eventId || !guest) {
      return errorResponse('Dados incompletos');
    }
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(eventId);
    
    if (!sheet) {
      return errorResponse('Evento não encontrado: ' + eventId);
    }
    
    // ✅ NOVO: Lê colunas salvas do evento
    const properties = PropertiesService.getScriptProperties();
    const columnsJson = properties.getProperty(`columns_${spreadsheetId}_${eventId}`);
    
    let columns = [];
    if (columnsJson) {
      columns = JSON.parse(columnsJson);
    } else {
      // Fallback: lê header da planilha
      const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      const headerValues = headerRange.getValues()[0];
      columns = headerValues.filter(h => h && h !== 'Status' && h !== 'Adicionado Em');
    }
    
    // ✅ NOVO: Monta linha com base nas colunas do evento
    const row = [];
    
    // Adiciona valores das colunas personalizadas
    columns.forEach(col => {
      row.push(guest[col] || '');
    });
    
    // Adiciona status e data
    row.push(guest.status || 'pending');
    row.push(new Date());
    
    Logger.log('Adicionando convidado - Colunas: ' + columns.join(', '));
    Logger.log('Valores: ' + row.join(', '));
    
    sheet.appendRow(row);
    
    return successResponse({
      guestId: sheet.getLastRow(),
      eventId: eventId,
      addedAt: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('ERRO addGuest: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return errorResponse('Erro ao adicionar convidado: ' + error.message);
  }
}

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
    
    if (values.length < 2) {
      return successResponse({ guests: [] });
    }
    
    // Lê colunas do header
    const headers = values[0];
    
    const guests = [];
    
    for (let i = 1; i < values.length; i++) {
      const guest = { id: i + 1 };
      
      headers.forEach((header, idx) => {
        guest[header] = values[i][idx];
      });
      
      guests.push(guest);
    }
    
    return successResponse({ guests: guests });
    
  } catch (error) {
    return errorResponse('Erro ao listar convidados: ' + error.message);
  }
}

/**
 * ✅ CORRIGIDO: Atualiza baseado em colunas dinâmicas
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
    
    const row = guestId;
    
    // Lê header para saber qual coluna é qual
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headers = headerRange.getValues()[0];
    
    // Atualiza cada campo
    Object.keys(updates).forEach(fieldName => {
      const colIndex = headers.indexOf(fieldName);
      if (colIndex >= 0) {
        sheet.getRange(row, colIndex + 1).setValue(updates[fieldName]);
      }
    });
    
    return successResponse({ updated: true });
    
  } catch (error) {
    return errorResponse('Erro ao atualizar convidado: ' + error.message);
  }
}

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
    
    sheet.deleteRow(guestId);
    
    return successResponse({ deleted: true });
    
  } catch (error) {
    return errorResponse('Erro ao deletar convidado: ' + error.message);
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
  Logger.log('='.repeat(50));
  Logger.log('Action: ' + data.action);
  Logger.log('Data: ' + JSON.stringify(data));
  Logger.log('='.repeat(50));
}

function logError(error) {
  Logger.log('❌ ERRO: ' + error.message);
  Logger.log('Stack: ' + error.stack);
}
