// Elementos do perfil
const formContainer = document.getElementById("form-container");
const perfilContainer = document.getElementById("perfil-container");
const cadastroForm = document.getElementById("cadastroForm");
const perfilNome = document.getElementById("perfil-nome");
const perfilEmail = document.getElementById("perfil-email");
const listaPagamentos = document.getElementById("listaPagamentos");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

// Elementos do sistema de redefinição
const resetOverlay = document.getElementById("resetOverlay");
const resetClose = document.getElementById("resetClose");
const resetStep1 = document.getElementById("resetStep1");
const resetStep2 = document.getElementById("resetStep2");
const resetStep3 = document.getElementById("resetStep3");
const resetRequestForm = document.getElementById("resetRequestForm");
const verifyCodeForm = document.getElementById("verifyCodeForm");
const newPasswordForm = document.getElementById("newPasswordForm");
const resetMessage1 = document.getElementById("resetMessage1");
const resetMessage2 = document.getElementById("resetMessage2");
const resetMessage3 = document.getElementById("resetMessage3");
const backToResetStep1 = document.getElementById("backToResetStep1");
const backToResetStep2 = document.getElementById("backToResetStep2");

// Variáveis para armazenar dados entre etapas
let resetUserEmail = '';
let resetToken = '';

// Inicialização da página
document.addEventListener('DOMContentLoaded', function () {
    inicializarPerfil();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Cadastrar usuário
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", cadastrarUsuario);
    }

    // Salvar forma de pagamento
    const formPerfil = document.getElementById("formPerfil");
    if (formPerfil) {
        formPerfil.addEventListener("submit", salvarFormaPagamento);
    }

    // Sistema de redefinição de senha
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', abrirModalRedefinicao);
    }

    if (resetClose) {
        resetClose.addEventListener('click', fecharModalRedefinicao);
    }

    if (resetOverlay) {
        resetOverlay.addEventListener('click', fecharModalClicandoFora);
    }

    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', solicitarRedefinicaoSenha);
    }

    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', verificarCodigo);
    }

    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', definirNovaSenha);
    }

    if (backToResetStep1) {
        backToResetStep1.addEventListener('click', voltarParaEtapa1);
    }

    if (backToResetStep2) {
        backToResetStep2.addEventListener('click', voltarParaEtapa2);
    }

    // Configurações do dropdown
    const settingsBtn = document.getElementById('settingsBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (settingsBtn && dropdownMenu) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && e.target !== settingsBtn) {
                dropdownMenu.classList.remove('active');
            }
        });
    }
}

// Inicializar perfil
function inicializarPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado) {
        mostrarPerfil(usuarioLogado);
    } else {
        mostrarTelaLogin();
    }
}

// Mostrar tela de login/cadastro
function mostrarTelaLogin() {
    if (formContainer) formContainer.style.display = "block";
    if (perfilContainer) perfilContainer.style.display = "none";

    // Adicionar opção de login se já existirem usuários cadastrados
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    if (usuarios.length > 0) {
        adicionarOpcaoLogin();
    }
}

// Adicionar opção de login com conta existente
function adicionarOpcaoLogin() {
    // Verificar se já existe o botão de login
    if (!document.getElementById("loginBtn")) {
        const loginBtn = document.createElement("button");
        loginBtn.id = "loginBtn";
        loginBtn.textContent = "Fazer Login com Outra Conta";
        loginBtn.type = "button";
        loginBtn.className = "btn-login-alternativo";
        loginBtn.addEventListener("click", redirecionarParaLogin);

        cadastroForm.appendChild(loginBtn);
    }
}

// Redirecionar para página de login
function redirecionarParaLogin() {
    window.location.href = "login.html";
}

// Cadastrar usuário
function cadastrarUsuario(e) {
    e.preventDefault();

    const usuario = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
        dataCadastro: new Date().toISOString()
    };

    // Salvar na lista de usuários
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // Verificar se o email já existe
    const usuarioExistente = usuarios.find(u => u.email === usuario.email);
    if (usuarioExistente) {
        mostrarNotificacao("Este email já está cadastrado! Faça login ou use outro email.", "error");
        return;
    }

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Fazer login automaticamente
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Mostrar mensagem de sucesso
    mostrarNotificacao("Conta criada com sucesso!", "success");
    setTimeout(() => {
        mostrarPerfil(usuario);
    }, 1500);
}

// Mostrar perfil
function mostrarPerfil(usuario) {
    if (formContainer) formContainer.style.display = "none";
    if (perfilContainer) perfilContainer.style.display = "block";

    if (perfilNome) perfilNome.textContent = usuario.nome;
    if (perfilEmail) perfilEmail.textContent = usuario.email;

    mostrarPagamentos();
    adicionarBotaoTrocarConta();
}

