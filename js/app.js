// Sistema de Navegação
class NavegacaoSistema {
    constructor() {
        this.init();
    }

    init() {
        this.configurarNavegacao();
        this.verificarPaginaAtiva();
    }

    configurarNavegacao() {
        // Configurar links de navegação
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.closest('.nav-link');
                const href = link.getAttribute('href');
                
                if (href && href !== '#' && !href.includes('javascript')) {
                    // Adicionar loading state
                    this.mostrarLoading();
                    
                    // Navegar para a página
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100);
                }
            }
        });

        // Configurar logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.fazerLogout();
            });
        }
    }

    verificarPaginaAtiva() {
        // Marcar link ativo baseado na página atual
        const paginaAtual = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === paginaAtual) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Atualizar título da página
        this.atualizarTituloPagina(paginaAtual);
    }

    atualizarTituloPagina(pagina) {
        const titulos = {
            'dashboard.html': 'Dashboard Comparativo',
            'vendas.html': 'Gestão de Vendas',
            'estoque.html': 'Controle de Estoque',
            'importar.html': 'Importar Dados',
            'usuarios.html': 'Gestão de Usuários',
            'configuracoes.html': 'Configurações do Sistema'
        };

        const tituloElement = document.getElementById('page-title') || document.querySelector('.header-title');
        if (tituloElement && titulos[pagina]) {
            tituloElement.textContent = titulos[pagina];
        }
    }

    mostrarLoading() {
        // Criar overlay de loading
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando...</p>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('.loading-styles')) {
            const styles = document.createElement('style');
            styles.className = 'loading-styles';
            styles.textContent = `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .loading-spinner {
                    text-align: center;
                    color: var(--primary);
                }
                .loading-spinner i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .loading-spinner p {
                    color: var(--light);
                    font-size: 1.1rem;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(loadingOverlay);

        // Remover após navegação (fallback)
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
        }, 3000);
    }

    fazerLogout() {
        if (confirm('Tem certeza que deseja sair do sistema?')) {
            localStorage.removeItem('usuarioLogado');
            this.mostrarLoading();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
}

// Adicione esta linha no final do app.js, após a classe SistemaShineray:
const navegacao = new NavegacaoSistema();