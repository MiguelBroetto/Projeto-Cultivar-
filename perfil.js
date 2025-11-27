  // Elementos do perfil
        const formContainer = document.getElementById("form-container");
        const perfilContainer = document.getElementById("perfil-container");
        const cadastroForm = document.getElementById("cadastroForm");
        const loginForm = document.getElementById("loginForm");
        const perfilNome = document.getElementById("perfil-nome");
        const perfilEmail = document.getElementById("perfil-email");
        const resetPasswordBtn = document.getElementById("resetPasswordBtn");
        const voltarCarrinhoBtn = document.getElementById("voltarCarrinhoBtn");
        const avisoCarrinho = document.getElementById("avisoCarrinho");
        const loginError = document.getElementById("loginError");

        // Elementos do sistema de pagamento
        const togglePaymentForm = document.getElementById('togglePaymentForm');
        const paymentForm = document.getElementById('paymentForm');
        const togglePaymentText = document.getElementById('togglePaymentText');
        const cancelPayment = document.getElementById('cancelPayment');
        const savedCards = document.getElementById('savedCards');
        const paymentOptions = document.querySelectorAll('.payment-option-btn');

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
        let veioDoCarrinho = false;

        // Sistema de Abas
        function inicializarAbas() {
            const abas = document.querySelectorAll('.aba-btn');
            const conteudos = document.querySelectorAll('.aba-conteudo');

            abas.forEach(aba => {
                aba.addEventListener('click', () => {
                    // Remover classe active de todas as abas e conteúdos
                    abas.forEach(a => a.classList.remove('active'));
                    conteudos.forEach(c => c.classList.remove('active'));

                    // Adicionar classe active na aba clicada
                    aba.classList.add('active');

                    // Mostrar conteúdo correspondente
                    const abaAlvo = aba.getAttribute('data-aba');
                    document.getElementById(`${abaAlvo}Form`).classList.add('active');

                    // Limpar mensagens de erro
                    loginError.style.display = 'none';
                });
            });
        }

        // Verifica se já existe usuário logado
        window.onload = function () {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            const urlParams = new URLSearchParams(window.location.search);
            veioDoCarrinho = urlParams.get('fromCarrinho') === 'true';

            // Inicializar sistema de abas
            inicializarAbas();

            // Inicializar sistema de pagamento
            inicializarSistemaPagamento();

            // Mostrar aviso se veio do carrinho
            if (veioDoCarrinho) {
                avisoCarrinho.style.display = 'block';

                // Se veio do carrinho, focar na aba de login se já tiver usuários
                const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
                if (usuarios.length > 0) {
                    document.querySelector('[data-aba="login"]').click();
                }
            }

            if (usuarioLogado) {
                mostrarPerfil(usuarioLogado);

                // Se veio do carrinho e já tem pagamento, mostrar botão para voltar
                if (veioDoCarrinho && usuarioLogado.formaPagamento) {
                    voltarCarrinhoBtn.style.display = 'inline-block';
                }
            } else {
                formContainer.style.display = "block";
                perfilContainer.style.display = "none";
            }
        };

        // Inicializar sistema de pagamento
        function inicializarSistemaPagamento() {
            // Toggle do formulário de pagamento
            togglePaymentForm.addEventListener('click', function () {
                if (paymentForm.style.display === 'none') {
                    paymentForm.style.display = 'block';
                    togglePaymentText.textContent = 'Fechar Formulário';
                    this.classList.add('active');
                } else {
                    paymentForm.style.display = 'none';
                    togglePaymentText.textContent = 'Adicionar Cartão';
                    this.classList.remove('active');
                }
            });

            // Cancelar adição de cartão
            cancelPayment.addEventListener('click', function () {
                paymentForm.style.display = 'none';
                togglePaymentText.textContent = 'Adicionar Cartão';
                togglePaymentForm.classList.remove('active');
                paymentForm.reset();
            });

            // Formatação dos inputs
            document.getElementById('cardNumber').addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value.substring(0, 19);
            });

            document.getElementById('cardExpiry').addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value.substring(0, 5);
            });

            // Adicionar cartão
            paymentForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const cardData = {
                    number: document.getElementById('cardNumber').value,
                    name: document.getElementById('cardName').value,
                    expiry: document.getElementById('cardExpiry').value,
                    cvv: document.getElementById('cardCVV').value,
                    type: 'Cartão de Crédito'
                };

                // Validar dados
                if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
                    alert('Por favor, preencha todos os campos do cartão.');
                    return;
                }

                salvarFormaPagamento(cardData);
            });

            // Métodos de pagamento alternativos
            paymentOptions.forEach(option => {
                option.addEventListener('click', function () {
                    const method = this.getAttribute('data-method');
                    const paymentData = {
                        type: method,
                        method: method
                    };
                    salvarFormaPagamento(paymentData);
                });
            });

            // Carregar cartões salvos
            carregarCartoesSalvos();
        }

        // Salvar forma de pagamento
        function salvarFormaPagamento(paymentData) {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (!usuarioLogado) return;

            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

            if (usuarioIndex !== -1) {
                // Inicializar array de pagamentos se não existir
                if (!usuarios[usuarioIndex].pagamentos) {
                    usuarios[usuarioIndex].pagamentos = [];
                }

                // Adicionar novo pagamento
                const novoPagamento = {
                    id: Date.now(),
                    ...paymentData,
                    dataAdicao: new Date().toISOString()
                };

                usuarios[usuarioIndex].pagamentos.push(novoPagamento);
                usuarios[usuarioIndex].formaPagamento = paymentData.type;

                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                // Atualizar usuário logado
                usuarioLogado.pagamentos = usuarios[usuarioIndex].pagamentos;
                usuarioLogado.formaPagamento = paymentData.type;
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

                // Feedback
                if (veioDoCarrinho) {
                    alert("✅ Pagamento cadastrado! Redirecionando para o carrinho...");
                    setTimeout(() => {
                        window.location.href = 'carrinho.html';
                    }, 1500);
                } else {
                    alert("✅ Forma de pagamento salva com sucesso!");
                }

                // Atualizar interface
                carregarCartoesSalvos();
                paymentForm.style.display = 'none';
                togglePaymentText.textContent = 'Adicionar Cartão';
                togglePaymentForm.classList.remove('active');
                paymentForm.reset();

                // Mostrar botão voltar ao carrinho
                if (veioDoCarrinho) {
                    voltarCarrinhoBtn.style.display = 'inline-block';
                }
            }
        }

        // Carregar cartões salvos
        function carregarCartoesSalvos() {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            savedCards.innerHTML = '';

            if (!usuarioLogado || !usuarioLogado.pagamentos || usuarioLogado.pagamentos.length === 0) {
                savedCards.innerHTML = '<div class="no-cards">Nenhuma forma de pagamento cadastrada</div>';
                return;
            }

            usuarioLogado.pagamentos.forEach(pagamento => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card-item';

                if (pagamento.type === 'Cartão de Crédito') {
                    cardElement.innerHTML = `
                        <div class="card-info">
                            <div class="card-icon">💳</div>
                            <div class="card-details">
                                <h4>Cartão de Crédito</h4>
                                <p>${pagamento.number.replace(/(\d{4})/g, '$1 ').replace(/(\d{4} ){3}/, '**** **** **** ')}</p>
                                <p>${pagamento.name} • Validade: ${pagamento.expiry}</p>
                            </div>
                        </div>
                        <button class="btn-remove" onclick="removerPagamento(${pagamento.id})">Remover</button>
                    `;
                } else {
                    cardElement.innerHTML = `
                        <div class="card-info">
                            <div class="card-icon">${pagamento.type === 'Pix' ? '🏦' : '📄'}</div>
                            <div class="card-details">
                                <h4>${pagamento.type}</h4>
                                <p>Método de pagamento</p>
                            </div>
                        </div>
                        <button class="btn-remove" onclick="removerPagamento(${pagamento.id})">Remover</button>
                    `;
                }

                savedCards.appendChild(cardElement);
            });
        }

        // Remover forma de pagamento
        function removerPagamento(pagamentoId) {
            if (!confirm('Tem certeza que deseja remover esta forma de pagamento?')) {
                return;
            }

            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (!usuarioLogado) return;

            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

            if (usuarioIndex !== -1 && usuarios[usuarioIndex].pagamentos) {
                usuarios[usuarioIndex].pagamentos = usuarios[usuarioIndex].pagamentos.filter(
                    p => p.id !== pagamentoId
                );

                // Se era o último pagamento, limpar formaPagamento
                if (usuarios[usuarioIndex].pagamentos.length === 0) {
                    delete usuarios[usuarioIndex].formaPagamento;
                }

                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                // Atualizar usuário logado
                usuarioLogado.pagamentos = usuarios[usuarioIndex].pagamentos;
                if (usuarioLogado.pagamentos.length === 0) {
                    delete usuarioLogado.formaPagamento;
                }
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

                // Atualizar interface
                carregarCartoesSalvos();
                alert('Forma de pagamento removida com sucesso!');
            }
        }

        // Cadastrar usuário
        cadastroForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const usuario = {
                nome: document.getElementById("nome").value,
                email: document.getElementById("email").value,
                senha: document.getElementById("senha").value,
                pagamentos: []
            };

            // Salvar na lista de usuários
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

            // Verificar se o email já existe
            const usuarioExistente = usuarios.find(u => u.email === usuario.email);
            if (usuarioExistente) {
                alert("Este email já está cadastrado! Faça login na aba de login.");
                document.querySelector('[data-aba="login"]').click();
                document.getElementById("loginEmail").value = usuario.email;
                return;
            }

            usuarios.push(usuario);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            // Fazer login automaticamente
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

            if (veioDoCarrinho) {
                alert("✅ Conta criada com sucesso! Agora cadastre uma forma de pagamento para finalizar sua compra.");
            } else {
                alert("✅ Conta criada com sucesso!");
            }

            mostrarPerfil(usuario);
        });

        // Fazer Login
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const senha = document.getElementById("loginSenha").value;

            // Verificar credenciais
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuario = usuarios.find(u => u.email === email && u.senha === senha);

            if (usuario) {
                // Login bem-sucedido
                localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
                loginError.style.display = 'none';

                if (veioDoCarrinho) {
                    alert("✅ Login realizado com sucesso! Agora cadastre uma forma de pagamento para finalizar sua compra.");
                } else {
                    alert("✅ Login realizado com sucesso!");
                }

                mostrarPerfil(usuario);
            } else {
                // Login falhou
                loginError.style.display = 'block';
                setTimeout(() => {
                    loginError.style.display = 'none';
                }, 3000);
            }
        });

        // Mostrar perfil
        function mostrarPerfil(usuario) {
            formContainer.style.display = "none";
            perfilContainer.style.display = "block";
            perfilNome.textContent = usuario.nome;
            perfilEmail.textContent = usuario.email;
            carregarCartoesSalvos();

            // Mostrar botão voltar ao carrinho se veio de lá
            if (veioDoCarrinho && usuario.formaPagamento) {
                voltarCarrinhoBtn.style.display = 'inline-block';
            }
        }

        // Voltar ao carrinho
        voltarCarrinhoBtn.addEventListener('click', function () {
            window.location.href = 'carrinho.html';
        });

        // Logout
        function logout() {
            if (confirm("Deseja realmente sair?")) {
                localStorage.removeItem("usuarioLogado");
                formContainer.style.display = "block";
                perfilContainer.style.display = "none";

                // Resetar formulários
                cadastroForm.reset();
                loginForm.reset();
                loginError.style.display = 'none';

                voltarCarrinhoBtn.style.display = 'none';

                // Voltar para aba de cadastro
                document.querySelector('[data-aba="cadastro"]').click();
            }
        }

        // Ícone de configuração 
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

        // ========== SISTEMA DE REDEFINIÇÃO DE SENHA ==========

        // Abrir modal de redefinição
        if (resetPasswordBtn) {
            resetPasswordBtn.addEventListener('click', () => {
                const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
                if (usuarioLogado) {
                    document.getElementById("resetEmail").value = usuarioLogado.email;
                }
                resetOverlay.style.display = 'flex';
                resetToStep(1);
            });
        }

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
                const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
                const usuarioExiste = usuarios.some(usuario => usuario.email === email);

                if (usuarioExiste) {
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
                const response = await mockApiResetPassword(resetUserEmail, resetToken, newPassword);

                if (response.success) {
                    showResetMessage(resetMessage3, 'Senha redefinida com sucesso!', 'success');

                    // Atualizar senha no localStorage
                    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
                    const usuarioIndex = usuarios.findIndex(usuario => usuario.email === resetUserEmail);

                    if (usuarioIndex !== -1) {
                        usuarios[usuarioIndex].senha = newPassword;
                        localStorage.setItem("usuarios", JSON.stringify(usuarios));

                        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
                        if (usuarioLogado && usuarioLogado.email === resetUserEmail) {
                            usuarioLogado.senha = newPassword;
                            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                        }
                    }

                    setTimeout(() => {
                        resetOverlay.style.display = 'none';
                        alert('Senha atualizada com sucesso!');
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

        // Salvar forma de pagamento
        function salvarFormaPagamento(paymentData) {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (!usuarioLogado) return;

            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

            if (usuarioIndex !== -1) {
                // Inicializar array de pagamentos se não existir
                if (!usuarios[usuarioIndex].pagamentos) {
                    usuarios[usuarioIndex].pagamentos = [];
                }

                // Adicionar novo pagamento
                const novoPagamento = {
                    id: Date.now(),
                    ...paymentData,
                    dataAdicao: new Date().toISOString()
                };

                usuarios[usuarioIndex].pagamentos.push(novoPagamento);
                usuarios[usuarioIndex].formaPagamento = paymentData.type;

                localStorage.setItem("usuarios", JSON.stringify(usuarios));

                // Atualizar usuário logado
                usuarioLogado.pagamentos = usuarios[usuarioIndex].pagamentos;
                usuarioLogado.formaPagamento = paymentData.type;
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

                // Feedback
                if (veioDoCarrinho) {
                    if (paymentData.type === 'Pix' || paymentData.type === 'Boleto') {
                        alert(`✅ ${paymentData.type} selecionado! Você será redirecionado para finalizar a compra.`);
                    } else {
                        alert("✅ Pagamento cadastrado! Redirecionando para o carrinho...");
                    }

                    setTimeout(() => {
                        window.location.href = 'carrinho.html';
                    }, 1500);
                } else {
                    alert("✅ Forma de pagamento salva com sucesso!");
                }

                // Atualizar interface
                carregarCartoesSalvos();
                paymentForm.style.display = 'none';
                togglePaymentText.textContent = 'Adicionar Cartão';
                togglePaymentForm.classList.remove('active');
                paymentForm.reset();

                // Mostrar botão voltar ao carrinho
                if (veioDoCarrinho) {
                    voltarCarrinhoBtn.style.display = 'inline-block';
                }
            }
        }