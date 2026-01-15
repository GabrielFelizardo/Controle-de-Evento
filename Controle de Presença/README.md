# Sistema de Controle de Presença v2.1
## Arquitetura Modular

Sistema completo para gerenciamento de listas de convidados em eventos, com design Swiss Design e arquitetura modular.

---

## 📁 Estrutura de Arquivos

```
presenca-refactor/
├── index.html              # Estrutura HTML (limpa, sem scripts inline)
├── css/
│   └── styles.css          # Todos os estilos CSS organizados
└── js/
    ├── utils.js            # Funções auxiliares e utilitárias
    ├── state.js            # Gerenciamento de estado
    ├── storage.js          # Persistência (localStorage)
    ├── exports.js          # Exportações (PDF, TXT, CSV)
    ├── ui.js               # Renderização e UI principal
    ├── ui-guests.js        # UI específica de convidados
    └── app.js              # Inicialização e coordenação
```

---

## 🏗️ Arquitetura

### **Separação de Responsabilidades**

Cada módulo tem uma função específica e bem definida:

#### **1. utils.js** - Utilitários
- Formatação de datas
- Validação de campos
- Detecção de ícones
- Helpers genéricos
- Funções de manipulação de strings/arrays

#### **2. state.js** - Estado da Aplicação
- Gerencia array de eventos
- CRUD de eventos e convidados
- Cálculo de estatísticas (com cache)
- Validação de dados
- Operações em lote

#### **3. storage.js** - Persistência
- Save/Load no localStorage
- Backup/Restore
- Exportação para CSV/TXT
- Gerenciamento de quota
- Validação de integridade

#### **4. exports.js** - Exportações
- Geração de PDF (jsPDF)
- Exportação TXT
- Exportação CSV
- Relatórios HTML
- Cópia para Markdown

#### **5. ui.js** - Interface Principal
- Renderização de abas
- Menus e modais
- Eventos de navegação
- Atalhos de teclado
- Fluxo de importação

#### **6. ui-guests.js** - Interface de Convidados
- Renderização de cards/tabelas
- Edição de convidados
- Formulários manuais
- Filtros e buscas
- Estatísticas visuais

#### **7. app.js** - Coordenação
- Inicialização da aplicação
- Auto-save periódico
- Debug mode
- Tratamento de erros globais

---

## 🚀 Como Usar

### **Desenvolvimento Local**

1. Clone o repositório
2. Abra `index.html` no navegador
3. Não precisa de servidor (funciona offline)

### **Debug Mode**

Adicione `?debug` na URL para ativar:

```
file:///path/to/index.html?debug
```

No console:
```javascript
DEBUG.info()        // Informações do sistema
DEBUG.export()      // Exporta estado JSON
DEBUG.validate()    // Valida integridade
DEBUG.clear()       // Limpa tudo
```

---

## 🔧 Como Modificar

### **Adicionar Nova Funcionalidade**

1. **Escolha o módulo correto:**
   - Lógica de negócio → `state.js`
   - Persistência → `storage.js`
   - Interface → `ui.js` ou `ui-guests.js`
   - Exportação → `exports.js`
   - Utilitário genérico → `utils.js`

2. **Adicione a função ao objeto do módulo:**
```javascript
// Em state.js
State.minhaNovaFuncao = function() {
    // código
};
```

3. **Use em outros módulos:**
```javascript
// Em ui.js
State.minhaNovaFuncao();
```

### **Exemplo: Adicionar Validação de Email**

**1. Adicionar validação em `utils.js`:**
```javascript
Utils.isValidEmail = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

**2. Usar na UI (`ui-guests.js`):**
```javascript
saveQuickAdd() {
    const email = document.getElementById('qa-email').value;
    
    if (!Utils.isValidEmail(email)) {
        alert('Email inválido!');
        return;
    }
    
    // ... resto do código
}
```

---

## 📊 Fluxo de Dados

```
┌─────────────┐
│   UI.js     │  ←──── Usuário interage
└──────┬──────┘
       │ 1. Chama ação
       ▼
┌─────────────┐
│  STATE.js   │  ←──── Modifica estado
└──────┬──────┘
       │ 2. Salva
       ▼
┌─────────────┐
│ STORAGE.js  │  ←──── Persiste dados
└──────┬──────┘
       │ 3. Atualiza UI
       ▼
┌─────────────┐
│   UI.js     │  ←──── Re-renderiza
└─────────────┘
```

---

## 🎨 Convenções de Código

### **Nomenclatura**
- Funções públicas: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Elementos DOM: prefixo `btn-`, `modal-`, etc.
- Data attributes: `data-action`, `data-method`

### **Estrutura de Função**
```javascript
/**
 * Descrição clara da função
 * @param {tipo} nome - Descrição do parâmetro
 * @returns {tipo} Descrição do retorno
 */
