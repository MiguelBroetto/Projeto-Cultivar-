// ============================================
// LOGIN - SISTEMA DE AUTENTICAÇÃO
// ============================================

// Elementos do DOM
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const forgotPassword = document.getElementById("forgotPassword");
const resetOverlay = document.getElementById("resetOverlay");
const resetClose = document.getElementById("resetClose");

// Elementos do sistema de reset
const resetStep1 = document.getElementById("resetStep1");
const resetStep2 = document.getElementById("resetStep2");
const resetStep3 = document.getElementById("resetStep3");
const resetRequestForm = document.getElementById("resetRequestForm");
const verifyCodeForm = document.getElementById("verifyCodeForm");
const newPasswordForm = document.getElementById("newPasswordForm");

// Estado do sistema de reset
let resetData = {
    email: '',
    resetCode: '',
    generatedCode: ''
};

// ============================================
// SISTEMA DE LOGIN
// ============================================

/**
 * Processa o formulário de login
 * @param {Event} event - Evento de submit do formulário
 */
function processarLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Validação básica
    if (!validarEmail(email) || !validarSenha(password)) {
        mostrarErro("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Verificar credenciais
    const loginValido = verificarCredenciais(email, password);

    if (loginValido) {
        redirecionarAposLogin();
    } else {
        mostrarErro("E-mail ou senha incorretos!");
    }
}

/**
 * Valida formato de e-mail
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} True se o e-mail é válido
 */
function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} senha - Senha a ser validada
 * @returns {boolean} True se a senha é válida
 */
function validarSenha(senha) {
    return senha.length >= 6;
}

/**
 * Verifica as credenciais do usuário
 * @param {string} email - E-mail do usuário
 * @param {string} senha - Senha do usuário
 * @returns {boolean} True se as credenciais são válidas
 */
function verificarCredenciais(email, senha) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        // Salvar usuário logado (sem a senha por segurança)
        const usuarioSeguro = { ...usuario };
        delete usuarioSeguro.senha;
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSeguro));
        return true;
    }

    return false;
}

/**
 * Redireciona após login bem-sucedido
 */
function redirecionarAposLogin() {
    // Feedback visual
    const botaoLogin = loginForm.querySelector('button[type="submit"]');
    const textoOriginal = botaoLogin.textContent;
    botaoLogin.textContent = "Entrando...";
    botaoLogin.classList.add('btn-loading');
    botaoLogin.disabled = true;

    setTimeout(() => {
        window.location.href = "perfil.html";
    }, 1000);
}

/**
 * Exibe mensagem de erro no login
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorMessage.style.display = "block";

    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

// ============================================
// SISTEMA DE REDEFINIÇÃO DE SENHA
// ============================================

/**
 * Abre o modal de redefinição de senha
 */
function abrirRedefinicaoSenha() {
    resetOverlay.style.display = "flex";
    resetStep1.classList.add("active");
    resetStep2.classList.remove("active");
    resetStep3.classList.remove("active");

    // Limpar dados anteriores
    resetData = { email: '', resetCode: '', generatedCode: '' };
    limparMensagensReset();
}

/**
 * Fecha o modal de redefinição de senha
 */
function fecharRedefinicaoSenha() {
    resetOverlay.style.display = "none";
    limparMensagensReset();
}

/**
 * Limpa todas as mensagens do sistema de reset
 */
function limparMensagensReset() {
    const mensagens = document.querySelectorAll('.reset-message');
    mensagens.forEach(msg => {
        msg.style.display = 'none';
        msg.className = 'reset-message';
    });
}

/**
 * Processa solicitação de redefinição de senha
 * @param {Event} event - Evento de submit do formulário
 */
function solicitarRedefinicaoSenha(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value;
    const mensagem = document.getElementById("resetMessage1");

    if (!validarEmail(email)) {
        mostrarMensagemReset(mensagem, "Por favor, insira um e-mail válido.", "error");
        return;
    }

    // Verificar se o e-mail existe
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuarioExiste = usuarios.some(u => u.email === email);

    if (!usuarioExiste) {
        mostrarMensagemReset(mensagem, "E-mail não encontrado em nosso sistema.", "error");
        return;
    }

    // Simular envio de código (em sistema real, enviaria por e-mail)
    resetData.email = email;
    resetData.generatedCode = gerarCodigoVerificacao();

    console.log(`Código de verificação para ${email}: ${resetData.generatedCode}`); // Para testes

    mostrarMensagemReset(mensagem, `Código enviado para ${email} (verifique o console para testes)`, "info");

    // Avançar para próximo passo após 2 segundos
    setTimeout(() => {
        resetStep1.classList.remove("active");
        resetStep2.classList.add("active");
    }, 2000);
}

