// Autenticação de usuários
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Usuários de exemplo (em produção, isso viria de um backend)
    const usuarios = [
        {
            email: 'admin@shineray.com',
            password: 'admin123',
            nome: 'Administrador',
            perfil: 'admin',
            lojas: ['O', 'CD']
        },
        {
            email: 'vendedor.o@shineray.com',
            password: 'vendedor123',
            nome: 'Vendedor Oitizeiro',
            perfil: 'vendedor',
            lojas: ['O']
        },
        {
            email: 'vendedor.cd@shineray.com',
            password: 'vendedor123',
            nome: 'Vendedor Conde',
            perfil: 'vendedor',
            lojas: ['CD']
        }
    ];
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loja = document.getElementById('loja').value;
        
        // Validar credenciais
        const usuario = usuarios.find(u => u.email === email && u.password === password);
        
        if (usuario) {
            // Verificar se o usuário tem acesso à loja selecionada
            if (usuario.lojas.includes(loja) || usuario.perfil === 'admin') {
                // Salvar dados do usuário no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify({
                    ...usuario,
                    lojaAtual: loja
                }));
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Você não tem acesso a esta loja.');
            }
        } else {
            alert('E-mail ou senha incorretos.');
        }
    });
    
    // Verificar se já está logado
    if (localStorage.getItem('usuarioLogado') && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }
});