// Gestão de Vendas
class GestaoVendas {
    constructor() {
        this.dados = carregarDados();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.carregarVendas();
        this.atualizarResumo();
    }

    configurarEventos() {
        // Nova venda
        const novaVendaBtn = document.getElementById('nova-venda-btn');
        const vendaModal = document.getElementById('venda-modal');
        const closeBtn = vendaModal?.querySelector('.close');
        const vendaForm = document.getElementById('venda-form');

        if (novaVendaBtn) {
            novaVendaBtn.addEventListener('click', () => {
                vendaModal.style.display = 'block';
                this.limparFormularioVenda();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                vendaModal.style.display = 'none';
            });
        }

        if (vendaForm) {
            vendaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarVenda();
            });
        }

        // Filtros
        const filtrarBtn = document.getElementById('filtrar-vendas');
        if (filtrarBtn) {
            filtrarBtn.addEventListener('click', () => {
                this.carregarVendas();
                this.atualizarResumo();
            });
        }

        // Exportar
        const exportarBtn = document.getElementById('exportar-vendas');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => {
                this.exportarVendas();
            });
        }

        // Configurar select de modelos
        configurarSelectModelos('moto');
    }

    carregarVendas() {
        const tbody = document.getElementById('vendas-table-body');
        if (!tbody) return;

        const vendasFiltradas = this.obterVendasFiltradas();
        
        if (vendasFiltradas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma venda encontrada</td></tr>';
            return;
        }

        tbody.innerHTML = vendasFiltradas.map(venda => `
            <tr>
                <td>${sistema.formatarData(venda.data)}</td>
                <td>${venda.moto}</td>
                <td>${venda.cliente}</td>
                <td>${sistema.formatarMoeda(venda.valor)}</td>
                <td>${venda.loja === 'O' ? 'Oitizeiro' : 'Conde'}</td>
                <td>${venda.vendedor || '-'}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="gestaoVendas.editarVenda('${venda.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="gestaoVendas.excluirVenda('${venda.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    obterVendasFiltradas() {
        const dataInicio = document.getElementById('data-inicio')?.value;
        const dataFim = document.getElementById('data-fim')?.value;
        const loja = document.getElementById('filtrar-loja')?.value || 'todas';

        let vendasFiltradas = this.dados.vendas;

        // Filtrar por data
        if (dataInicio) {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.data >= dataInicio);
        }
        if (dataFim) {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.data <= dataFim);
        }

        // Filtrar por loja
        if (loja !== 'todas') {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.loja === loja);
        }

        // Ordenar por data (mais recente primeiro)
        return vendasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    salvarVenda() {
        const moto = document.getElementById('moto').value;
        const cliente = document.getElementById('cliente').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const data = document.getElementById('data').value;
        const loja = document.getElementById('loja-venda').value;
        const vendedor = document.getElementById('vendedor')?.value || sistema.usuarioLogado?.nome;

        // Validações
        if (!moto || !cliente || !valor || !data || !loja) {
            sistema.mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (valor <= 0) {
            sistema.mostrarNotificacao('O valor deve ser maior que zero', 'error');
            return;
        }

        const novaVenda = {
            id: sistema.gerarId(),
            data,
            moto,
            cliente,
            valor,
            loja,
            vendedor,
            dataCriacao: new Date().toISOString()
        };

        this.dados.vendas.push(novaVenda);
        salvarDados(this.dados);

        // Fechar modal e atualizar interface
        document.getElementById('venda-modal').style.display = 'none';
        this.carregarVendas();
        this.atualizarResumo();
        this.limparFormularioVenda();

        sistema.mostrarNotificacao('Venda registrada com sucesso!', 'success');
    }

    limparFormularioVenda() {
        const form = document.getElementById('venda-form');
        if (form) {
            form.reset();
            document.getElementById('data').valueAsDate = new Date();
        }
    }

    editarVenda(id) {
        const venda = this.dados.vendas.find(v => v.id === id);
        if (!venda) return;

        // Preencher formulário com dados da venda
        document.getElementById('moto').value = venda.moto;
        document.getElementById('cliente').value = venda.cliente;
        document.getElementById('valor').value = venda.valor;
        document.getElementById('data').value = venda.data;
        document.getElementById('loja-venda').value = venda.loja;
        if (document.getElementById('vendedor')) {
            document.getElementById('vendedor').value = venda.vendedor || '';
        }

        // Mostrar modal
        document.getElementById('venda-modal').style.display = 'block';

        // Alterar comportamento do formulário para edição
        const form = document.getElementById('venda-form');
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.atualizarVenda(id);
            form.onsubmit = originalSubmit;
        };
    }

    atualizarVenda(id) {
        const vendaIndex = this.dados.vendas.findIndex(v => v.id === id);
        if (vendaIndex === -1) return;

        const moto = document.getElementById('moto').value;
        const cliente = document.getElementById('cliente').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const data = document.getElementById('data').value;
        const loja = document.getElementById('loja-venda').value;
        const vendedor = document.getElementById('vendedor')?.value || sistema.usuarioLogado?.nome;

        this.dados.vendas[vendaIndex] = {
            ...this.dados.vendas[vendaIndex],
            moto,
            cliente,
            valor,
            data,
            loja,
            vendedor
        };

        salvarDados(this.dados);
        document.getElementById('venda-modal').style.display = 'none';
        this.carregarVendas();
        this.atualizarResumo();

        sistema.mostrarNotificacao('Venda atualizada com sucesso!', 'success');
    }

    excluirVenda(id) {
        if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

        this.dados.vendas = this.dados.vendas.filter(v => v.id !== id);
        salvarDados(this.dados);
        this.carregarVendas();
        this.atualizarResumo();

        sistema.mostrarNotificacao('Venda excluída com sucesso!', 'success');
    }

    atualizarResumo() {
        const vendasFiltradas = this.obterVendasFiltradas();
        const totalPeriodo = vendasFiltradas.reduce((total, v) => total + v.valor, 0);
        const vendasO = vendasFiltradas.filter(v => v.loja === 'O').reduce((total, v) => total + v.valor, 0);
        const vendasCD = vendasFiltradas.filter(v => v.loja === 'CD').reduce((total, v) => total + v.valor, 0);

        document.getElementById('total-periodo').textContent = sistema.formatarMoeda(totalPeriodo);
        document.getElementById('vendas-o').textContent = sistema.formatarMoeda(vendasO);
        document.getElementById('vendas-cd').textContent = sistema.formatarMoeda(vendasCD);
    }

    exportarVendas() {
        const vendasFiltradas = this.obterVendasFiltradas();
        
        if (vendasFiltradas.length === 0) {
            sistema.mostrarNotificacao('Nenhuma venda para exportar', 'warning');
            return;
        }

        // Criar CSV
        const cabecalho = ['Data', 'Moto', 'Cliente', 'Valor', 'Loja', 'Vendedor'];
        const linhas = vendasFiltradas.map(venda => [
            sistema.formatarData(venda.data),
            venda.moto,
            venda.cliente,
            venda.valor.toString(),
            venda.loja === 'O' ? 'Oitizeiro' : 'Conde',
            venda.vendedor || '-'
        ]);

        const csv = [cabecalho, ...linhas].map(row => row.join(';')).join('\n');
        
        // Criar e baixar arquivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `vendas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        sistema.mostrarNotificacao('Vendas exportadas com sucesso!', 'success');
    }
}

// Inicializar gestão de vendas
const gestaoVendas = new GestaoVendas();