nomeDaFuncao(parametro) {
    // Validações
    if (!parametro) return;
    
    // Lógica principal
    const resultado = processamento();
    
    // Efeitos colaterais
    Storage.save();
    
    // Retorno
    return resultado;
}
```

---

## 🧪 Testes Manuais

### **Checklist Básico**

- [ ] Criar novo evento
- [ ] Importar via copiar/colar
- [ ] Adicionar convidados manualmente
- [ ] Marcar presença (Sim/Não)
- [ ] Editar convidado
- [ ] Excluir convidado
- [ ] Exportar PDF
- [ ] Exportar CSV
- [ ] Fazer backup
- [ ] Restaurar backup
- [ ] Duplicar evento
- [ ] Alternar entre eventos
- [ ] Buscar convidados
- [ ] Ordenar lista
- [ ] Estatísticas detalhadas
- [ ] Modo compacto
- [ ] Atalhos de teclado

### **Testes de Edge Cases**

- Colar dados com separador diferente
- Importar planilha com colunas duplicadas
- Adicionar 500+ convidados (performance)
- localStorage cheio (quota exceeded)
- Restaurar backup corrompido
- Navegação com múltiplos eventos

---

## 🐛 Debug

### **Logs Úteis**

O sistema usa `Utils.log()` para debug:
```javascript
Utils.log('Mensagem', dadosOpcionais);
```

Veja no console do navegador (F12).

### **Inspecionar Estado**

```javascript
// No console (com debug mode)
DEBUG.State.events          // Ver todos os eventos
DEBUG.State.getCurrentEvent() // Evento atual
DEBUG.Storage.getStorageInfo() // Info do storage
```

### **Forçar Re-render**

```javascript
UI.renderEventContent();  // Re-renderiza conteúdo
UI.renderTabs();          // Re-renderiza abas
```

---

## 📈 Performance

### **Otimizações Implementadas**

1. **Cache de Estatísticas**
   - Stats são calculadas uma vez e cacheadas
   - Cache é limpo apenas quando dados mudam

2. **Debounce em Auto-save**
   - Salva após 1s de inatividade
   - Evita writes excessivos

3. **Event Delegation**
   - Listeners em elementos pais
   - Menos listeners = melhor performance

4. **Lazy Loading**
   - Bibliotecas carregadas só quando usadas
   - Chart.js só ativa no modal de stats

### **Limites Recomendados**

- Eventos: ilimitado (prático: ~50)
- Convidados por evento: ~1000
- Storage total: ~4MB (aviso em 80%)

---

## 🚀 Melhorias Futuras

### **Curto Prazo**
- [ ] Undo/Redo (stack de ações)
- [ ] Validação de campos (email, telefone)
- [ ] Temas de cores personalizáveis
- [ ] Importação de Excel real (XLSX)

### **Médio Prazo**
- [ ] QR Code para check-in
- [ ] Templates de eventos
- [ ] Integração Google Sheets
- [ ] PWA (offline-first)

### **Longo Prazo**
- [ ] Multi-usuário (Firebase)
- [ ] Analytics dashboard
- [ ] API REST
- [ ] Mobile app nativo

---

## 📝 Notas Técnicas

### **Por que Não Usar Framework?**
- **Tamanho:** Arquivo único de ~200KB (vs React 100KB+)
- **Simplicidade:** Menos abstração = mais controle
- **Performance:** Vanilla JS é rápido
- **Aprendizado:** Código educativo e direto

### **Compatibilidade**
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ❌ (não suportado)

### **Dependências Externas**
- jsPDF 2.5.1 (geração de PDF)
- jsPDF-AutoTable 3.5.31 (tabelas no PDF)
- Chart.js 4.4.0 (gráficos de estatísticas)

---

## 🤝 Contribuindo

### **Para Reportar Bugs**
1. Descreva o problema
2. Passos para reproduzir
3. Comportamento esperado
4. Screenshot (se aplicável)
5. Console logs (F12 → Console)

### **Para Sugerir Features**
1. Descreva a funcionalidade
2. Justifique o caso de uso
3. Proponha a implementação (opcional)

---

## 📜 Licença

Desenvolvido por Gabriel - SEDEICS/RJ  
Sistema livre para uso interno

---

## 🎓 Metodologia "Prompt Felizardo"

Este sistema foi desenvolvido usando a metodologia **Prompt Felizardo**, que orquestra múltiplos sistemas de IA (Gemini, DeepSeek, Claude) para criar soluções funcionais rapidamente, mantendo qualidade profissional.

**Princípios aplicados:**
- ✅ Código limpo e legível
- ✅ Arquitetura modular
- ✅ Documentação completa
- ✅ Performance otimizada
- ✅ UX bem pensada

---

**Versão:** 2.1 - Arquitetura Modular  
**Data:** Janeiro 2026  
**Status:** ✅ Production Ready
