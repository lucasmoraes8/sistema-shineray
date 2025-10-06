// Dashboard Comparativo
class DashboardComparativo {
    constructor() {
        this.dados = carregarDados();
        this.graficos = {};
        this.visualizacaoModelos = 'comparativo'; // 'comparativo' ou 'individual'
        this.init();
    }

    init() {
        this.configurarFiltros();
        this.configurarEventos();
        this.atualizarDashboard();
    }

    configurarFiltros() {
        const periodoSelect = document.getElementById('periodo');
        const aplicarFiltro = document.getElementById('aplicar-filtro');
        const atualizarDados = document.getElementById('atualizar-dados');

        // Mostrar/ocultar datas personalizadas
        periodoSelect.addEventListener('change', (e) => {
            const dataInicio = document.getElementById('data-inicio');
            const dataFim = document.getElementById('data-fim');
            
            if (e.target.value === 'personalizado') {
                dataInicio.style.display = 'inline-block';
                dataFim.style.display = 'inline-block';
            } else {
                dataInicio.style.display = 'none';
                dataFim.style.display = 'none';
            }
        });

        if (aplicarFiltro) {
            aplicarFiltro.addEventListener('click', () => {
                this.atualizarDashboard();
            });
        }

        if (atualizarDados) {
            atualizarDados.addEventListener('click', () => {
                this.dados = carregarDados();
                this.atualizarDashboard();
                sistema.mostrarNotificacao('Dados atualizados!', 'success');
            });
        }

        // Configurar datas padrão
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        document.getElementById('data-inicio').valueAsDate = primeiroDiaMes;
        document.getElementById('data-fim').valueAsDate = hoje;
    }

    configurarEventos() {
        // Alternar visualização de modelos
        const toggleModelos = document.getElementById('toggle-modelos');
        if (toggleModelos) {
            toggleModelos.addEventListener('click', () => {
                this.visualizacaoModelos = this.visualizacaoModelos === 'comparativo' ? 'individual' : 'comparativo';
                this.atualizarGraficoModelos();
                
                const icon = toggleModelos.querySelector('i');
                if (this.visualizacaoModelos === 'comparativo') {
                    icon.className = 'fas fa-exchange-alt';
                    toggleModelos.innerHTML = '<i class="fas fa-exchange-alt"></i> Visualização Comparativa';
                } else {
                    icon.className = 'fas fa-chart-bar';
                    toggleModelos.innerHTML = '<i class="fas fa-chart-bar"></i> Visualização Individual';
                }
            });
        }

        // Atualizar a cada 30 segundos
        setInterval(() => {
            this.dados = carregarDados();
            this.atualizarDashboard();
        }, 30000);
    }

    atualizarDashboard() {
        this.atualizarCardsComparativos();
        this.atualizarGraficosComparativos();
        this.atualizarTabelaComparativa();
        this.atualizarInsights();
    }

