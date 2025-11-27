  // Elementos principais
        const loginForm = document.getElementById("loginForm");
        const errorMessage = document.getElementById("errorMessage");
        const successMessage = document.getElementById("successMessage");
        const avisoCarrinho = document.getElementById("avisoCarrinho");

        // Elementos do sistema de redefinição
        const resetOverlay = document.getElementById("resetOverlay");
        const resetClose = document.getElementById("resetClose");
        const forgotPassword = document.getElementById("forgotPassword");
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
        let veioDoCarrinho = false;

        // Verificar se veio do carrinho ao carregar a página
        window.onload = function () {
            const urlParams = new URLSearchParams(window.location.search);
            veioDoCarrinho = urlParams.get('fromCarrinho') === 'true';

            // Mostrar aviso se veio do carrinho
            if (veioDoCarrinho) {
                avisoCarrinho.style.display = 'block';
            }

            // Verificar se já está logado
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (usuarioLogado) {
                // Se já está logado e veio do carrinho, redirecionar para perfil
                if (veioDoCarrinho) {
                    window.location.href = 'perfil.html?fromCarrinho=true';
                } else {
                    window.location.href = 'perfil.html';
                }
            }

            // Sistema do menu de configuração
            const settingsBtn = document.getElementById('settingsBtn');
            const dropdownMenu = document.getElementById('dropdownMenu');

            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!dropdownMenu.contains(e.target) && e.target !== settingsBtn) {
                    dropdownMenu.classList.remove('active');
                }
            });
        };

        // Sistema de Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            // Verificar credenciais
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuario = usuarios.find(u => u.email === email && u.senha === password);

            if (usuario) {
                // Login bem-sucedido
                localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

                // Mostrar mensagem de sucesso
                successMessage.textContent = "Login realizado com sucesso! Redirecionando...";
                successMessage.style.display = "block";
                errorMessage.style.display = "none";

                // Redirecionar após breve delay
                setTimeout(() => {
                    if (veioDoCarrinho) {
                        window.location.href = "perfil.html?fromCarrinho=true";
                    } else {
                        window.location.href = "perfil.html";
                    }
                }, 1500);
            } else {
                // Login falhou
                errorMessage.textContent = "E-mail ou senha incorretos!";
                errorMessage.style.display = "block";
                successMessage.style.display = "none";

                // Esconder mensagem após 5 segundos
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 5000);
            }
        });

        // ========== SISTEMA DE REDEFINIÇÃO DE SENHA ==========

        // Abrir modal de redefinição
        forgotPassword.addEventListener('click', () => {
            resetOverlay.style.display = 'flex';
            resetToStep(1);
        });

        // Fechar modal de redefinição
        resetClose.addEventListener('click', () => {
            resetOverlay.style.display = 'none';
        });

        // Fechar modal ao clicar fora
        resetOverlay.addEventListener('click', (e) => {
            if (e.target === resetOverlay) {
                resetOverlay.style.display = 'none';
            }
        });

        // Função para mostrar mensagens
        function showResetMessage(element, message, type) {
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
            resetStep1.classList.remove('active');
            resetStep2.classList.remove('active');
            resetStep3.classList.remove('active');

            if (stepNumber === 1) {
                resetStep1.classList.add('active');
            } else if (stepNumber === 2) {
                resetStep2.classList.add('active');
            } else if (stepNumber === 3) {
                resetStep3.classList.add('active');
            }
        }

        // Evento: Solicitar redefinição de senha
        resetRequestForm.addEventListener('submit', async (e) => {
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
        });

        // Evento: Verificar código
        verifyCodeForm.addEventListener('submit', async (e) => {
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
        });

        // Evento: Definir nova senha
        newPasswordForm.addEventListener('submit', async (e) => {
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
                    }

                    // Fechar modal após 3 segundos
                    setTimeout(() => {
                        resetOverlay.style.display = 'none';
                        alert('Senha atualizada com sucesso! Faça login com sua nova senha.');
                    }, 3000);
                } else {
                    showResetMessage(resetMessage3, response.message || 'Erro ao redefinir senha.', 'error');
                }
            } catch (error) {
                showResetMessage(resetMessage3, 'Erro de conexão. Tente novamente.', 'error');
            }
        });

        // Eventos para voltar entre etapas
        backToResetStep1.addEventListener('click', (e) => {
            e.preventDefault();
            resetToStep(1);
        });

        backToResetStep2.addEventListener('click', (e) => {
            e.preventDefault();
            resetToStep(2);
        });

        // Funções mock para simular chamadas à API
        function mockApiRequestReset(email) {
            return new Promise((resolve) => {
                setTimeout(() => {
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