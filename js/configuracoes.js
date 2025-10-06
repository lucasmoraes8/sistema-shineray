// Configurações do Sistema
class ConfiguracoesSistema {
    constructor() {
        this.dados = carregarDados();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.carregarConfiguracoes();
    }

    configurarEventos() {
        // Salvar configurações
        const salvarBtn = document.getElementById('salvar-configuracoes');
        if (salvarBtn) {
            salvarBtn.addEventListener('click', () => {
                this.salvarConfiguracoes();
            });
        }

        // Restaurar padrões
        const restaurarBtn = document.getElementById('restaurar-padrao');
        if (restaurarBtn) {
            restaurarBtn.addEventListener('click', () => {
                this.restaurarPadroes();
            });
        }

        // Backup
        const backupBtn = document.getElementById('backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.fazerBackup();
            });
        }
    }

    carregarConfiguracoes() {
        const config = this.dados.configuracoes;

        // Lojas
        document.getElementById('nome-loja-o').value = config.lojas.O.nome;
        document.getElementById('endereco-o').value = config.lojas.O.endereco || '';
        document.getElementById('telefone-o').value = config.lojas.O.telefone || '';

        document.getElementById('nome-loja-cd').value = config.lojas.CD.nome;
        document.getElementById('endereco-cd').value = config.lojas.CD.endereco || '';
        document.getElementById('telefone-cd').value = config.lojas.CD.telefone || '';

        // Estoque
        document.getElementById('estoque-baixo').value = config.estoque.alertaBaixo;
        document.getElementById('estoque-critico').value = config.estoque.alertaCritico;
        document.getElementById('alertas-email').checked = config.estoque.alertasEmail;

        // Notificações
        document.getElementById('notif-vendas').checked = config.notificacoes.vendas;
        document.getElementById('notif-estoque').checked = config.notificacoes.estoque;
        document.getElementById('notif-relatorios').checked = config.notificacoes.relatorios;
        document.getElementById('frequencia-relatorios').value = config.notificacoes.frequenciaRelatorios;

        // Segurança
        document.getElementById('login-duplo').checked = config.seguranca.loginDuplo;
        document.getElementById('tempo-sessao').value = config.seguranca.tempoSessao;
        document.getElementById('tentativas-login').value = config.seguranca.tentativasLogin;

        // Backup
        this.atualizarInfoBackup();
    }

    salvarConfiguracoes() {
        try {
            const config = this.dados.configuracoes;

            // Lojas
            config.lojas.O.nome = document.getElementById('nome-loja-o').value;
            config.lojas.O.endereco = document.getElementById('endereco-o').value;
            config.lojas.O.telefone = document.getElementById('telefone-o').value;

            config.lojas.CD.nome = document.getElementById('nome-loja-cd').value;
            config.lojas.CD.endereco = document.getElementById('endereco-cd').value;
            config.lojas.CD.telefone = document.getElementById('telefone-cd').value;

            // Estoque
            config.estoque.alertaBaixo = parseInt(document.getElementById('estoque-baixo').value);
            config.estoque.alertaCritico = parseInt(document.getElementById('estoque-critico').value);
            config.estoque.alertasEmail = document.getElementById('alertas-email').checked;

            // Notificações
            config.notificacoes.vendas = document.getElementById('notif-vendas').checked;
            config.notificacoes.estoque = document.getElementById('notif-estoque').checked;
            config.notificacoes.relatorios = document.getElementById('notif-relatorios').checked;
            config.notificacoes.frequenciaRelatorios = document.getElementById('frequencia-relatorios').value;

            // Segurança
            config.seguranca.loginDuplo = document.getElementById('login-duplo').checked;
            config.seguranca.tempoSessao = parseInt(document.getElementById('tempo-sessao').value);
            config.seguranca.tentativasLogin = parseInt(document.getElementById('tentativas-login').value);

            // Atualizar data da última modificação
            config.ultimaModificacao = new Date().toISOString();
            config.modificadoPor = sistema.usuarioLogado?.nome;

            salvarDados(this.dados);

            sistema.mostrarNotificacao('Configurações salvas com sucesso!', 'success');

        } catch (error) {
            sistema.mostrarNotificacao('Erro ao salvar configurações', 'error');
            console.error('Erro ao salvar configurações:', error);
        }
    }

    restaurarPadroes() {
        if (!confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
            return;
        }

        this.dados.configuracoes = JSON.parse(JSON.stringify(DADOS_INICIAIS.configuracoes));
        salvarDados(this.dados);
        this.carregarConfiguracoes();

        sistema.mostrarNotificacao('Configurações restauradas para os valores padrão!', 'success');
    }

    fazerBackup() {
        try {
            const dadosBackup = {
                ...this.dados,
                backupData: new Date().toISOString(),
                backupPor: sistema.usuarioLogado?.nome
            };

            const blob = new Blob([JSON.stringify(dadosBackup, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.setAttribute('href', url);
            link.setAttribute('download', `backup_shineray_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Atualizar informações de backup
            this.dados.configuracoes.ultimoBackup = new Date().toISOString();
            salvarDados(this.dados);
            this.atualizarInfoBackup();

            sistema.mostrarNotificacao('Backup realizado com sucesso!', 'success');

        } catch (error) {
            sistema.mostrarNotificacao('Erro ao realizar backup', 'error');
            console.error('Erro no backup:', error);
        }
    }

    atualizarInfoBackup() {
        const ultimoBackupEl = document.getElementById('ultimo-backup');
        const proximoBackupEl = document.getElementById('proximo-backup');

        if (ultimoBackupEl) {
            const ultimoBackup = this.dados.configuracoes.ultimoBackup;
            ultimoBackupEl.textContent = ultimoBackup ? sistema.formatarData(ultimoBackup) : 'Nunca';
        }

        if (proximoBackupEl) {
            const hoje = new Date();
            const proximoBackup = new Date(hoje);
            proximoBackup.setDate(proximoBackup.getDate() + 1); // Próximo backup em 1 dia
            proximoBackupEl.textContent = sistema.formatarData(proximoBackup.toISOString());
        }
    }

    restaurarBackup(arquivo) {
        // Implementar restauração de backup
        sistema.mostrarNotificacao('Funcionalidade de restauração em desenvolvimento', 'info');
    }
}

// Inicializar configurações do sistema
const configuracoesSistema = new ConfiguracoesSistema();