    atualizarCardsComparativos() {
        const vendasFiltradas = this.obterVendasFiltradas();
        const vendasO = vendasFiltradas.filter(v => v.loja === 'O');
        const vendasCD = vendasFiltradas.filter(v => v.loja === 'CD');

        // Total de Vendas
        document.getElementById('vendas-o-quantidade').textContent = vendasO.length;
        document.getElementById('vendas-cd-quantidade').textContent = vendasCD.length;
        
        const totalVendas = vendasO.length + vendasCD.length;
        if (totalVendas > 0) {
            const percentO = (vendasO.length / totalVendas) * 100;
            const percentCD = (vendasCD.length / totalVendas) * 100;
            
            document.getElementById('bar-vendas-o').style.width = `${percentO}%`;
            document.getElementById('bar-vendas-cd').style.width = `${percentCD}%`;
        }

        // Valor Total
        const valorO = vendasO.reduce((total, v) => total + v.valor, 0);
        const valorCD = vendasCD.reduce((total, v) => total + v.valor, 0);
        
        document.getElementById('valor-o').textContent = sistema.formatarMoeda(valorO);
        document.getElementById('valor-cd').textContent = sistema.formatarMoeda(valorCD);
        
        const totalValor = valorO + valorCD;
        if (totalValor > 0) {
            const percentValorO = (valorO / totalValor) * 100;
            const percentValorCD = (valorCD / totalValor) * 100;
            
            document.getElementById('bar-valor-o').style.width = `${percentValorO}%`;
            document.getElementById('bar-valor-cd').style.width = `${percentValorCD}%`;
        }

        // Ticket Médio
        const ticketO = vendasO.length > 0 ? valorO / vendasO.length : 0;
        const ticketCD = vendasCD.length > 0 ? valorCD / vendasCD.length : 0;
        
        document.getElementById('ticket-o').textContent = sistema.formatarMoeda(ticketO);
        document.getElementById('ticket-cd').textContent = sistema.formatarMoeda(ticketCD);

        // Calcular diferença do ticket médio
        const diferencaTicket = document.getElementById('diferenca-ticket');
        if (ticketO > 0 && ticketCD > 0) {
            const diff = ((ticketO - ticketCD) / ticketCD) * 100;
            diferencaTicket.className = `diferenca ${diff >= 0 ? 'positivo' : 'negativo'}`;
            diferencaTicket.innerHTML = `<span class="diferenca-text">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%</span>`;
        }

        // Modelo Mais Vendido
        document.getElementById('modelo-o').textContent = this.obterModeloMaisVendido(vendasO) || '-';
        document.getElementById('modelo-cd').textContent = this.obterModeloMaisVendido(vendasCD) || '-';
    }

    obterVendasFiltradas() {
        const periodo = document.getElementById('periodo').value;
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFim = document.getElementById('data-fim').value;

        let vendasFiltradas = this.dados.vendas;

        // Aplicar filtro de período
        if (periodo !== 'personalizado') {
            const hoje = new Date();
            let dataInicioFiltro = new Date();

            switch (periodo) {
                case 'hoje':
                    dataInicioFiltro.setHours(0, 0, 0, 0);
                    break;
                case 'semana':
                    dataInicioFiltro.setDate(hoje.getDate() - 7);
                    break;
                case 'mes':
                    dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    break;
                case 'trimestre':
                    dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
                    break;
                case 'ano':
                    dataInicioFiltro = new Date(hoje.getFullYear(), 0, 1);
                    break;
            }

            vendasFiltradas = vendasFiltradas.filter(venda => 
                new Date(venda.data) >= dataInicioFiltro
            );
        } else {
            // Filtro personalizado
            if (dataInicio) {
                vendasFiltradas = vendasFiltradas.filter(venda => venda.data >= dataInicio);
            }
            if (dataFim) {
                vendasFiltradas = vendasFiltradas.filter(venda => venda.data <= dataFim);
            }
        }

        return vendasFiltradas;
    }

    obterModeloMaisVendido(vendas) {
        if (vendas.length === 0) return null;

        const contagem = {};
        vendas.forEach(venda => {
            contagem[venda.moto] = (contagem[venda.moto] || 0) + 1;
        });

        return Object.keys(contagem).reduce((a, b) => 
            contagem[a] > contagem[b] ? a : b
        );
    }

    atualizarGraficosComparativos() {
        this.atualizarGraficoModelos();
        this.atualizarGraficoEvolucaoMensal();
        this.atualizarGraficoDiasSemana();
        this.atualizarGraficoMarketShare();
    }

