// Controle de Estoque
class ControleEstoque {
    constructor() {
        this.dados = carregarDados();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.carregarEstoque();
        this.atualizarEstatisticas();
        this.atualizarAlertas();
    }

    configurarEventos() {
        // Adicionar estoque
        const adicionarBtn = document.getElementById('adicionar-estoque-btn');
        const estoqueModal = document.getElementById('estoque-modal');
        const closeBtn = estoqueModal?.querySelector('.close');
        const estoqueForm = document.getElementById('estoque-form');

        if (adicionarBtn) {
            adicionarBtn.addEventListener('click', () => {
                estoqueModal.style.display = 'block';
                this.limparFormularioEstoque();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                estoqueModal.style.display = 'none';
            });
        }

        if (estoqueForm) {
            estoqueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarEstoque();
            });
        }

        // Ajustar estoque
        const ajustarBtn = document.getElementById('ajustar-estoque-btn');
        if (ajustarBtn) {
            ajustarBtn.addEventListener('click', () => {
                this.mostrarModalAjuste();
            });
        }

        // Buscar estoque
        const buscarInput = document.getElementById('buscar-estoque');
        if (buscarInput) {
            buscarInput.addEventListener('input', (e) => {
                this.filtrarEstoque(e.target.value);
            });
        }

        // Configurar select de modelos
        configurarSelectModelos('modelo-estoque');
    }

    carregarEstoque() {
        const tbody = document.getElementById('estoque-table-body');
        if (!tbody) return;

        if (this.dados.estoque.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum item em estoque</td></tr>';
            return;
        }

        tbody.innerHTML = this.dados.estoque.map(item => `
            <tr>
                <td>${item.modelo}</td>
                <td>${item.quantidade}</td>
                <td>${item.estoqueMinimo || 2}</td>
                <td>${sistema.formatarData(item.atualizacao)}</td>
                <td><span class="status ${this.obterStatusEstoque(item)}">${this.obterStatusEstoque(item).toUpperCase()}</span></td>
                <td>${item.loja === 'ambas' ? 'Ambas' : (item.loja === 'O' ? 'Oitizeiro' : 'Conde')}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="controleEstoque.editarEstoque('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="controleEstoque.ajustarQuantidade('${item.id}')">
                        <i class="fas fa-calculator"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    obterStatusEstoque(item) {
        const config = this.dados.configuracoes.estoque;
        
        if (item.quantidade <= config.alertaCritico) {
            return 'critico';
        } else if (item.quantidade <= config.alertaBaixo) {
            return 'baixo';
        } else {
            return 'normal';
        }
    }

    salvarEstoque() {
        const modelo = document.getElementById('modelo-estoque').value;
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const estoqueMinimo = parseInt(document.getElementById('estoque-minimo').value) || 2;
        const loja = document.getElementById('loja-estoque').value;

        // Validações
        if (!modelo || !quantidade || !loja) {
            sistema.mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (quantidade < 0) {
            sistema.mostrarNotificacao('A quantidade não pode ser negativa', 'error');
            return;
        }

        // Verificar se o modelo já existe no estoque
        const itemExistenteIndex = this.dados.estoque.findIndex(item => 
            item.modelo === modelo && item.loja === loja
        );

        const dadosEstoque = {
            id: itemExistenteIndex === -1 ? sistema.gerarId() : this.dados.estoque[itemExistenteIndex].id,
            modelo,
            quantidade,
            estoqueMinimo,
            loja,
            atualizacao: new Date().toISOString(),
            usuario: sistema.usuarioLogado?.nome
        };

        if (itemExistenteIndex === -1) {
            this.dados.estoque.push(dadosEstoque);
        } else {
            this.dados.estoque[itemExistenteIndex] = dadosEstoque;
        }

        salvarDados(this.dados);

        // Fechar modal e atualizar interface
        document.getElementById('estoque-modal').style.display = 'none';
        this.carregarEstoque();
        this.atualizarEstatisticas();
        this.atualizarAlertas();
        this.limparFormularioEstoque();

        sistema.mostrarNotificacao('Estoque atualizado com sucesso!', 'success');
    }

    limparFormularioEstoque() {
        const form = document.getElementById('estoque-form');
        if (form) {
            form.reset();
            document.getElementById('estoque-minimo').value = '2';
        }
    }

    editarEstoque(id) {
        const item = this.dados.estoque.find(i => i.id === id);
        if (!item) return;

        // Preencher formulário com dados do estoque
        document.getElementById('modelo-estoque').value = item.modelo;
        document.getElementById('quantidade').value = item.quantidade;
        document.getElementById('estoque-minimo').value = item.estoqueMinimo || 2;
        document.getElementById('loja-estoque').value = item.loja;

        // Mostrar modal
        document.getElementById('estoque-modal').style.display = 'block';
    }

    ajustarQuantidade(id) {
        const item = this.dados.estoque.find(i => i.id === id);
        if (!item) return;

        const novaQuantidade = prompt(`Digite a nova quantidade para ${item.modelo}:`, item.quantidade);
        
        if (novaQuantidade === null) return;

        const quantidade = parseInt(novaQuantidade);
        if (isNaN(quantidade) || quantidade < 0) {
            sistema.mostrarNotificacao('Quantidade inválida', 'error');
            return;
        }

        item.quantidade = quantidade;
        item.atualizacao = new Date().toISOString();
        item.usuario = sistema.usuarioLogado?.nome;

        salvarDados(this.dados);
        this.carregarEstoque();
        this.atualizarEstatisticas();
        this.atualizarAlertas();

        sistema.mostrarNotificacao('Quantidade ajustada com sucesso!', 'success');
    }

    filtrarEstoque(termo) {
        const tbody = document.getElementById('estoque-table-body');
        if (!tbody) return;

        const itensFiltrados = this.dados.estoque.filter(item =>
            item.modelo.toLowerCase().includes(termo.toLowerCase())
        );

        if (itensFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum item encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = itensFiltrados.map(item => `
            <tr>
                <td>${item.modelo}</td>
                <td>${item.quantidade}</td>
                <td>${item.estoqueMinimo || 2}</td>
                <td>${sistema.formatarData(item.atualizacao)}</td>
                <td><span class="status ${this.obterStatusEstoque(item)}">${this.obterStatusEstoque(item).toUpperCase()}</span></td>
                <td>${item.loja === 'ambas' ? 'Ambas' : (item.loja === 'O' ? 'Oitizeiro' : 'Conde')}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="controleEstoque.editarEstoque('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="controleEstoque.ajustarQuantidade('${item.id}')">
                        <i class="fas fa-calculator"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    atualizarEstatisticas() {
        const totalEstoque = this.dados.estoque.reduce((total, item) => total + item.quantidade, 0);
        const estoqueBaixo = this.dados.estoque.filter(item => 
            item.quantidade <= this.dados.configuracoes.estoque.alertaBaixo && 
            item.quantidade > this.dados.configuracoes.estoque.alertaCritico
        ).length;
        const estoqueZero = this.dados.estoque.filter(item => item.quantidade === 0).length;
        const necessidadeReposicao = this.dados.estoque.filter(item => 
            item.quantidade <= (item.estoqueMinimo || 2)
        ).length;

        document.getElementById('total-estoque').textContent = totalEstoque;
        document.getElementById('estoque-baixo').textContent = estoqueBaixo;
        document.getElementById('estoque-zero').textContent = estoqueZero;
        document.getElementById('reposicao').textContent = necessidadeReposicao;
    }

    atualizarAlertas() {
        const container = document.getElementById('alertas-container');
        if (!container) return;

        const alertas = this.gerarAlertasEstoque();
        
        if (alertas.length === 0) {
            container.innerHTML = '<p>Nenhum alerta de estoque no momento.</p>';
            return;
        }

        container.innerHTML = alertas.map(alerta => `
            <div class="alerta-item ${alerta.critico ? 'critico' : ''}">
                <span>${alerta.mensagem}</span>
                <small>${alerta.loja}</small>
            </div>
        `).join('');
    }

    gerarAlertasEstoque() {
        const alertas = [];
        const config = this.dados.configuracoes.estoque;

        this.dados.estoque.forEach(item => {
            if (item.quantidade <= config.alertaCritico) {
                alertas.push({
                    mensagem: `ESTOQUE CRÍTICO: ${item.modelo} (${item.quantidade} unidades)`,
                    loja: item.loja === 'ambas' ? 'Ambas as lojas' : (item.loja === 'O' ? 'Oitizeiro' : 'Conde'),
                    critico: true
                });
            } else if (item.quantidade <= config.alertaBaixo) {
                alertas.push({
                    mensagem: `Estoque baixo: ${item.modelo} (${item.quantidade} unidades)`,
                    loja: item.loja === 'ambas' ? 'Ambas as lojas' : (item.loja === 'O' ? 'Oitizeiro' : 'Conde'),
                    critico: false
                });
            }
        });

        return alertas;
    }

    mostrarModalAjuste() {
        // Implementar modal de ajuste em lote
        sistema.mostrarNotificacao('Funcionalidade em desenvolvimento', 'info');
    }
}

// Inicializar controle de estoque
const controleEstoque = new ControleEstoque();