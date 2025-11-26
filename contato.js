// ============================================
// CONTATO - FORMULÁRIO DE CONTATO
// ============================================

// Elementos do DOM
const contactForm = document.getElementById('contactForm');
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// ============================================
// CONFIGURAÇÃO DO EMAILJS
// ============================================

/**
 * Inicializa o EmailJS com a chave pública
 */
function inicializarEmailJS() {
    emailjs.init("2oEXG1umxPx3N_u33"); // Public key do EmailJS
    console.log("EmailJS inicializado");
}

// ============================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================

/**
 * Valida o formulário antes do envio
 * @returns {boolean} True se o formulário é válido
 */
function validarFormulario() {
    if (!contactForm.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        
        // Destaca campos inválidos
        destacarCamposInvalidos();
        return false;
    }
    
    return true;
}

/**
 * Destaca visualmente os campos inválidos
 */
function destacarCamposInvalidos() {
    const campos = contactForm.querySelectorAll('input, textarea');
    
    campos.forEach(campo => {
        if (!campo.checkValidity()) {
            campo.style.borderColor = '#e53935';
            campo.style.boxShadow = '0 0 0 2px rgba(229, 57, 53, 0.2)';
        } else {
            campo.style.borderColor = '';
            campo.style.boxShadow = '';
        }
    });
}

/**
 * Remove o destaque dos campos quando o usuário começa a digitar
 */
function configurarValidacaoEmTempoReal() {
    const campos = contactForm.querySelectorAll('input, textarea');
    
    campos.forEach(campo => {
        campo.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
}

// ============================================
// ENVIO DO FORMULÁRIO
// ============================================

/**
 * Envia o formulário via EmailJS
 * @param {Event} event - Evento de submit do formulário
 */
function enviarFormulario(event) {
    event.preventDefault();
    
    // Valida o formulário
    if (!validarFormulario()) {
        return;
    }
    
    // Mostra feedback de carregamento
    const botaoEnviar = contactForm.querySelector('button[type="submit"]');
    const textoOriginal = botaoEnviar.textContent;
    botaoEnviar.textContent = 'Enviando...';
    botaoEnviar.disabled = true;
    
    // Prepara dados adicionais
    const dadosAdicionais = {
        data_envio: new Date().toLocaleString('pt-BR'),
        origem: 'Site Cultivar +'
    };
    
    // Envia via EmailJS
    emailjs.sendForm('service_vn8hv0g', 'template_6hlurdd', contactForm, dadosAdicionais)
        .then((response) => {
            console.log('Email enviado com sucesso:', response);
            mostrarMensagemSucesso();
            limparFormulario();
            redirecionarParaHome();
        })
        .catch((error) => {
            console.error('Erro ao enviar email:', error);
            mostrarErroEnvio();
        })
        .finally(() => {
            // Restaura o botão
            botaoEnviar.textContent = textoOriginal;
            botaoEnviar.disabled = false;
        });
}

/**
 * Mostra mensagem de sucesso no envio
 */
function mostrarMensagemSucesso() {
    alert('✅ Mensagem enviada com sucesso! Obrigado pelo contato.\nRetornaremos em breve.');
}

/**
 * Mostra mensagem de erro no envio
 */
function mostrarErroEnvio() {
    alert('❌ Ocorreu um erro ao enviar sua mensagem.\nPor favor, tente novamente mais tarde ou entre em contato diretamente pelo telefone.');
}

/**
 * Limpa o formulário após envio bem-sucedido
 */
function limparFormulario() {
    contactForm.reset();
    
    // Remove quaisquer estilos de validação
    const campos = contactForm.querySelectorAll('input, textarea');
    campos.forEach(campo => {
        campo.style.borderColor = '';
        campo.style.boxShadow = '';
    });
}

/**
 * Redireciona para a página inicial após sucesso
 */
function redirecionarParaHome() {
    setTimeout(() => {
        window.location.href = "index.html";
    }, 2000); // 2 segundos de delay
}

// ============================================
// CONFIGURAÇÃO DO MENU DROPDOWN
// ============================================

/**
 * Configura o menu dropdown de configurações
 */
function configurarMenuDropdown() {
    if (!settingsBtn || !dropdownMenu) {
        console.warn('Elementos do menu dropdown não encontrados');
        return;
    }
    
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

// ============================================
// MÁSCARA DE TELEFONE
// ============================================

/**
 * Aplica máscara de telefone no campo
 */
function aplicarMascaraTelefone() {
    const telefoneInput = document.getElementById('telefone');
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa todas as funcionalidades da página de contato
 */
function inicializarContato() {
    // Configura eventos
    contactForm.addEventListener('submit', enviarFormulario);
    configurarMenuDropdown();
    configurarValidacaoEmTempoReal();
    aplicarMascaraTelefone();
    
    // Inicializa EmailJS
    inicializarEmailJS();
    
    console.log("Página de contato inicializada");
}

// Inicia quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarContato);

// ============================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================

window.addEventListener('error', function(e) {
    console.error('Erro global capturado:', e.error);
});

// Exporta funções para uso global (se necessário)
window.ContatoUtils = {
    validarFormulario,
    enviarFormulario,
    limparFormulario
};