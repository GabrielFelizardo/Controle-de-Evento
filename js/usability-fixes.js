/**
 * CORREÇÕES DE USABILIDADE
 * Resolve problemas de tabela, método visível e adiciona templates
 */

// ========================================
// 1. DETECTOR DE SCROLL HORIZONTAL
// ========================================

const ScrollDetector = {
    init() {
        // Monitora tabela
        const observer = new MutationObserver(() => {
            this.checkTableScroll();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Checa em resize
        window.addEventListener('resize', () => this.checkTableScroll());
    },
    
    checkTableScroll() {
        const wrapper = document.querySelector('.table-wrapper');
        if (!wrapper) return;
        
        const table = wrapper.querySelector('.desktop-table');
        if (!table) return;
        
        const hasScroll = table.scrollWidth > wrapper.clientWidth;
        
        wrapper.classList.toggle('has-scroll', hasScroll);
        
        // Mostra hint se tiver scroll
        let hint = document.getElementById('table-scroll-hint');
        if (hasScroll && !hint) {
            hint = document.createElement('div');
            hint.id = 'table-scroll-hint';
            hint.className = 'table-scroll-hint visible';
            hint.innerHTML = '← Arraste para ver mais colunas →';
            wrapper.parentElement.insertBefore(hint, wrapper);
        } else if (!hasScroll && hint) {
            hint.remove();
        }
    }
};

// ========================================
// 2. ESCONDER ESCOLHA DE MÉTODO
// ========================================

Object.assign(UI, {
    // CORRIGE: renderPasteSection esconde choice-section
    renderPasteSection(event) {
        const container = document.getElementById('event-content');
        
        // Remove seção de escolha se existir
        const choiceSection = container.querySelector('.choice-section');
        if (choiceSection) {
            choiceSection.remove();
        }
        
        container.innerHTML = `
            <section class="import-section active">
                <div class="form-group">
                    <label class="label">COLE OS DADOS DA PLANILHA</label>
                    <textarea id="paste-data" class="input" style="min-height: 200px; font-family: monospace; font-size: 13px;" placeholder="Ctrl+A na planilha → Ctrl+C → Ctrl+V aqui"></textarea>
                    <div class="help-note">
                        <p class="body-text-small"><strong>PASSO A PASSO:</strong></p>
                        <p class="body-text-small">1. Abra sua planilha no Google Sheets</p>
                        <p class="body-text-small">2. Selecione TUDO (Ctrl+A)</p>
                        <p class="body-text-small">3. Copie (Ctrl+C)</p>
                        <p class="body-text-small">4. Cole acima (Ctrl+V)</p>
                        <p class="body-text-small">5. Clique em IMPORTAR</p>
                        <p class="body-text-small"><strong>IMPORTANTE:</strong> Primeira linha = nomes das colunas</p>
                    </div>
                    <div class="action-bar" style="margin-top: var(--space-3);">
                        <button class="btn btn-success" id="btn-import-paste">IMPORTAR</button>
                        <button class="btn" id="btn-reset-method">← VOLTAR</button>
                    </div>
                </div>
            </section>
        `;

        document.getElementById('btn-import-paste').addEventListener('click', () => this.loadPastedData());
        document.getElementById('btn-reset-method').addEventListener('click', () => this.resetMethod());

        if (event.guests.length > 0) {
            this.renderGuestsSection(event);
        }
    },
    
    // CORRIGE: renderManualSection esconde choice-section
    renderManualSection(event) {
        const container = document.getElementById('event-content');
        
        // Remove seção de escolha se existir
        const choiceSection = container.querySelector('.choice-section');
        if (choiceSection) {
            choiceSection.remove();
        }

        if (event.guests.length === 0) {
            container.innerHTML = `
                <section class="manual-section active">
                    <div class="form-group">
                        <label class="label">DEFINA AS COLUNAS</label>
                        <input type="text" class="input" id="column-names" placeholder="Ex: Nome, Telefone, Email, Cidade (separado por vírgula)">
                        
                        <!-- NOVO: Carregar template -->
                        <div style="margin-top: var(--space-2);">
                            <button class="btn btn-small" id="btn-load-template">
                                📋 CARREGAR TEMPLATE
                            </button>
                        </div>
                        
                        <div class="help-note">
                            <p class="body-text-small">Digite os nomes das colunas que você quer, separados por vírgula.</p>
                            <p class="body-text-small">Ou carregue um template salvo anteriormente.</p>
                        </div>
                        <button class="btn btn-success" style="margin-top: var(--space-2);" id="btn-setup-columns">DEFINIR COLUNAS</button>
                    </div>
                    <button class="btn" id="btn-reset-method-2">← VOLTAR</button>
                </section>
            `;

            document.getElementById('btn-setup-columns').addEventListener('click', () => this.setupManualColumns());
            document.getElementById('btn-reset-method-2').addEventListener('click', () => this.resetMethod());
            document.getElementById('btn-load-template').addEventListener('click', () => ColumnTemplates.showTemplateSelector());
        } else {
            this.renderGuestsSection(event);
        }
    }
});

// ========================================
// 3. ADICIONAR MAIS CONVIDADOS NO PASTE
// ========================================

Object.assign(UI, {
    // NOVO: Renderiza seção de convidados COM botão de adicionar
    renderGuestsSection(event) {
        const container = document.getElementById('event-content');
        
        const stats = State.calculateStats(event.id);
        const percentage = Utils.calculatePercentage(stats.yes, stats.total);

        // Remove seção de escolha se existir
        const choiceSection = container.querySelector('.choice-section');
        if (choiceSection) {
            choiceSection.remove();
        }

        container.innerHTML = `
            <section class="section">
                <div class="section-header">
                    <h2 class="heading-2">📊 ESTATÍSTICAS</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="label">TOTAL</div>
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-meta">Convidados</div>
                    </div>
                    <div class="stat-card success">
                        <div class="label">CONFIRMADOS</div>
                        <div class="stat-value">${stats.yes}</div>
                        <div class="stat-meta">${percentage}%</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="stat-card danger">
                        <div class="label">RECUSAS</div>
                        <div class="stat-value">${stats.no}</div>
                        <div class="stat-meta">${Utils.calculatePercentage(stats.no, stats.total)}%</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">PENDENTES</div>
                        <div class="stat-value">${stats.pending}</div>
                        <div class="stat-meta">Aguardando</div>
                    </div>
                </div>
            </section>

            <section class="table-card">
                <div class="table-header">
                    <h3 class="table-title">👥 CONVIDADOS (${event.guests.length})</h3>
                    <input type="text" class="search-input" placeholder="BUSCAR..." id="search-guests">
                </div>

                <!-- NOVO: Botões de ação acima da tabela -->
                <div style="padding: var(--space-3); border-bottom: 2px solid var(--gray-200); display: flex; gap: var(--space-2); flex-wrap: wrap;">
                    <button class="btn btn-success" id="btn-add-more">
                        + ADICIONAR MAIS CONVIDADOS
                    </button>
                    <button class="btn" id="btn-save-template">
                        💾 SALVAR ESTRUTURA COMO TEMPLATE
                    </button>
                    ${event.method === 'paste' ? `
                        <button class="btn" id="btn-import-more">
                            📋 IMPORTAR MAIS DA PLANILHA
                        </button>
                    ` : ''}
                </div>

                <div class="table-wrapper">
                    <div id="guests-cards"></div>
                    <table class="desktop-table">
                        <thead>
                            <tr>
                                ${event.columns.map(col => `<th><span class="label">${col.toUpperCase()}</span></th>`).join('')}
                                <th style="text-align: center;"><span class="label">STATUS</span></th>
                                <th><span class="label">AÇÕES</span></th>
                            </tr>
                        </thead>
                        <tbody id="guests-tbody"></tbody>
                    </table>
                </div>

                <div class="table-footer">
                    <div class="footer-info">${event.guests.length} CONVIDADOS</div>
                    <div class="footer-actions">
                        <button class="btn" id="btn-export-pdf-footer">📄 PDF</button>
                        <button class="btn" id="btn-export-txt-footer">📝 TXT</button>
                        <button class="btn" id="btn-export-csv-footer">📊 CSV</button>
                    </div>
                </div>
            </section>
        `;

        // Listeners
        document.getElementById('search-guests').addEventListener('keyup', (e) => this.filterGuests(e));
        document.getElementById('btn-export-pdf-footer').addEventListener('click', () => Exports.exportPDF(event.id));
        document.getElementById('btn-export-txt-footer').addEventListener('click', () => Exports.exportTXT(event.id));
        document.getElementById('btn-export-csv-footer').addEventListener('click', () => Exports.exportCSV(event.id));
        
        // NOVO: Botão adicionar mais
        document.getElementById('btn-add-more').addEventListener('click', () => this.showQuickAdd());
        
        // NOVO: Salvar template
        document.getElementById('btn-save-template').addEventListener('click', () => ColumnTemplates.saveTemplate(event.columns));
        
        // NOVO: Importar mais (só no modo paste)
        if (event.method === 'paste') {
            document.getElementById('btn-import-more').addEventListener('click', () => this.showImportMoreModal());
        }

        this.renderGuestsList(event);
        
        // Inicia detector de scroll
        setTimeout(() => ScrollDetector.checkTableScroll(), 100);
    },
    
    // NOVO: Modal para importar mais convidados
    showImportMoreModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'import-more-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">IMPORTAR MAIS CONVIDADOS</h2>
                </div>
                <div class="form-group">
                    <label class="label">COLE MAIS DADOS DA PLANILHA</label>
                    <textarea id="paste-more-data" class="input" style="min-height: 200px; font-family: monospace; font-size: 13px;" placeholder="Cole aqui (sem cabeçalho desta vez)"></textarea>
                    <div class="help-note">
                        <p class="body-text-small"><strong>IMPORTANTE:</strong> Cole apenas as LINHAS de dados, sem o cabeçalho!</p>
                        <p class="body-text-small">As colunas devem estar na mesma ordem que você usou antes.</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn" data-modal-action="cancel">CANCELAR</button>
                    <button class="btn btn-success" id="btn-confirm-import-more">ADICIONAR</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('[data-modal-action="cancel"]').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('btn-confirm-import-more').addEventListener('click', () => {
            this.importMoreGuests();
            modal.remove();
        });
    },
    
    // NOVO: Importa mais convidados (sem cabeçalho)
    importMoreGuests() {
        const data = document.getElementById('paste-more-data').value.trim();
        if (!data) {
            alert('Cole os dados primeiro!');
            return;
        }
        
        try {
            const event = State.getCurrentEvent();
            const lines = data.split('\n').map(l => l.trim()).filter(l => l);
            const separator = Utils.detectSeparator(lines[0]);
            
            const newGuests = [];
            lines.forEach(line => {
                const values = line.split(separator);
                if (values.every(v => !v.trim())) return; // Pula vazias
                
                const guest = { 
                    id: Utils.generateId(),
                    status: null 
                };
                
                event.columns.forEach((col, idx) => {
                    guest[col] = (values[idx] || '').trim();
                });
                
                newGuests.push(guest);
            });
            
            if (newGuests.length === 0) {
                alert('Nenhum dado válido encontrado!');
                return;
            }
            
            // Adiciona aos convidados existentes
            event.guests.push(...newGuests);
            Storage.save();
            this.renderEventContent();
            
            alert(`✓ ${newGuests.length} convidados adicionados!`);
            
        } catch (error) {
            alert(`❌ Erro: ${error.message}`);
        }
    }
});

// ========================================
// 4. SISTEMA DE TEMPLATES DE COLUNAS
// ========================================

const ColumnTemplates = {
    STORAGE_KEY: 'column_templates',
    
    /**
     * Salva template
     */
    saveTemplate(columns) {
        const name = prompt('Nome do template:', `Template ${new Date().toLocaleDateString()}`);
        if (!name) return;
        
        const templates = this.getTemplates();
        
        templates.push({
            id: Utils.generateId(),
            name: name,
            columns: columns,
            createdAt: new Date().toISOString(),
            usageCount: 0
        });
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
        alert(`✓ Template "${name}" salvo com sucesso!`);
    },
    
    /**
     * Carrega templates salvos
     */
    getTemplates() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    },
    
    /**
     * Mostra seletor de templates
     */
    showTemplateSelector() {
        const templates = this.getTemplates();
        
        if (templates.length === 0) {
            alert('Você ainda não tem templates salvos!\n\nCrie um evento e clique em "Salvar Estrutura como Template".');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'template-selector-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">📋 TEMPLATES SALVOS</h2>
                </div>
                
                <div style="display: grid; gap: var(--space-2); max-height: 400px; overflow-y: auto;">
                    ${templates.map(t => `
                        <div class="template-card" data-template-id="${t.id}">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <strong style="font-size: 16px;">${t.name}</strong>
                                    <div class="body-text-small" style="margin-top: 4px;">
                                        ${t.columns.length} colunas · Criado em ${new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                                        ${t.columns.map(col => `
                                            <span style="padding: 2px 8px; background: var(--gray-200); border-radius: 4px; font-size: 11px;">
                                                ${col}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                <button class="btn btn-small btn-danger" data-action="delete" data-id="${t.id}">
                                    🗑
                                </button>
                            </div>
                            <button class="btn btn-success" style="width: 100%; margin-top: var(--space-2);" data-action="use" data-id="${t.id}">
                                USAR ESTE TEMPLATE
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn" data-modal-action="cancel">CANCELAR</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Listener: Usar template
        modal.querySelectorAll('[data-action="use"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.dataset.id);
                this.useTemplate(id);
                modal.remove();
            });
        });
        
        // Listener: Deletar template
        modal.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Deletar este template?')) {
                    const id = parseFloat(btn.dataset.id);
                    this.deleteTemplate(id);
                    modal.remove();
                    this.showTemplateSelector(); // Reabre
                }
            });
        });
        
        // Listener: Fechar
        modal.querySelector('[data-modal-action="cancel"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Usa um template
     */
    useTemplate(id) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === id);
        
        if (!template) {
            alert('Template não encontrado!');
            return;
        }
        
        // Preenche input com colunas
        const input = document.getElementById('column-names');
        if (input) {
            input.value = template.columns.join(', ');
        }
        
        // Incrementa contador de uso
        template.usageCount++;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
        
        alert(`✓ Template "${template.name}" carregado!`);
    },
    
    /**
     * Deleta template
     */
    deleteTemplate(id) {
        const templates = this.getTemplates();
        const filtered = templates.filter(t => t.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    },
    
    /**
     * Templates pré-definidos (sugestões)
     */
    getPresetTemplates() {
        return [
            {
                name: '🎉 Festa/Aniversário',
                columns: ['Nome', 'Telefone', 'Acompanhantes', 'Observações']
            },
            {
                name: '💒 Casamento',
                columns: ['Nome', 'Telefone', 'Email', 'Acompanhante', 'Restrição Alimentar', 'Mesa']
            },
            {
                name: '🏢 Evento Corporativo',
                columns: ['Nome', 'Email', 'Empresa', 'Cargo', 'Telefone']
            },
            {
                name: '📚 Workshop/Curso',
                columns: ['Nome', 'Email', 'Telefone', 'Área de Interesse', 'Nível']
            },
            {
                name: '🎓 Formatura',
                columns: ['Nome', 'Telefone', 'Curso', 'Convites', 'Mesa']
            }
        ];
    },
    
    /**
     * Mostra presets na primeira vez
     */
    showPresetsIfFirstTime() {
        const hasUsedBefore = localStorage.getItem('has_used_templates');
        
        if (!hasUsedBefore && this.getTemplates().length === 0) {
            const usePreset = confirm(
                '💡 DICA: Quer usar um template pronto?\n\n' +
                'Temos templates prontos para:\n' +
                '• Festas/Aniversários\n' +
                '• Casamentos\n' +
                '• Eventos Corporativos\n' +
                '• E mais!\n\n' +
                'Mostrar templates?'
            );
            
            if (usePreset) {
                this.showPresetSelector();
            }
            
            localStorage.setItem('has_used_templates', 'true');
        }
    },
    
    /**
     * Mostra seletor de presets
     */
    showPresetSelector() {
        const presets = this.getPresetTemplates();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">📋 TEMPLATES PRONTOS</h2>
                </div>
                
                <p style="margin-bottom: var(--space-3);">
                    Escolha um template pronto ou personalize depois:
                </p>
                
                <div style="display: grid; gap: var(--space-2);">
                    ${presets.map((preset, idx) => `
                        <button class="choice-card" style="text-align: left; cursor: pointer; padding: var(--space-3);" data-preset-idx="${idx}">
                            <div class="choice-title" style="font-size: 18px; margin-bottom: 8px;">
                                ${preset.name}
                            </div>
                            <div class="body-text-small" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                                ${preset.columns.map(col => `
                                    <span style="padding: 2px 8px; background: var(--gray-200); border-radius: 4px; font-size: 11px;">
                                        ${col}
                                    </span>
                                `).join('')}
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn" data-modal-action="cancel">CRIAR DO ZERO</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Listener: Usar preset
        modal.querySelectorAll('[data-preset-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.presetIdx);
                const preset = presets[idx];
                
                const input = document.getElementById('column-names');
                if (input) {
                    input.value = preset.columns.join(', ');
                }
                
                modal.remove();
                alert(`✓ Template "${preset.name}" carregado!`);
            });
        });
        
        modal.querySelector('[data-modal-action="cancel"]').addEventListener('click', () => {
            modal.remove();
        });
    }
};

// Inicializa detector de scroll quando carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollDetector.init());
} else {
    ScrollDetector.init();
}

// Exporta globalmente
window.ScrollDetector = ScrollDetector;
window.ColumnTemplates = ColumnTemplates;
