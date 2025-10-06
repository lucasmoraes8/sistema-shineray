// Gestão de Usuários
class GestaoUsuarios {
    constructor() {
        this.dados = carregarDados();
        this.init();
    }

    init() {
        this.configurarEventos();
        this.carregarUsuarios();
        this.atualizarEstatisticas();
    }

    configurarEventos() {
        // Novo usuário
        const novoUsuarioBtn = document.getElementById('novo-usuario-btn');
        const usuarioModal = document.getElementById('usuario-modal');
        const closeBtn = usuarioModal?.querySelector('.close');
        const usuarioForm = document.getElementById('usuario-form');

        if (novoUsuarioBtn) {
            novoUsuarioBtn.addEventListener('click', () => {
                document.getElementById('modal-usuario-titulo').textContent = 'Novo Usuário';
                usuarioModal.style.display = 'block';
                this.limparFormularioUsuario();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                usuarioModal.style.display = 'none';
            });
        }

        if (usuarioForm) {
            usuarioForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarUsuario();
            });
        }

        // Filtros
        const filtros = ['filtrar-perfil', 'filtrar-loja-usuarios', 'filtrar-status'];
        filtros.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => {
                    this.carregarUsuarios();
                });
            }
        });

        // Validação de senha
        const senhaInput = document.getElementById('senha-usuario');
        const confirmarSenhaInput = document.getElementById('confirmar-senha');
        
        if (senhaInput && confirmarSenhaInput) {
            confirmarSenhaInput.addEventListener('input', () => {
                this.validarSenhas();
            });
        }
    }

    carregarUsuarios() {
        const tbody = document.getElementById('usuarios-table-body');
        if (!tbody) return;

        const usuariosFiltrados = this.obterUsuariosFiltrados();
        
        if (usuariosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = usuariosFiltrados.map(usuario => `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.perfil === 'admin' ? 'Administrador' : 'Vendedor'}</td>
                <td>${this.formatarLojas(usuario.lojas)}</td>
                <td>${usuario.ultimoAcesso ? sistema.formatarData(usuario.ultimoAcesso) : 'Nunca'}</td>
                <td><span class="status ${usuario.status === 'ativo' ? 'ativo' : 'inativo'}">${usuario.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="gestaoUsuarios.editarUsuario('${usuario.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="gestaoUsuarios.alterarStatus('${usuario.id}')">
                        <i class="fas ${usuario.status === 'ativo' ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    obterUsuariosFiltrados() {
        const perfil = document.getElementById('filtrar-perfil')?.value || 'todos';
        const loja = document.getElementById('filtrar-loja-usuarios')?.value || 'todas';
        const status = document.getElementById('filtrar-status')?.value || 'todos';

        let usuariosFiltrados = this.dados.usuarios || [];

        // Filtrar por perfil
        if (perfil !== 'todos') {
            usuariosFiltrados = usuariosFiltrados.filter(user => user.perfil === perfil);
        }

        // Filtrar por loja
        if (loja !== 'todas') {
            usuariosFiltrados = usuariosFiltrados.filter(user => 
                user.lojas.includes(loja) || user.perfil === 'admin'
            );
        }

        // Filtrar por status
        if (status !== 'todos') {
            usuariosFiltrados = usuariosFiltrados.filter(user => user.status === status);
        }

        return usuariosFiltrados;
    }

    formatarLojas(lojas) {
        if (lojas.includes('ambas') || (lojas.includes('O') && lojas.includes('CD'))) {
            return 'Ambas';
        } else if (lojas.includes('O')) {
            return 'Oitizeiro';
        } else if (lojas.includes('CD')) {
            return 'Conde';
        }
        return '-';
    }

    salvarUsuario() {
        const nome = document.getElementById('nome-usuario').value;
        const email = document.getElementById('email-usuario').value;
        const perfil = document.getElementById('perfil-usuario').value;
        const loja = document.getElementById('loja-usuario').value;
        const senha = document.getElementById('senha-usuario').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const ativo = document.getElementById('usuario-ativo').checked;

        // Validações
        if (!nome || !email || !perfil || !loja || !senha) {
            sistema.mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (!sistema.validarEmail(email)) {
            sistema.mostrarNotificacao('E-mail inválido', 'error');
            return;
        }

        if (senha !== confirmarSenha) {
            sistema.mostrarNotificacao('As senhas não coincidem', 'error');
            return;
        }

        if (senha.length < 6) {
            sistema.mostrarNotificacao('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        // Determinar lojas com base na seleção
        let lojas = [];
        if (loja === 'ambas') {
            lojas = ['O', 'CD'];
        } else {
            lojas = [loja];
        }

        const usuarioData = {
            id: sistema.gerarId(),
            nome,
            email,
            perfil,
            lojas,
            senha: this.criptografarSenha(senha), // Em produção, usar bcrypt
            status: ativo ? 'ativo' : 'inativo',
            dataCriacao: new Date().toISOString(),
            criadoPor: sistema.usuarioLogado?.nome
        };

        // Verificar se é edição ou novo usuário
        const usuarioExistenteIndex = this.dados.usuarios.findIndex(user => user.email === email);
        
        if (usuarioExistenteIndex === -1) {
            this.dados.usuarios.push(usuarioData);
        } else {
            // Manter a senha original se não foi alterada
            if (!senha) {
                usuarioData.senha = this.dados.usuarios[usuarioExistenteIndex].senha;
            }
            this.dados.usuarios[usuarioExistenteIndex] = usuarioData;
        }

        salvarDados(this.dados);

        // Fechar modal e atualizar interface
        document.getElementById('usuario-modal').style.display = 'none';
        this.carregarUsuarios();
        this.atualizarEstatisticas();
        this.limparFormularioUsuario();

        sistema.mostrarNotificacao('Usuário salvo com sucesso!', 'success');
    }

    criptografarSenha(senha) {
        // Em produção, usar bcrypt ou similar
        return btoa(senha); // Apenas para demonstração
    }

    limparFormularioUsuario() {
        const form = document.getElementById('usuario-form');
        if (form) {
            form.reset();
            document.getElementById('usuario-ativo').checked = true;
        }
    }

    validarSenhas() {
        const senha = document.getElementById('senha-usuario').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const confirmarInput = document.getElementById('confirmar-senha');

        if (confirmarSenha && senha !== confirmarSenha) {
            confirmarInput.style.borderColor = 'var(--danger)';
        } else {
            confirmarInput.style.borderColor = 'var(--gray)';
        }
    }

    editarUsuario(id) {
        const usuario = this.dados.usuarios.find(u => u.id === id);
        if (!usuario) return;

        // Preencher formulário com dados do usuário
        document.getElementById('nome-usuario').value = usuario.nome;
        document.getElementById('email-usuario').value = usuario.email;
        document.getElementById('perfil-usuario').value = usuario.perfil;
        
        // Determinar seleção de loja
        let lojaSelecionada = 'O';
        if (usuario.lojas.includes('O') && usuario.lojas.includes('CD')) {
            lojaSelecionada = 'ambas';
        } else if (usuario.lojas.includes('CD')) {
            lojaSelecionada = 'CD';
        }
        document.getElementById('loja-usuario').value = lojaSelecionada;
        
        document.getElementById('usuario-ativo').checked = usuario.status === 'ativo';
        
        // Limpar campos de senha para segurança
        document.getElementById('senha-usuario').value = '';
        document.getElementById('confirmar-senha').value = '';

        // Alterar título do modal
        document.getElementById('modal-usuario-titulo').textContent = 'Editar Usuário';

        // Mostrar modal
        document.getElementById('usuario-modal').style.display = 'block';

        // Alterar comportamento do formulário para edição
        const form = document.getElementById('usuario-form');
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.atualizarUsuario(id);
            form.onsubmit = originalSubmit;
        };
    }

    atualizarUsuario(id) {
        // Reutiliza a lógica do salvarUsuario, que já verifica se é edição
        this.salvarUsuario();
    }

    alterarStatus(id) {
        const usuario = this.dados.usuarios.find(u => u.id === id);
        if (!usuario) return;

        const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
        const confirmar = confirm(`Deseja ${novoStatus === 'ativo' ? 'ativar' : 'desativar'} o usuário ${usuario.nome}?`);

        if (!confirmar) return;

        usuario.status = novoStatus;
        salvarDados(this.dados);
        this.carregarUsuarios();
        this.atualizarEstatisticas();

        sistema.mostrarNotificacao(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    }

    atualizarEstatisticas() {
        const usuarios = this.dados.usuarios || [];
        const totalUsuarios = usuarios.length;
        const totalAdmins = usuarios.filter(user => user.perfil === 'admin').length;
        const totalVendedores = usuarios.filter(user => user.perfil === 'vendedor').length;
        const usuariosAtivos = usuarios.filter(user => user.status === 'ativo').length;

        document.getElementById('total-usuarios').textContent = totalUsuarios;
        document.getElementById('total-admins').textContent = totalAdmins;
        document.getElementById('total-vendedores').textContent = totalVendedores;
        document.getElementById('usuarios-ativos').textContent = usuariosAtivos;
    }
}

// Inicializar gestão de usuários
const gestaoUsuarios = new GestaoUsuarios();