// Importação de Dados
class ImportacaoDados {
    constructor() {
        this.dados = carregarDados();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.carregarHistorico();
    }

    configurarEventos() {
        // Upload de vendas
        this.configurarUpload('vendas');
        
        // Upload de estoque
        this.configurarUpload('estoque');

        // Botões de importação
        const importarVendasBtn = document.getElementById('importar-vendas-btn');
        const importarEstoqueBtn = document.getElementById('importar-estoque-btn');

        if (importarVendasBtn) {
            importarVendasBtn.addEventListener('click', () => {
                this.importarVendas();
            });
        }

        if (importarEstoqueBtn) {
            importarEstoqueBtn.addEventListener('click', () => {
                this.importarEstoque();
            });
        }
    }

    configurarUpload(tipo) {
        const uploadArea = document.getElementById(`upload-${tipo}`);
        const fileInput = document.getElementById(`planilha-${tipo}`);
        const selecionarBtn = document.getElementById(`selecionar-${tipo}`);
        const importarBtn = document.getElementById(`importar-${tipo}-btn`);

        if (!uploadArea || !fileInput || !selecionarBtn) return;

        // Clique no botão de seleção
        selecionarBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Alteração no input de arquivo
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.atualizarUploadArea(tipo, e.target.files[0]);
                importarBtn.disabled = false;
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.atualizarUploadArea(tipo, e.dataTransfer.files[0]);
                importarBtn.disabled = false;
            }
        });
    }

    atualizarUploadArea(tipo, arquivo) {
        const uploadArea = document.getElementById(`upload-${tipo}`);
        if (!uploadArea) return;

        uploadArea.innerHTML = `
            <i class="fas fa-file-excel" style="color: var(--success);"></i>
            <p><strong>${arquivo.name}</strong></p>
            <p>Tamanho: ${this.formatarTamanhoArquivo(arquivo.size)}</p>
            <button class="btn btn-secondary" onclick="importacaoDados.removerArquivo('${tipo}')">
                Remover Arquivo
            </button>
        `;
    }

    formatarTamanhoArquivo(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removerArquivo(tipo) {
        const fileInput = document.getElementById(`planilha-${tipo}`);
        const uploadArea = document.getElementById(`upload-${tipo}`);
        const importarBtn = document.getElementById(`importar-${tipo}-btn`);

        if (fileInput) fileInput.value = '';
        if (importarBtn) importarBtn.disabled = true;
        
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-file-excel"></i>
                <p>Arraste sua planilha aqui ou clique para selecionar</p>
                <button class="btn btn-secondary" id="selecionar-${tipo}">
                    Selecionar Arquivo
                </button>
            `;
            
            // Reconfigurar eventos
            const selecionarBtn = document.getElementById(`selecionar-${tipo}`);
            if (selecionarBtn) {
                selecionarBtn.addEventListener('click', () => {
                    fileInput.click();
                });
            }
        }
    }

    async importarVendas() {
        const fileInput = document.getElementById('planilha-vendas');
        const loja = document.getElementById('loja-import-vendas')?.value || 'O';

        if (!fileInput.files.length) {
            sistema.mostrarNotificacao('Selecione um arquivo para importar', 'error');
            return;
        }

        try {
            sistema.mostrarNotificacao('Processando arquivo...', 'info');
            
            // Simular processamento (em produção, usar biblioteca como SheetJS)
            await this.simularProcessamento();
            
            // Adicionar ao histórico
            this.adicionarHistorico({
                tipo: 'vendas',
                arquivo: fileInput.files[0].name,
                registros: Math.floor(Math.random() * 50) + 10,
                status: 'sucesso',
                loja: loja
            });

            sistema.mostrarNotificacao('Vendas importadas com sucesso!', 'success');
            this.removerArquivo('vendas');
            
        } catch (error) {
            this.adicionarHistorico({
                tipo: 'vendas',
                arquivo: fileInput.files[0].name,
                registros: 0,
                status: 'erro',
                loja: loja
            });
            
            sistema.mostrarNotificacao('Erro ao importar vendas', 'error');
        }
    }

    async importarEstoque() {
        const fileInput = document.getElementById('planilha-estoque');

        if (!fileInput.files.length) {
            sistema.mostrarNotificacao('Selecione um arquivo para importar', 'error');
            return;
        }

        try {
            sistema.mostrarNotificacao('Processando arquivo...', 'info');
            
            // Simular processamento
            await this.simularProcessamento();
            
            // Adicionar ao histórico
            this.adicionarHistorico({
                tipo: 'estoque',
                arquivo: fileInput.files[0].name,
                registros: Math.floor(Math.random() * 20) + 5,
                status: 'sucesso',
                loja: 'ambas'
            });

            sistema.mostrarNotificacao('Estoque importado com sucesso!', 'success');
            this.removerArquivo('estoque');
            
        } catch (error) {
            this.adicionarHistorico({
                tipo: 'estoque',
                arquivo: fileInput.files[0].name,
                registros: 0,
                status: 'erro',
                loja: 'ambas'
            });
            
            sistema.mostrarNotificacao('Erro ao importar estoque', 'error');
        }
    }

    simularProcessamento() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    adicionarHistorico(importacao) {
        if (!this.dados.historicoImportacoes) {
            this.dados.historicoImportacoes = [];
        }

        this.dados.historicoImportacoes.unshift({
            id: sistema.gerarId(),
            data: new Date().toISOString(),
            ...importacao,
            usuario: sistema.usuarioLogado?.nome
        });

        // Manter apenas os últimos 50 registros
        if (this.dados.historicoImportacoes.length > 50) {
            this.dados.historicoImportacoes = this.dados.historicoImportacoes.slice(0, 50);
        }

        salvarDados(this.dados);
        this.carregarHistorico();
    }

    carregarHistorico() {
        const tbody = document.getElementById('import-history-body');
        if (!tbody) return;

        if (!this.dados.historicoImportacoes || this.dados.historicoImportacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma importação realizada</td></tr>';
            return;
        }

        tbody.innerHTML = this.dados.historicoImportacoes.map(imp => `
            <tr>
                <td>${sistema.formatarData(imp.data)}</td>
                <td>${imp.tipo === 'vendas' ? 'Vendas' : 'Estoque'}</td>
                <td>${imp.arquivo}</td>
                <td>${imp.registros}</td>
                <td><span class="status ${imp.status === 'sucesso' ? 'normal' : 'critico'}">${imp.status === 'sucesso' ? 'SUCESSO' : 'ERRO'}</span></td>
                <td>${imp.usuario || '-'}</td>
            </tr>
        `).join('');
    }
}

// Inicializar importação de dados
const importacaoDados = new ImportacaoDados();