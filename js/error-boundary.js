/**
 * ERROR BOUNDARY v3.1.0
 * Proteção global contra crashes
 */

const ErrorBoundary = {
  /**
   * Envolve função async com try-catch
   */
  wrap(fn, context = 'Operação') {
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

// Protege APIs críticas
if (typeof State !== 'undefined') {
  State.createEvent = ErrorBoundary.wrap(State.createEvent, 'State.createEvent');
  State.addGuest = ErrorBoundary.wrap(State.addGuest, 'State.addGuest');
  State.deleteEvent = ErrorBoundary.wrap(State.deleteEvent, 'State.deleteEvent');
}

window.ErrorBoundary = ErrorBoundary;
console.log('🛡️ Error Boundary v3.1.0 ativo');