// Adicionar botão de trocar conta
function adicionarBotaoTrocarConta() {
    if (!document.getElementById("trocarContaBtn")) {
        const trocarContaBtn = document.createElement("button");
        trocarContaBtn.id = "trocarContaBtn";
        trocarContaBtn.textContent = "Trocar de Conta";
        trocarContaBtn.type = "button";
        trocarContaBtn.className = "btn-trocar-conta";
        trocarContaBtn.addEventListener("click", trocarConta);

        // Adicionar ao lado do botão de logout
        const logoutBtn = document.querySelector(".logout");
        if (logoutBtn) {
            logoutBtn.parentNode.insertBefore(trocarContaBtn, logoutBtn.nextSibling);
        }
    }
}

// Trocar de conta
function trocarConta() {
    if (confirm("Deseja fazer login com outra conta?")) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    }
}

// Logout
function logout() {
    if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("formaPagamento");
        mostrarTelaLogin();

        // Limpar formulário
        if (cadastroForm) cadastroForm.reset();

        mostrarNotificacao("Logout realizado com sucesso!", "success");
    }
}

// Salvar forma de pagamento
function salvarFormaPagamento(e) {
    e.preventDefault();
    const pagamento = document.getElementById("pagamento").value;

    // Salvar forma de pagamento do usuário atual
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].formaPagamento = pagamento;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            // Atualizar usuário logado
            usuarioLogado.formaPagamento = pagamento;
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
        }
    }

    localStorage.setItem("formaPagamento", pagamento);
    mostrarNotificacao("Forma de pagamento salva com sucesso!", "success");
    mostrarPagamentos();
}

// Mostrar lista de pagamentos
function mostrarPagamentos() {
    if (!listaPagamentos) return;

    listaPagamentos.innerHTML = "";
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    let formaPagamento = null;

    if (usuarioLogado && usuarioLogado.formaPagamento) {
        formaPagamento = usuarioLogado.formaPagamento;
    } else {
        formaPagamento = localStorage.getItem("formaPagamento");
    }

    if (formaPagamento) {
        const div = document.createElement("div");
        div.classList.add("pagamento-item");
        div.innerHTML = `
            <strong>Forma de pagamento preferida:</strong>
            <span>${formaPagamento}</span>
            <button class="btn-remover-pagamento" onclick="removerFormaPagamento()">×</button>
        `;
        listaPagamentos.appendChild(div);
    } else {
        const div = document.createElement("div");
        div.classList.add("pagamento-vazio");
        div.textContent = "Nenhuma forma de pagamento cadastrada";
        listaPagamentos.appendChild(div);
    }
}

// Remover forma de pagamento
function removerFormaPagamento() {
    if (confirm("Deseja remover a forma de pagamento salva?")) {
        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

        if (usuarioLogado) {
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

            if (usuarioIndex !== -1) {
                delete usuarios[usuarioIndex].formaPagamento;
                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                // Atualizar usuário logado
                delete usuarioLogado.formaPagamento;
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
            }
        }

        localStorage.removeItem("formaPagamento");
        mostrarNotificacao("Forma de pagamento removida!", "success");
        mostrarPagamentos();
    }
}

// Sistema de Redefinição de Senha

// Abrir modal de redefinição
function abrirModalRedefinicao() {
    // Preencher automaticamente o email do usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado && document.getElementById("resetEmail")) {
        document.getElementById("resetEmail").value = usuarioLogado.email;
    }

    resetOverlay.style.display = 'flex';
    resetToStep(1);
}

// Fechar modal de redefinição
function fecharModalRedefinicao() {
    resetOverlay.style.display = 'none';
    limparFormulariosRedefinicao();
}

// Fechar modal ao clicar fora
function fecharModalClicandoFora(e) {
    if (e.target === resetOverlay) {
        fecharModalRedefinicao();
    }
}

// Limpar formulários de redefinição
function limparFormulariosRedefinicao() {
    if (resetRequestForm) resetRequestForm.reset();
    if (verifyCodeForm) verifyCodeForm.reset();
    if (newPasswordForm) newPasswordForm.reset();

    resetUserEmail = '';
    resetToken = '';

    // Esconder mensagens
    if (resetMessage1) resetMessage1.style.display = 'none';
    if (resetMessage2) resetMessage2.style.display = 'none';
    if (resetMessage3) resetMessage3.style.display = 'none';
}

// Função para mostrar mensagens
function showResetMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = `reset-message reset-${type}`;
    element.style.display = 'block';

    // Auto-esconder mensagens de sucesso após 5 segundos
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Função para mudar entre etapas
function resetToStep(stepNumber) {
    if (resetStep1) resetStep1.classList.remove('active');
    if (resetStep2) resetStep2.classList.remove('active');
    if (resetStep3) resetStep3.classList.remove('active');

    if (stepNumber === 1 && resetStep1) {
        resetStep1.classList.add('active');
    } else if (stepNumber === 2 && resetStep2) {
        resetStep2.classList.add('active');
    } else if (stepNumber === 3 && resetStep3) {
        resetStep3.classList.add('active');
    }
}

// Evento: Solicitar redefinição de senha
async function solicitarRedefinicaoSenha(e) {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value;
    resetUserEmail = email;

    try {
        // Verificar se o e-mail existe no sistema
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const usuarioExiste = usuarios.some(usuario => usuario.email === email);

        if (usuarioExiste) {
            // Simulação de chamada à API
            const response = await mockApiRequestReset(email);

            if (response.success) {
                showResetMessage(resetMessage1, 'Código de verificação enviado para o seu e-mail!', 'success');
                setTimeout(() => {
                    resetToStep(2);
                }, 2000);
            } else {
                showResetMessage(resetMessage1, response.message || 'Erro ao enviar código.', 'error');
            }
        } else {
            showResetMessage(resetMessage1, 'E-mail não encontrado em nosso sistema.', 'error');
        }
    } catch (error) {
        showResetMessage(resetMessage1, 'Erro de conexão. Tente novamente.', 'error');
    }
}

// Evento: Verificar código
async function verificarCodigo(e) {
    e.preventDefault();

    const code = document.getElementById("resetCode").value;

    try {
        // Simulação de chamada à API
        const response = await mockApiVerifyCode(resetUserEmail, code);

        if (response.success) {
            resetToken = response.token;
            showResetMessage(resetMessage2, 'Código verificado com sucesso!', 'success');
            setTimeout(() => {
                resetToStep(3);
            }, 1000);
        } else {
            showResetMessage(resetMessage2, response.message || 'Código inválido.', 'error');
        }
    } catch (error) {
        showResetMessage(resetMessage2, 'Erro de conexão. Tente novamente.', 'error');
    }
}

// Evento: Definir nova senha
async function definirNovaSenha(e) {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        showResetMessage(resetMessage3, 'As senhas não coincidem.', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showResetMessage(resetMessage3, 'A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    try {
        // Simulação de chamada à API
        const response = await mockApiResetPassword(resetUserEmail, resetToken, newPassword);

        if (response.success) {
            showResetMessage(resetMessage3, 'Senha redefinida com sucesso!', 'success');

            // Atualizar senha no localStorage
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuarioIndex = usuarios.findIndex(usuario => usuario.email === resetUserEmail);

            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex].senha = newPassword;
                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                // Se for o usuário logado, atualizar também a sessão
                const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
                if (usuarioLogado && usuarioLogado.email === resetUserEmail) {
                    usuarioLogado.senha = newPassword;
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                }
            }

            // Fechar modal após 3 segundos
            setTimeout(() => {
                resetOverlay.style.display = 'none';
                limparFormulariosRedefinicao();
                mostrarNotificacao('Senha atualizada com sucesso!', 'success');
            }, 3000);
        } else {
            showResetMessage(resetMessage3, response.message || 'Erro ao redefinir senha.', 'error');
        }
    } catch (error) {
        showResetMessage(resetMessage3, 'Erro de conexão. Tente novamente.', 'error');
    }
}

// Eventos para voltar entre etapas
function voltarParaEtapa1(e) {
    e.preventDefault();
    resetToStep(1);
}

function voltarParaEtapa2(e) {
    e.preventDefault();
    resetToStep(2);
}

// Funções mock para simular chamadas à API
function mockApiRequestReset(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Em um sistema real, aqui enviaria um email com código
            console.log(`Código de verificação para ${email}: 123456`);
            resolve({ success: true, message: 'Código enviado com sucesso' });
        }, 1000);
    });
}

function mockApiVerifyCode(email, code) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulação: código válido é "123456"
            if (code === '123456') {
                resolve({ success: true, token: 'mock_reset_token_' + Date.now() });
            } else {
                resolve({ success: false, message: 'Código inválido' });
            }
        }, 1000);
    });
}

function mockApiResetPassword(email, token, newPassword) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'Senha alterada com sucesso' });
        }, 1000);
    });
}

// Sistema de notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;

    // Adicionar ao body
    document.body.appendChild(notificacao);

    // Mostrar animação
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 100);

    // Remover após 5 segundos
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 5000);
}

// Adicionar estilos para notificações se não existirem
function adicionarEstilosNotificacoes() {
    if (!document.getElementById('estilos-notificacoes')) {
        const style = document.createElement('style');
        style.id = 'estilos-notificacoes';
        style.textContent = `
            .notificacao {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .notificacao.mostrar {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notificacao-success { background: #388E3C; }
            .notificacao-error { background: #e92020; }
            .notificacao-info { background: #1976D2; }
            .notificacao-warning { background: #FFB300; }
            
            .btn-login-alternativo {
                background: #27ae60 !important;
                margin-top: 10px !important;
            }
            
            .btn-trocar-conta {
                background: #95a5a6 !important;
                margin-top: 10px !important;
                margin-left: 10px !important;
            }
            
            .pagamento-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 10px;
            }
            
            .btn-remover-pagamento {
                background: #e92020;
                color: white;
                border: none;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
            }
            
            .pagamento-vazio {
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
                text-align: center;
                color: #666;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar estilos quando o script carregar
adicionarEstilosNotificacoes();

// Exportar funções para uso global
window.logout = logout;
window.removerFormaPagamento = removerFormaPagamento;