    atualizarGraficoModelos() {
        const ctx = document.getElementById('vendas-modelo-comparativo-chart');
        if (!ctx) return;

        const vendasFiltradas = this.obterVendasFiltradas();
        const vendasO = vendasFiltradas.filter(v => v.loja === 'O');
        const vendasCD = vendasFiltradas.filter(v => v.loja === 'CD');

        // Contar vendas por modelo para cada loja
        const modelos = [...new Set(vendasFiltradas.map(v => v.moto))];
        const dadosO = modelos.map(modelo => 
            vendasO.filter(v => v.moto === modelo).length
        );
        const dadosCD = modelos.map(modelo => 
            vendasCD.filter(v => v.moto === modelo).length
        );

        // Destruir gráfico anterior se existir
        if (this.graficos.modelosComparativo) {
            this.graficos.modelosComparativo.destroy();
        }

        if (this.visualizacaoModelos === 'comparativo') {
            // Gráfico de barras comparativo
            this.graficos.modelosComparativo = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: modelos,
                    datasets: [
                        {
                            label: 'Oitizeiro',
                            data: dadosO,
                            backgroundColor: 'rgba(255, 107, 0, 0.7)',
                            borderColor: 'rgba(255, 107, 0, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Conde',
                            data: dadosCD,
                            backgroundColor: 'rgba(255, 165, 0, 0.7)',
                            borderColor: 'rgba(255, 165, 0, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Vendas por Modelo - Comparativo entre Lojas'
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
        } else {
            // Gráfico de barras individuais (empilhadas)
            this.graficos.modelosComparativo = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: modelos,
                    datasets: [
                        {
                            label: 'Oitizeiro',
                            data: dadosO,
                            backgroundColor: 'rgba(255, 107, 0, 0.7)',
                            borderColor: 'rgba(255, 107, 0, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Conde',
                            data: dadosCD,
                            backgroundColor: 'rgba(255, 165, 0, 0.7)',
                            borderColor: 'rgba(255, 165, 0, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Vendas por Modelo - Visão Individual'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            ticks: {
                                color: '#F5F5F5'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            stacked: false,
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
    }

    atualizarGraficoEvolucaoMensal() {
        const ctx = document.getElementById('evolucao-mensal-chart');
        if (!ctx) return;

        // Agrupar vendas por mês e por loja
        const vendasPorMes = {};
        
        this.dados.vendas.forEach(venda => {
            const data = new Date(venda.data);
            const mesAno = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = { O: 0, CD: 0 };
            }
            vendasPorMes[mesAno][venda.loja] += venda.valor;
        });

        const meses = Object.keys(vendasPorMes).sort();
        const valoresO = meses.map(mes => vendasPorMes[mes].O);
        const valoresCD = meses.map(mes => vendasPorMes[mes].CD);

        // Destruir gráfico anterior se existir
        if (this.graficos.evolucaoMensal) {
            this.graficos.evolucaoMensal.destroy();
        }

        this.graficos.evolucaoMensal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses.map(mes => {
                    const [ano, mesNum] = mes.split('-');
                    return `${mesNum}/${ano}`;
                }),
                datasets: [
                    {
                        label: 'Oitizeiro',
                        data: valoresO,
                        borderColor: 'rgba(255, 107, 0, 1)',
                        backgroundColor: 'rgba(255, 107, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Conde',
                        data: valoresCD,
                        borderColor: 'rgba(255, 165, 0, 1)',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução de Vendas Mensais'
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

    atualizarGraficoDiasSemana() {
        const ctx = document.getElementById('dias-semana-chart');
        if (!ctx) return;

        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const vendasPorDia = { O: [0,0,0,0,0,0,0], CD: [0,0,0,0,0,0,0] };

        this.dados.vendas.forEach(venda => {
            const data = new Date(venda.data);
            const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
            vendasPorDia[venda.loja][diaSemana] += venda.valor;
        });

        // Destruir gráfico anterior se existir
        if (this.graficos.diasSemana) {
            this.graficos.diasSemana.destroy();
        }

        this.graficos.diasSemana = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diasSemana,
                datasets: [
                    {
                        label: 'Oitizeiro',
                        data: vendasPorDia.O,
                        backgroundColor: 'rgba(255, 107, 0, 0.7)',
                        borderColor: 'rgba(255, 107, 0, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Conde',
                        data: vendasPorDia.CD,
                        backgroundColor: 'rgba(255, 165, 0, 0.7)',
                        borderColor: 'rgba(255, 165, 0, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Desempenho por Dia da Semana'
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

    atualizarGraficoMarketShare() {
        const ctx = document.getElementById('market-share-chart');
        if (!ctx) return;

        const vendasFiltradas = this.obterVendasFiltradas();
        const totalO = vendasFiltradas.filter(v => v.loja === 'O').length;
        const totalCD = vendasFiltradas.filter(v => v.loja === 'CD').length;
        const totalGeral = totalO + totalCD;

        // Destruir gráfico anterior se existir
        if (this.graficos.marketShare) {
            this.graficos.marketShare.destroy();
        }

        this.graficos.marketShare = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Oitizeiro', 'Conde'],
                datasets: [{
                    data: [totalO, totalCD],
                    backgroundColor: [
                        'rgba(255, 107, 0, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 107, 0, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#F5F5F5',
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} vendas (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    atualizarTabelaComparativa() {
        const tbody = document.getElementById('tabela-comparativo-body');
        if (!tbody) return;

        const vendasFiltradas = this.obterVendasFiltradas();
        const modelos = [...new Set(vendasFiltradas.map(v => v.moto))];

        if (modelos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum dado para exibir</td></tr>';
            return;
        }

        tbody.innerHTML = modelos.map(modelo => {
            const vendasModeloO = vendasFiltradas.filter(v => v.moto === modelo && v.loja === 'O');
            const vendasModeloCD = vendasFiltradas.filter(v => v.moto === modelo && v.loja === 'CD');
            
            const totalO = vendasModeloO.length;
            const totalCD = vendasModeloCD.length;
            const totalGeral = totalO + totalCD;
            
            const diferenca = totalO - totalCD;
            const percentualDiferenca = totalCD > 0 ? (diferenca / totalCD) * 100 : (totalO > 0 ? 100 : 0);

            // Determinar performance
            let performance = 'performance-media';
            let performanceText = 'Média';
            
            if (percentualDiferenca > 20) {
                performance = 'performance-excelente';
                performanceText = 'Excelente';
            } else if (percentualDiferenca > 0) {
                performance = 'performance-boa';
                performanceText = 'Boa';
            } else if (percentualDiferenca < -20) {
                performance = 'performance-baixa';
                performanceText = 'Baixa';
            }

            return `
                <tr>
                    <td><strong>${modelo}</strong></td>
                    <td>${totalO}</td>
                    <td>${totalCD}</td>
                    <td>${totalGeral}</td>
                    <td>
                        <span style="color: ${diferenca >= 0 ? 'var(--success)' : 'var(--danger)'}">
                            ${diferenca >= 0 ? '+' : ''}${diferenca} 
                            (${percentualDiferenca >= 0 ? '+' : ''}${percentualDiferenca.toFixed(1)}%)
                        </span>
                    </td>
                    <td>
                        <span class="performance-badge ${performance}">${performanceText}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    atualizarInsights() {
        const vendasFiltradas = this.obterVendasFiltradas();
        const vendasO = vendasFiltradas.filter(v => v.loja === 'O');
        const vendasCD = vendasFiltradas.filter(v => v.loja === 'CD');

        // Oportunidades
        const oportunidades = this.gerarOportunidades(vendasO, vendasCD);
        document.getElementById('insights-oportunidades').innerHTML = oportunidades;

        // Alertas
        const alertas = this.gerarAlertas(vendasO, vendasCD);
        document.getElementById('insights-alertas').innerHTML = alertas;

        // Sugestões
        const sugestoes = this.gerarSugestoes(vendasO, vendasCD);
        document.getElementById('insights-sugestoes').innerHTML = sugestoes;
    }

    gerarOportunidades(vendasO, vendasCD) {
        const oportunidades = [];
        
        // Modelos que vendem bem em uma loja mas não na outra
        const modelosO = [...new Set(vendasO.map(v => v.moto))];
        const modelosCD = [...new Set(vendasCD.map(v => v.moto))];
        
        const modelosExclusivosO = modelosO.filter(m => !modelosCD.includes(m));
        const modelosExclusivosCD = modelosCD.filter(m => !modelosO.includes(m));

        if (modelosExclusivosO.length > 0) {
            oportunidades.push(`Modelos exclusivos da Oitizeiro: ${modelosExclusivosO.slice(0, 2).join(', ')}`);
        }
        
        if (modelosExclusivosCD.length > 0) {
            oportunidades.push(`Modelos exclusivos do Conde: ${modelosExclusivosCD.slice(0, 2).join(', ')}`);
        }

        // Dias da semana com melhor desempenho
        const diasO = this.analisarDiasSemana(vendasO);
        const diasCD = this.analisarDiasSemana(vendasCD);
        
        if (diasO.melhorDia && diasCD.melhorDia) {
            oportunidades.push(`Melhor dia: Oitizeiro (${diasO.melhorDia}), Conde (${diasCD.melhorDia})`);
        }

        return oportunidades.map(op => `<li>${op}</li>`).join('') || '<li>Analisando oportunidades...</li>';
    }

    gerarAlertas(vendasO, vendasCD) {
        const alertas = [];
        
        const totalO = vendasO.length;
        const totalCD = vendasCD.length;
        const diferenca = Math.abs(totalO - totalCD);
        const maior = totalO > totalCD ? 'Oitizeiro' : 'Conde';

        if (diferenca > 10) {
            alertas.push(`Grande diferença de vendas: ${maior} está ${diferenca} vendas à frente`);
        }

        // Verificar modelos com baixa performance
        const modelosBaixaPerf = this.identificarModelosBaixaPerformance(vendasO, vendasCD);
        if (modelosBaixaPerf.length > 0) {
            alertas.push(`Modelos com baixa performance: ${modelosBaixaPerf.slice(0, 2).join(', ')}`);
        }

        return alertas.map(alerta => `<li>${alerta}</li>`).join('') || '<li>Nenhum alerta no momento</li>';
    }

    gerarSugestoes(vendasO, vendasCD) {
        const sugestoes = [];
        
        // Sugerir balanceamento de estoque baseado nas vendas
        const modelosDesequilibrio = this.identificarDesequilibrios(vendasO, vendasCD);
        if (modelosDesequilibrio.length > 0) {
            sugestoes.push(`Balancear estoque para: ${modelosDesequilibrio.slice(0, 2).join(', ')}`);
        }

        // Sugerir promoções para modelos com baixa performance
        const modelosPromocao = this.identificarModelosPromocao(vendasO, vendasCD);
        if (modelosPromocao.length > 0) {
            sugestoes.push(`Considerar promoções para: ${modelosPromocao.slice(0, 2).join(', ')}`);
        }

        return sugestoes.map(sug => `<li>${sug}</li>`).join('') || '<li>Analisando sugestões...</li>';
    }

    analisarDiasSemana(vendas) {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const vendasPorDia = [0,0,0,0,0,0,0];

        vendas.forEach(venda => {
            const data = new Date(venda.data);
            const dia = data.getDay();
            vendasPorDia[dia]++;
        });

        const maxVendas = Math.max(...vendasPorDia);
        const melhorDiaIndex = vendasPorDia.indexOf(maxVendas);

        return {
            melhorDia: dias[melhorDiaIndex],
            vendasPorDia: vendasPorDia
        };
    }

    identificarModelosBaixaPerformance(vendasO, vendasCD) {
        // Identificar modelos com vendas abaixo da média
        const todosModelos = [...new Set([...vendasO, ...vendasCD].map(v => v.moto))];
        const modelosBaixaPerf = [];

        todosModelos.forEach(modelo => {
            const vendasModeloO = vendasO.filter(v => v.moto === modelo).length;
            const vendasModeloCD = vendasCD.filter(v => v.moto === modelo).length;
            const totalModelo = vendasModeloO + vendasModeloCD;

            if (totalModelo < 2) { // Threshold baixo para demonstração
                modelosBaixaPerf.push(modelo);
            }
        });

        return modelosBaixaPerf;
    }

    identificarDesequilibrios(vendasO, vendasCD) {
        // Identificar modelos com grande diferença entre lojas
        const todosModelos = [...new Set([...vendasO, ...vendasCD].map(v => v.moto))];
        const desequilibrios = [];

        todosModelos.forEach(modelo => {
            const vendasModeloO = vendasO.filter(v => v.moto === modelo).length;
            const vendasModeloCD = vendasCD.filter(v => v.moto === modelo).length;
            const diferenca = Math.abs(vendasModeloO - vendasModeloCD);

            if (diferenca >= 3) { // Threshold para desequilíbrio
                desequilibrios.push(modelo);
            }
        });

        return desequilibrios;
    }

    identificarModelosPromocao(vendasO, vendasCD) {
        // Identificar modelos que podem se beneficiar de promoções
        return this.identificarModelosBaixaPerformance(vendasO, vendasCD);
    }
}

// Inicializar dashboard comparativo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardComparativo();
    sistema.configurarModais();
});