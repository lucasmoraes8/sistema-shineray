// Funções comuns utilizadas em todas as páginas
class SistemaShineray {
    constructor() {
        this.usuarioLogado = null;
        this.init();
    }

    init() {
        this.verificarAutenticacao();
        this.configurarLogout();
        this.carregarDadosUsuario();
    }

    verificarAutenticacao() {
        const usuario = localStorage.getItem('usuarioLogado');
        
        if (!usuario && !window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (usuario) {
            this.usuarioLogado = JSON.parse(usuario);
        }
    }

    configurarLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja sair do sistema?')) {
                    localStorage.removeItem('usuarioLogado');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    carregarDadosUsuario() {
        if (this.usuarioLogado) {
            // Atualizar informações do usuário na interface
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            const userStore = document.getElementById('user-store');

            if (userAvatar) userAvatar.textContent = this.usuarioLogado.nome.charAt(0);
            if (userName) userName.textContent = this.usuarioLogado.nome;
            if (userStore) {
                const lojaNome = this.usuarioLogado.lojaAtual === 'O' ? 'Oitizeiro' : 'Conde';
                userStore.textContent = this.usuarioLogado.perfil === 'admin' 
                    ? 'Oitizeiro & Conde' 
                    : lojaNome;
            }
        }
    }

    // Formatar data para exibição
    formatarData(data) {
        if (!data) return '-';
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR');
    }

    // Formatar valor monetário
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Gerar ID único
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Mostrar notificação
    mostrarNotificacao(mensagem, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(tipo)}"></i>
                <span>${mensagem}</span>
            </div>
        `;

        // Adicionar estilos da notificação
        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius);
                    color: white;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                    box-shadow: var(--shadow);
                }
                .notification-success { background-color: var(--success); }
                .notification-error { background-color: var(--danger); }
                .notification-warning { background-color: var(--warning); color: var(--dark); }
                .notification-info { background-color: var(--primary); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(tipo) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[tipo] || 'info-circle';
    }

    // Validar e-mail
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Fechar modal ao clicar fora
    configurarModais() {
        const modais = document.querySelectorAll('.modal');
        modais.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modais.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }
}

// Inicializar sistema
const sistema = new SistemaShineray();

// Modelos de motos Shineray
const MODELOS_SHINERAY = [
    "SHINERAY CROSSER 200",
    "SHINERAY RAPTOR 200",
    "SHINERAY DUAL 200",
    "SHINERAY STORM 200",
    "SHINERAY WORK 150",
    "SHINERAY WORKER 150",
    "SHINERAY RACER 150",
    "SHINERAY JET 125",
    "SHINERAY XY 200",
    "SHINERAY XY 250",
    "SHINERAY XY 400",
    "SHINERAY CUSTON 125",
    "SHINERAY ROAD 150",
    "SHINERAY FURIA 150",
    "SHINERAY DUKE 200",
    "SHINERAY RANGER 150"
];

// Dados iniciais do sistema
const DADOS_INICIAIS = {
    vendas: [],
    estoque: [],
    usuarios: [],
    configuracoes: {
        lojas: {
            O: { nome: 'Oitizeiro', endereco: '', telefone: '' },
            CD: { nome: 'Conde', endereco: '', telefone: '' }
        },
        estoque: {
            alertaBaixo: 3,
            alertaCritico: 1,
            alertasEmail: true
        },
        notificacoes: {
            vendas: true,
            estoque: true,
            relatorios: false,
            frequenciaRelatorios: 'semanal'
        },
        seguranca: {
            loginDuplo: false,
            tempoSessao: 60,
            tentativasLogin: 3
        }
    }
};

// Carregar dados do localStorage
function carregarDados() {
    const dados = localStorage.getItem('sistemaShineray');
    if (dados) {
        return JSON.parse(dados);
    } else {
        // Inicializar com dados padrão
        salvarDados(DADOS_INICIAIS);
        return DADOS_INICIAIS;
    }
}

// Salvar dados no localStorage
function salvarDados(dados) {
    localStorage.setItem('sistemaShineray', JSON.stringify(dados));
}

// Obter dados filtrados por loja
function obterDadosPorLoja(dados, loja) {
    if (loja === 'todas') return dados;
    return dados.filter(item => item.loja === loja);
}

// Configurar selects de modelos
function configurarSelectModelos(selectId) {
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Selecione um modelo</option>';
        MODELOS_SHINERAY.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo;
            option.textContent = modelo;
            select.appendChild(option);
        });
    }
}