/**
 * Gera código de verificação aleatório
 * @returns {string} Código de 6 dígitos
 */
function gerarCodigoVerificacao() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verifica o código de redefinição
 * @param {Event} event - Evento de submit do formulário
 */
function verificarCodigoRedefinicao(event) {
    event.preventDefault();

    const codigo = document.getElementById("resetCode").value;
    const mensagem = document.getElementById("resetMessage2");

    if (codigo === resetData.generatedCode) {
        resetData.resetCode = codigo;
        resetStep2.classList.remove("active");
        resetStep3.classList.add("active");
        limparMensagensReset();
    } else {
        mostrarMensagemReset(mensagem, "Código inválido. Tente novamente.", "error");
    }
}

/**
 * Define nova senha
 * @param {Event} event - Evento de submit do formulário
 */
function definirNovaSenha(event) {
    event.preventDefault();

    const novaSenha = document.getElementById("newPassword").value;
    const confirmarSenha = document.getElementById("confirmPassword").value;
    const mensagem = document.getElementById("resetMessage3");

    if (novaSenha.length < 6) {
        mostrarMensagemReset(mensagem, "A senha deve ter pelo menos 6 caracteres.", "error");
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarMensagemReset(mensagem, "As senhas não coincidem.", "error");
        return;
    }

    // Atualizar senha no localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuarioIndex = usuarios.findIndex(u => u.email === resetData.email);

    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].senha = novaSenha;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        mostrarMensagemReset(mensagem, "Senha redefinida com sucesso!", "success");

        // Fechar modal após 2 segundos
        setTimeout(() => {
            fecharRedefinicaoSenha();

            // Preencher automaticamente o login
            document.getElementById("loginEmail").value = resetData.email;
            document.getElementById("loginPassword").value = novaSenha;

            // Mostrar mensagem de sucesso no login
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Senha redefinida com sucesso! Você já pode fazer login.';
            successMessage.style.display = 'block';
            loginForm.appendChild(successMessage);

            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }, 2000);
    } else {
        mostrarMensagemReset(mensagem, "Erro ao redefinir senha. Tente novamente.", "error");
    }
}

/**
 * Exibe mensagem no sistema de reset
 * @param {HTMLElement} elemento - Elemento da mensagem
 * @param {string} texto - Texto da mensagem
 * @param {string} tipo - Tipo da mensagem (success, error, info)
 */
function mostrarMensagemReset(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `reset-message reset-${tipo}`;
    elemento.style.display = "block";
}

// ============================================
// NAVEGAÇÃO DO SISTEMA DE RESET
// ============================================

/**
 * Volta para o passo 1 do reset
 */
function voltarParaPasso1() {
    resetStep2.classList.remove("active");
    resetStep3.classList.remove("active");
    resetStep1.classList.add("active");
    limparMensagensReset();
}

/**
 * Volta para o passo 2 do reset
 */
function voltarParaPasso2() {
    resetStep3.classList.remove("active");
    resetStep2.classList.add("active");
    limparMensagensReset();
}

// ============================================
// CONFIGURAÇÃO DE EVENTOS
// ============================================

/**
 * Configura todos os eventos da página de login
 */
function configurarEventosLogin() {
    // Eventos do formulário de login
    loginForm.addEventListener('submit', processarLogin);

    // Eventos do sistema de redefinição
    forgotPassword.addEventListener('click', abrirRedefinicaoSenha);
    resetClose.addEventListener('click', fecharRedefinicaoSenha);
    resetRequestForm.addEventListener('submit', solicitarRedefinicaoSenha);
    verifyCodeForm.addEventListener('submit', verificarCodigoRedefinicao);
    newPasswordForm.addEventListener('submit', definirNovaSenha);

    // Eventos de navegação do reset
    document.getElementById('backToResetStep1').addEventListener('click', voltarParaPasso1);
    document.getElementById('backToResetStep2').addEventListener('click', voltarParaPasso2);

    // Fechar modal clicando fora
    resetOverlay.addEventListener('click', (e) => {
        if (e.target === resetOverlay) {
            fecharRedefinicaoSenha();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resetOverlay.style.display === 'flex') {
            fecharRedefinicaoSenha();
        }
    });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa todas as funcionalidades da página de login
 */
function inicializarLogin() {
    configurarEventosLogin();

    // Verificar se há usuário logado (redirecionar se já estiver logado)
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
        window.location.href = "perfil.html";
    }

    console.log("Sistema de login inicializado");
}

// Inicia quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarLogin);