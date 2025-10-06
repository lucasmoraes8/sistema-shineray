// Dashboard e gráficos
class Dashboard {
    constructor() {
        this.dados = carregarDados();
        this.graficos = {};
        this.init();
    }

    init() {
        this.configurarFiltros();
        this.atualizarDashboard();
        this.configurarEventos();
    }

    configurarFiltros() {
        const aplicarFiltro = document.getElementById('aplicar-filtro');
        if (aplicarFiltro) {
            aplicarFiltro.addEventListener('click', () => {
                this.atualizarDashboard();
            });
        }

        // Aplicar filtro ao mudar seleção
        const filtros = ['periodo', 'loja-filtro', 'mes-filtro'];
        filtros.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => {
                    this.atualizarDashboard();
                });
            }
        });
    }

    configurarEventos() {
        // Atualizar dashboard a cada 30 segundos
        setInterval(() => {
            this.dados = carregarDados();
            this.atualizarDashboard();
        }, 30000);
    }

    atualizarDashboard() {
        this.atualizarCards();
        this.atualizarGraficos();
        this.atualizarAlertas();
    }

    atualizarCards() {
        const vendasFiltradas = this.obterVendasFiltradas();
        
        // Total de vendas
        document.getElementById('total-vendas').textContent = vendasFiltradas.length;
        
        // Valor total
        const valorTotal = vendasFiltradas.reduce((total, venda) => total + venda.valor, 0);
        document.getElementById('valor-total').textContent = sistema.formatarMoeda(valorTotal);
        
        // Motos mais e menos vendidas
        const { maisVendida, menosVendida } = this.calcularMotosExtremas(vendasFiltradas);
        document.getElementById('moto-mais-vendida').textContent = maisVendida || '-';
        document.getElementById('moto-menos-vendida').textContent = menosVendida || '-';
    }

    obterVendasFiltradas() {
        const periodo = document.getElementById('periodo')?.value || 'mensal';
        const loja = document.getElementById('loja-filtro')?.value || 'todas';
        const mesFiltro = document.getElementById('mes-filtro')?.value || '2023-10';
        
        let vendasFiltradas = this.dados.vendas;
        
        // Filtrar por loja
        if (loja !== 'todas') {
            vendasFiltradas = vendasFiltradas.filter(venda => venda.loja === loja);
        }
        
        // Filtrar por período
        if (periodo === 'mensal' && mesFiltro) {
            const [ano, mes] = mesFiltro.split('-');
            vendasFiltradas = vendasFiltradas.filter(venda => {
                const dataVenda = new Date(venda.data);
                return dataVenda.getFullYear() === parseInt(ano) && 
                       (dataVenda.getMonth() + 1) === parseInt(mes);
            });
        }
        
        return vendasFiltradas;
    }

    calcularMotosExtremas(vendas) {
        const contagem = {};
        
        vendas.forEach(venda => {
            contagem[venda.moto] = (contagem[venda.moto] || 0) + 1;
        });
        
        let maisVendida = null;
        let menosVendida = null;
        let maxVendas = 0;
        let minVendas = Infinity;
        
        Object.entries(contagem).forEach(([moto, quantidade]) => {
            if (quantidade > maxVendas) {
                maxVendas = quantidade;
                maisVendida = moto;
            }
            if (quantidade < minVendas) {
                minVendas = quantidade;
                menosVendida = moto;
            }
        });
        
        return { maisVendida, menosVendida };
    }

    atualizarGraficos() {
        this.atualizarGraficoVendasModelo();
        this.atualizarGraficoComparativoLojas();
        this.atualizarGraficoVendasMensais();
    }

    atualizarGraficoVendasModelo() {
        const ctx = document.getElementById('vendas-modelo-chart');
        if (!ctx) return;

        const vendasFiltradas = this.obterVendasFiltradas();
        const contagem = {};
        
        vendasFiltradas.forEach(venda => {
            contagem[venda.moto] = (contagem[venda.moto] || 0) + 1;
        });

        const modelos = Object.keys(contagem);
        const quantidades = Object.values(contagem);

        // Ordenar por quantidade
        const indicesOrdenados = quantidades
            .map((quant, idx) => [quant, idx])
            .sort(([a], [b]) => b - a)
            .map(([, idx]) => idx);

        const modelosOrdenados = indicesOrdenados.map(idx => modelos[idx]);
        const quantidadesOrdenadas = indicesOrdenados.map(idx => quantidades[idx]);

        // Destruir gráfico anterior se existir
        if (this.graficos.vendasModelo) {
            this.graficos.vendasModelo.destroy();
        }

        this.graficos.vendasModelo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: modelosOrdenados,
                datasets: [{
                    label: 'Vendas por Modelo',
                    data: quantidadesOrdenadas,
                    backgroundColor: 'rgba(255, 107, 0, 0.7)',
                    borderColor: 'rgba(255, 107, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#F5F5F5'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#F5F5F5',
                            maxRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    atualizarGraficoComparativoLojas() {
        const ctx = document.getElementById('lojas-chart');
        if (!ctx) return;

        const vendasO = this.dados.vendas.filter(v => v.loja === 'O');
        const vendasCD = this.dados.vendas.filter(v => v.loja === 'CD');

        const totalO = vendasO.reduce((total, v) => total + v.valor, 0);
        const totalCD = vendasCD.reduce((total, v) => total + v.valor, 0);

        // Destruir gráfico anterior se existir
        if (this.graficos.lojas) {
            this.graficos.lojas.destroy();
        }

        this.graficos.lojas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Oitizeiro', 'Conde'],
                datasets: [{
                    label: 'Valor em Vendas (R$)',
                    data: [totalO, totalCD],
                    backgroundColor: [
                        'rgba(255, 107, 0, 0.7)',
                        'rgba(255, 165, 0, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 107, 0, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#F5F5F5',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#F5F5F5'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    atualizarGraficoVendasMensais() {
        const ctx = document.getElementById('vendas-mensais-chart');
        if (!ctx) return;

        // Agrupar vendas por mês
        const vendasPorMes = {};
        this.dados.vendas.forEach(venda => {
            const data = new Date(venda.data);
            const mesAno = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = 0;
            }
            vendasPorMes[mesAno] += venda.valor;
        });

        const meses = Object.keys(vendasPorMes).sort();
        const valores = meses.map(mes => vendasPorMes[mes]);

        // Destruir gráfico anterior se existir
        if (this.graficos.vendasMensais) {
            this.graficos.vendasMensais.destroy();
        }

        this.graficos.vendasMensais = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses.map(mes => {
                    const [ano, mesNum] = mes.split('-');
                    return `${mesNum}/${ano}`;
                }),
                datasets: [{
                    label: 'Vendas Mensais (R$)',
                    data: valores,
                    backgroundColor: 'rgba(255, 107, 0, 0.2)',
                    borderColor: 'rgba(255, 107, 0, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#F5F5F5',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#F5F5F5'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    atualizarAlertas() {
        const container = document.getElementById('alertas-container');
        if (!container) return;

        const alertas = this.gerarAlertas();
        
        if (alertas.length === 0) {
            container.innerHTML = '<p>Nenhum alerta no momento. O sistema está funcionando normalmente.</p>';
            return;
        }

        container.innerHTML = alertas.map(alerta => `
            <div class="alerta-item ${alerta.critico ? 'critico' : ''}">
                <span>${alerta.mensagem}</span>
                <small>${sistema.formatarData(alerta.data)}</small>
            </div>
        `).join('');
    }

    gerarAlertas() {
        const alertas = [];
        const hoje = new Date();
        
        // Alertas de estoque baixo
        this.dados.estoque.forEach(item => {
            if (item.quantidade <= this.dados.configuracoes.estoque.alertaCritico) {
                alertas.push({
                    mensagem: `ESTOQUE CRÍTICO: ${item.modelo} (${item.quantidade} unidades)`,
                    data: hoje,
                    critico: true
                });
            } else if (item.quantidade <= this.dados.configuracoes.estoque.alertaBaixo) {
                alertas.push({
                    mensagem: `Estoque baixo: ${item.modelo} (${item.quantidade} unidades)`,
                    data: hoje,
                    critico: false
                });
            }
        });

        return alertas;
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
    sistema.configurarModais();
});