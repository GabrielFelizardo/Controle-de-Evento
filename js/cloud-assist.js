/**
 * CLOUD-ASSIST.JS
 * Sistema assistido de backup em nuvem
 * Guia o usuário passo-a-passo sem precisar de APIs
 */

const CloudAssist = {
    /**
     * Mostra menu de escolha de nuvem
     */
    showCloudMenu() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'cloud-menu-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">☁️ SALVAR NA NUVEM</h2>
                </div>
                
                <p style="margin-bottom: var(--space-4);">
                    Seus dados serão exportados e você será guiado para fazer upload no serviço escolhido:
                </p>
                
                <div class="cloud-options">
                    <button class="cloud-option" data-cloud="drive">
                        <div class="cloud-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M17 6L3 26h14z"/>
                                <path fill="#1976D2" d="M31 6l-7 12h14z"/>
                                <path fill="#4CAF50" d="M38 18L24 42l14-24z"/>
                                <path fill="#FB8C00" d="M10 26L24 42 38 26z"/>
                            </svg>
                        </div>
                        <div class="cloud-info">
                            <strong>Google Drive</strong>
                            <p class="body-text-small">15GB grátis · Mais usado</p>
                        </div>
                        <span class="cloud-badge">RECOMENDADO</span>
                    </button>
                    
                    <button class="cloud-option" data-cloud="dropbox">
                        <div class="cloud-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <path fill="#0061FF" d="M12 8L24 16L12 24L0 16z"/>
                                <path fill="#0061FF" d="M36 8L24 16L36 24L48 16z"/>
                                <path fill="#0061FF" d="M12 32L24 40L12 48L0 40z"/>
                                <path fill="#0061FF" d="M36 32L24 40L36 48L48 40z"/>
                            </svg>
                        </div>
                        <div class="cloud-info">
                            <strong>Dropbox</strong>
                            <p class="body-text-small">2GB grátis · Fácil compartilhar</p>
                        </div>
                    </button>
                    
                    <button class="cloud-option" data-cloud="onedrive">
                        <div class="cloud-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <path fill="#0078D4" d="M30 12c-5.5 0-10 4.5-10 10 0 .3 0 .6.1.9C16.8 24 14 27.2 14 31c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8 0-3.9-2.8-7.1-6.5-7.8C39.5 18.1 35.2 14 30 14z"/>
                            </svg>
                        </div>
                        <div class="cloud-info">
                            <strong>OneDrive</strong>
                            <p class="body-text-small">5GB grátis · Integra com Windows</p>
                        </div>
                    </button>
                    
                    <button class="cloud-option" data-cloud="whatsapp">
                        <div class="cloud-icon">💬</div>
                        <div class="cloud-info">
                            <strong>WhatsApp (Eu mesmo)</strong>
                            <p class="body-text-small">Manda arquivo pra você · Rápido</p>
                        </div>
                    </button>
                    
                    <button class="cloud-option" data-cloud="email">
                        <div class="cloud-icon">✉️</div>
                        <div class="cloud-info">
                            <strong>Email</strong>
                            <p class="body-text-small">Envia por email · Universal</p>
                        </div>
                    </button>
                </div>
                
                <button class="btn" data-modal-action="cancel" style="width: 100%; margin-top: var(--space-3);">
                    CANCELAR
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelectorAll('[data-cloud]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cloud = btn.dataset.cloud;
                modal.remove();
                this.processCloudChoice(cloud);
            });
        });
        
        modal.querySelector('[data-modal-action="cancel"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Processa escolha e inicia fluxo
     */
    async processCloudChoice(cloud) {
        // 1. Exporta dados
        const data = State.exportState();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const filename = `Eventos_${new Date().toISOString().split('T')[0]}.json`;
        
        // 2. Download do arquivo
        Utils.downloadBlob(blob, filename);
        
        // 3. Aguarda um pouco pro download processar
        await Utils.sleep(800);
        
        // 4. Mostra tutorial específico
        switch(cloud) {
            case 'drive':
                this.showDriveTutorial(filename);
                break;
            case 'dropbox':
                this.showDropboxTutorial(filename);
                break;
            case 'onedrive':
                this.showOneDriveTutorial(filename);
                break;
            case 'whatsapp':
                this.showWhatsAppTutorial(filename);
                break;
            case 'email':
                this.showEmailTutorial(filename);
                break;
        }
    },
    
    /**
     * Tutorial Google Drive
     */
    showDriveTutorial(filename) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'tutorial-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2 class="modal-title">📁 GOOGLE DRIVE - PASSO A PASSO</h2>
                </div>
                
                <div style="background: #e8f5e9; padding: var(--space-3); border-left: 4px solid #00cc44; margin-bottom: var(--space-4);">
                    <strong>✅ Arquivo baixado:</strong> ${filename}
                </div>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Abra o Google Drive</h3>
                            <p class="body-text-small">Vamos abrir em uma nova aba pra você</p>
                            <button class="btn btn-primary" id="open-drive-btn">
                                📁 ABRIR GOOGLE DRIVE
                            </button>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Faça o Upload</h3>
                            <p class="body-text-small">No Google Drive:</p>
                            <ul style="margin-left: 20px; margin-top: 8px;">
                                <li>Clique no botão <strong>"Novo"</strong> (canto superior esquerdo)</li>
                                <li>Escolha <strong>"Upload de arquivo"</strong></li>
                                <li>Selecione o arquivo <strong>${filename}</strong></li>
                                <li>Aguarde o upload completar</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Pronto!</h3>
                            <p class="body-text-small">
                                Seu backup está salvo no Drive. 
                                Você pode acessá-lo de qualquer lugar!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="help-note" style="margin-top: var(--space-4);">
                    <p><strong>💡 DICA:</strong></p>
                    <p class="body-text-small">
                        Crie uma pasta chamada "Backups Eventos" no Drive pra manter tudo organizado.
                        Sempre que fizer mudanças importantes, salve uma nova versão!
                    </p>
                </div>
                
                <div class="tutorial-actions">
                    <button class="btn btn-primary" data-action="close" style="width: 100%;">
                        ENTENDI, PODE FECHAR
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Abre Drive quando clicar
        modal.querySelector('#open-drive-btn').addEventListener('click', () => {
            window.open('https://drive.google.com', '_blank');
            // Desabilita botão
            const btn = modal.querySelector('#open-drive-btn');
            btn.disabled = true;
            btn.textContent = '✓ Drive aberto em nova aba';
            btn.style.opacity = '0.6';
        });
        
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Tutorial Dropbox
     */
    showDropboxTutorial(filename) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'tutorial-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2 class="modal-title">📦 DROPBOX - PASSO A PASSO</h2>
                </div>
                
                <div style="background: #e8f5e9; padding: var(--space-3); border-left: 4px solid #00cc44; margin-bottom: var(--space-4);">
                    <strong>✅ Arquivo baixado:</strong> ${filename}
                </div>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Abra o Dropbox</h3>
                            <button class="btn btn-primary" id="open-dropbox-btn">
                                📦 ABRIR DROPBOX
                            </button>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Faça o Upload</h3>
                            <p class="body-text-small">No Dropbox:</p>
                            <ul style="margin-left: 20px; margin-top: 8px;">
                                <li>Clique no botão <strong>"Upload"</strong></li>
                                <li>Escolha <strong>"Arquivos"</strong></li>
                                <li>Selecione <strong>${filename}</strong></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Pronto!</h3>
                            <p class="body-text-small">Backup salvo no Dropbox!</p>
                        </div>
                    </div>
                </div>
                
                <button class="btn btn-primary" data-action="close" style="width: 100%; margin-top: var(--space-3);">
                    ENTENDI
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#open-dropbox-btn').addEventListener('click', () => {
            window.open('https://www.dropbox.com/home', '_blank');
            const btn = modal.querySelector('#open-dropbox-btn');
            btn.disabled = true;
            btn.textContent = '✓ Dropbox aberto';
            btn.style.opacity = '0.6';
        });
        
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Tutorial OneDrive
     */
    showOneDriveTutorial(filename) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2 class="modal-title">☁️ ONEDRIVE - PASSO A PASSO</h2>
                </div>
                
                <div style="background: #e8f5e9; padding: var(--space-3); border-left: 4px solid #00cc44; margin-bottom: var(--space-4);">
                    <strong>✅ Arquivo baixado:</strong> ${filename}
                </div>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Abra o OneDrive</h3>
                            <button class="btn btn-primary" id="open-onedrive-btn">
                                ☁️ ABRIR ONEDRIVE
                            </button>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Faça o Upload</h3>
                            <ul style="margin-left: 20px; margin-top: 8px;">
                                <li>Clique em <strong>"Carregar"</strong> (barra superior)</li>
                                <li>Escolha <strong>"Arquivos"</strong></li>
                                <li>Selecione <strong>${filename}</strong></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Pronto!</h3>
                            <p class="body-text-small">Sincronizado com OneDrive!</p>
                        </div>
                    </div>
                </div>
                
                <button class="btn btn-primary" data-action="close" style="width: 100%; margin-top: var(--space-3);">
                    ENTENDI
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#open-onedrive-btn').addEventListener('click', () => {
            window.open('https://onedrive.live.com/', '_blank');
            const btn = modal.querySelector('#open-onedrive-btn');
            btn.disabled = true;
            btn.textContent = '✓ OneDrive aberto';
            btn.style.opacity = '0.6';
        });
        
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Tutorial WhatsApp
     */
    showWhatsAppTutorial(filename) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">💬 WHATSAPP - PASSO A PASSO</h2>
                </div>
                
                <div style="background: #e8f5e9; padding: var(--space-3); border-left: 4px solid #00cc44; margin-bottom: var(--space-4);">
                    <strong>✅ Arquivo baixado:</strong> ${filename}
                </div>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Abra o WhatsApp Web</h3>
                            <button class="btn btn-primary" id="open-whatsapp-btn">
                                💬 ABRIR WHATSAPP WEB
                            </button>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Envie pra você mesmo</h3>
                            <ul style="margin-left: 20px; margin-top: 8px;">
                                <li>Procure por <strong>"Você"</strong> ou seu próprio nome</li>
                                <li>Clique no ícone de <strong>📎 clipe</strong></li>
                                <li>Escolha <strong>"Documento"</strong></li>
                                <li>Selecione <strong>${filename}</strong></li>
                                <li>Envie!</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Acesse de qualquer lugar!</h3>
                            <p class="body-text-small">
                                Agora o arquivo está no seu WhatsApp.
                                Abra em qualquer celular/PC e baixe!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="help-note" style="margin-top: var(--space-4);">
                    <p><strong>💡 DICA:</strong></p>
                    <p class="body-text-small">
                        Você também pode criar um grupo só com você e salvar todos os backups lá!
                    </p>
                </div>
                
                <button class="btn btn-primary" data-action="close" style="width: 100%; margin-top: var(--space-3);">
                    ENTENDI
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#open-whatsapp-btn').addEventListener('click', () => {
            window.open('https://web.whatsapp.com/', '_blank');
            const btn = modal.querySelector('#open-whatsapp-btn');
            btn.disabled = true;
            btn.textContent = '✓ WhatsApp aberto';
            btn.style.opacity = '0.6';
        });
        
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    /**
     * Tutorial Email
     */
    showEmailTutorial(filename) {
        // Abre cliente de email
        const subject = encodeURIComponent('Backup - Controle de Presença');
        const body = encodeURIComponent(
            'Olá!\n\n' +
            'Segue em anexo o backup dos meus eventos.\n\n' +
            'Arquivo: ' + filename + '\n\n' +
            '---\n' +
            'Para restaurar:\n' +
            '1. Baixe o arquivo anexo\n' +
            '2. Abra o sistema\n' +
            '3. Menu Arquivo → Importar Arquivo\n' +
            '4. Selecione o arquivo baixado'
        );
        
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        
        // Modal de instruções
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">✉️ EMAIL - PASSO A PASSO</h2>
                </div>
                
                <div style="background: #e8f5e9; padding: var(--space-3); border-left: 4px solid #00cc44; margin-bottom: var(--space-4);">
                    <strong>✅ Arquivo baixado:</strong> ${filename}
                </div>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Email abriu?</h3>
                            <p class="body-text-small">
                                Seu programa de email deve ter aberto com um rascunho pronto.
                            </p>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Anexe o arquivo</h3>
                            <ul style="margin-left: 20px; margin-top: 8px;">
                                <li>Clique em <strong>"Anexar"</strong> ou no ícone 📎</li>
                                <li>Selecione <strong>${filename}</strong> (está na pasta Downloads)</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Envie pra você mesmo</h3>
                            <p class="body-text-small">
                                Coloque seu próprio email como destinatário e envie!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="help-note" style="margin-top: var(--space-4);">
                    <p><strong>💡 VANTAGEM DO EMAIL:</strong></p>
                    <p class="body-text-small">
                        Funciona em qualquer lugar, não precisa de app instalado.
                        Você pode baixar o arquivo de qualquer computador/celular!
                    </p>
                </div>
                
                <button class="btn btn-primary" data-action="close" style="width: 100%; margin-top: var(--space-3);">
                    ENTENDI
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.remove();
        });
    }
};

// Exporta globalmente
window.CloudAssist = CloudAssist;
