/**
 * ERROR BOUNDARY v3.1.1
 * Proteção global contra crashes
 * ✅ CORRIGIDO: Verifica se função existe antes de fazer wrap
 */

const ErrorBoundary = {
  /**
   * Envolve função async com try-catch
   */
  wrap(fn, context = 'Operação') {
    // ✅ Valida se fn existe e é função
    if (!fn || typeof fn !== 'function') {
      console.warn(`⚠️ Tentou fazer wrap de função inválida: ${context}`);
      return fn;
    }
    
    return async function(...args) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        console.error(`❌ Erro em ${context}:`, error);
        
        if (typeof UICore !== 'undefined') {
          UICore.showError(`Erro: ${error.message}`);
        } else {
          alert(`Erro em ${context}: ${error.message}`);
        }
        
        // Salva estado de emergência
        if (typeof ErrorHandler !== 'undefined') {
          ErrorHandler.handleError({
            type: 'Wrapped Function Error',
            context: context,
            message: error.message,
            stack: error.stack
          });
        }
        
        return null;
      }
    };
  },
  
  /**
   * Protege objeto inteiro
   */
  protectObject(obj, name = 'Object') {
    const protected = {};
    
    for (const key in obj) {
      if (typeof obj[key] === 'function') {
        protected[key] = this.wrap(obj[key], `${name}.${key}`);
      } else {
        protected[key] = obj[key];
      }
    }
    
    return protected;
  }
};

// ✅ CORRIGIDO: Protege apenas funções que existem
if (typeof State !== 'undefined') {
  // Verifica cada função antes de fazer wrap
  if (State.addEvent && typeof State.addEvent === 'function') {
    State.addEvent = ErrorBoundary.wrap(State.addEvent, 'State.addEvent');
  }
  
  if (State.addGuest && typeof State.addGuest === 'function') {
    State.addGuest = ErrorBoundary.wrap(State.addGuest, 'State.addGuest');
  }
  
  if (State.removeEvent && typeof State.removeEvent === 'function') {
    State.removeEvent = ErrorBoundary.wrap(State.removeEvent, 'State.removeEvent');
  }
  
  console.log('✅ State functions protected');
}

window.ErrorBoundary = ErrorBoundary;
console.log('🛡️ Error Boundary v3.1.1 ativo');
