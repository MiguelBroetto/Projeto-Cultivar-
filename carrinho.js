  const carrinhoContainer = document.getElementById("carrinho");
        const finalizarBtn = document.getElementById("finalizarCompra");
        const carrinhoVazio = document.getElementById("carrinhoVazio");
        const carrinhoComItens = document.getElementById("carrinhoComItens");
        const subtotalElement = document.getElementById("subtotal");
        const freteElement = document.getElementById("frete");
        const totalElement = document.getElementById("total");
        const infoPagamento = document.getElementById("infoPagamento");

        // Elementos dos modais
        const modalPix = document.getElementById('modalPix');
        const modalBoleto = document.getElementById('modalBoleto');
        const modalConfirmacao = document.getElementById('modalConfirmacao');
        const fecharPix = document.getElementById('fecharPix');
        const fecharBoleto = document.getElementById('fecharBoleto');
        const copiarChavePix = document.getElementById('copiarChavePix');
        const copiarCodigoBarras = document.getElementById('copiarCodigoBarras');
        const imprimirBoleto = document.getElementById('imprimirBoleto');
        const pixConcluido = document.getElementById('pixConcluido');
        const boletoConcluido = document.getElementById('boletoConcluido');
        const voltarInicio = document.getElementById('voltarInicio');

        // Elementos do frete
        const cepInput = document.getElementById('cepInput');
        const calcularFreteBtn = document.getElementById('calcularFreteBtn');
        const freteResultado = document.getElementById('freteResultado');
        const freteLoading = document.getElementById('freteLoading');
        const freteError = document.getElementById('freteError');
        const opcoesFrete = document.querySelector('.opcoes-frete');
        const infoFreteSelecionado = document.getElementById('infoFreteSelecionado');

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        let freteSelecionado = null;
        let cepAtual = '';

        // Formatação do CEP
        cepInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;

            // Habilitar botão se CEP estiver completo
            calcularFreteBtn.disabled = value.length !== 9;
        });

        // Calcular frete
        calcularFreteBtn.addEventListener('click', calcularFrete);

        // Também calcular ao pressionar Enter
        cepInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && cepInput.value.length === 9) {
                calcularFrete();
            }
        });

        function calcularFrete() {
            const cep = cepInput.value.replace(/\D/g, '');

            if (cep.length !== 8) {
                alert('Por favor, digite um CEP válido (8 dígitos)');
                return;
            }

            cepAtual = cep;
            freteLoading.style.display = 'block';
            freteResultado.style.display = 'none';
            freteError.style.display = 'none';
            calcularFreteBtn.disabled = true;

            // Simular cálculo de frete (em produção, isso viria de uma API)
            setTimeout(() => {
                simularCalculoFrete(cep);
            }, 1500);
        }

        function simularCalculoFrete(cep) {
            freteLoading.style.display = 'none';

            // Debug no console
            console.log('Calculando frete para CEP:', cep);

            // Simulação de diferentes cenários baseados no CEP
            const ultimoDigito = parseInt(cep[cep.length - 1]);

            // Para teste: apenas CEPs terminados em 0 serão inválidos
            if (isNaN(ultimoDigito) || ultimoDigito === 0) {
                console.log('CEP inválido detectado');
                freteError.style.display = 'block';
                calcularFreteBtn.disabled = false;
                return;
            }

            // Opções de frete simuladas
            const opcoes = [];
            const subtotal = calcularSubtotal();

            console.log('Subtotal para cálculo de frete:', subtotal);

            // Frete Econômico - SEMPRE disponível
            const freteEconomico = subtotal > 200 ? 0 : 15.90;
            opcoes.push({
                id: 'economico',
                nome: '🟢 Econômico',
                prazo: '7 a 12 dias úteis',
                preco: freteEconomico,
                gratis: subtotal > 200
            });

            // Frete Normal - SEMPRE disponível
            const freteNormal = subtotal > 150 ? 0 : 12.90;
            opcoes.push({
                id: 'normal',
                nome: '🔵 Normal',
                prazo: '5 a 8 dias úteis',
                preco: freteNormal,
                gratis: subtotal > 150
            });

            // Frete Expresso - SEMPRE disponível
            const freteExpresso = subtotal > 300 ? 0 : 24.90;
            opcoes.push({
                id: 'expresso',
                nome: '🚀 Expresso',
                prazo: '2 a 3 dias úteis',
                preco: freteExpresso,
                gratis: subtotal > 300
            });

            // Frete Rápido - disponível para CEPs pares
            if (ultimoDigito % 2 === 0) {
                opcoes.push({
                    id: 'rapido',
                    nome: '⚡ Rápido',
                    prazo: '1 dia útil',
                    preco: 34.90,
                    gratis: false
                });
            }

            console.log('Opções de frete geradas:', opcoes);

            if (opcoes.length === 0) {
                freteError.style.display = 'block';
                freteError.innerHTML = '<p>Nenhuma opção de frete disponível para este CEP.</p>';
                calcularFreteBtn.disabled = false;
                return;
            }

            exibirOpcoesFrete(opcoes);
        }

        function exibirOpcoesFrete(opcoes) {
            console.log('Exibindo opções de frete:', opcoes);

            opcoesFrete.innerHTML = '';

            opcoes.forEach((opcao, index) => {
                const opcaoElement = document.createElement('div');
                opcaoElement.className = `opcao-frete ${opcao.gratis ? 'gratis' : ''}`;

                const precoTexto = opcao.gratis ?
                    '<span class="frete-gratis">GRÁTIS</span>' :
                    `R$ ${opcao.preco.toFixed(2).replace('.', ',')}`;

                const destaque = opcao.gratis ? '<span class="frete-destaque">ECONÔMICO</span>' : '';

                opcaoElement.innerHTML = `
            <div class="info-frete">
                <span class="nome-frete">${opcao.nome} ${destaque}</span>
                <span class="prazo-frete">Entrega: ${opcao.prazo}</span>
            </div>
            <div class="preco-frete">${precoTexto}</div>
        `;

                opcaoElement.addEventListener('click', () => selecionarFrete(opcao, opcaoElement));

                // Selecionar automaticamente a primeira opção
                if (index === 0) {
                    selecionarFrete(opcao, opcaoElement);
                }

                opcoesFrete.appendChild(opcaoElement);
            });

            freteResultado.style.display = 'block';
            calcularFreteBtn.disabled = false;

            // Adicionar informações do CEP
            const cepInfo = document.createElement('div');
            cepInfo.className = 'cep-info';
            cepInfo.innerHTML = `
        <span class="cep-texto">📍 Entregando para CEP: ${formatarCEP(cepAtual)}</span>
        <button class="alterar-cep" id="alterarCepBtn">Alterar CEP</button>
    `;
            freteResultado.appendChild(cepInfo);

            // Adicionar evento ao botão alterar CEP
            document.getElementById('alterarCepBtn').addEventListener('click', alterarCEP);

            console.log('Opções de frete exibidas com sucesso');
        }

        function selecionarFrete(opcao, elemento) {
            console.log('Frete selecionado:', opcao);

            // Remover seleção anterior
            document.querySelectorAll('.opcao-frete').forEach(op => {
                op.classList.remove('selecionada');
            });

            // Adicionar seleção atual
            elemento.classList.add('selecionada');

            // Salvar frete selecionado
            freteSelecionado = opcao;

            // Atualizar resumo
            atualizarResumoFrete();
        }

        function atualizarResumoFrete() {
            if (freteSelecionado) {
                const valorFrete = freteSelecionado.gratis ? 0 : freteSelecionado.preco;
                freteElement.textContent = `R$ ${valorFrete.toFixed(2).replace('.', ',')}`;

                // Mostrar informações do frete selecionado
                infoFreteSelecionado.style.display = 'block';
                const textoGratis = freteSelecionado.gratis ? ' - 🎉 FRETE GRÁTIS' : '';
                infoFreteSelecionado.innerHTML = `
            <p><strong>📦 Frete selecionado:</strong> ${freteSelecionado.nome.replace(/[🔵🟢🚀⚡]/g, '').trim()}${textoGratis}</p>
            <p><strong>⏱️ Prazo:</strong> ${freteSelecionado.prazo}</p>
            <p><strong>📍 CEP:</strong> ${formatarCEP(cepAtual)}</p>
        `;
            }

            // Recalcular total
            calcularTotal();
        }

        function alterarCEP() {
            console.log('Alterando CEP...');
            freteResultado.style.display = 'none';
            freteSelecionado = null;
            cepInput.value = '';
            cepInput.focus();
            infoFreteSelecionado.style.display = 'none';
            freteError.style.display = 'none';

            // Resetar frete no resumo
            freteElement.textContent = 'R$ 0,00';
            calcularTotal();
            calcularFreteBtn.disabled = true;
        }

        function formatarCEP(cep) {
            return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        function calcularSubtotal() {
            let subtotal = 0;
            carrinho.forEach(item => {
                let precoNumero = parseFloat(
                    item.preco.replace("R$", "").replace(".", "").replace(",", ".")
                );
                const quantidade = item.quantidade || 1;
                subtotal += isNaN(precoNumero) ? 0 : precoNumero * quantidade;
            });
            return subtotal;
        }

        // Atualizar a função calcularTotal para incluir o frete
        function calcularTotal() {
            const subtotal = calcularSubtotal();
            const frete = freteSelecionado ? (freteSelecionado.gratis ? 0 : freteSelecionado.preco) : 0;
            const total = subtotal + frete;

            subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
            freteElement.textContent = `R$ ${frete.toFixed(2).replace(".", ",")}`;
            totalElement.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

            // Salvar total para uso nos modais
            localStorage.setItem('totalCompra', total.toFixed(2));
        }

        function renderCarrinho() {
            carrinhoContainer.innerHTML = "";

            if (carrinho.length === 0) {
                carrinhoVazio.style.display = 'block';
                carrinhoComItens.style.display = 'none';
                return;
            }

            carrinhoVazio.style.display = 'none';
            carrinhoComItens.style.display = 'block';

            // Usar a nova função calcularTotal
            calcularTotal();

            carrinho.forEach((item, index) => {
                const div = document.createElement("div");
                div.classList.add("item");
                div.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="detalhes">
            <h2>${item.nome}</h2>
            <p>${item.descricao}</p>
            <div class="quantidade-controle">
            <button class="btn-quantidade" onclick="alterarQuantidade(${index}, -1)">-</button>
            <span class="quantidade">${item.quantidade || 1}</span>
            <button class="btn-quantidade" onclick="alterarQuantidade(${index}, 1)">+</button>
            </div>
        </div>
        <div class="preco-container">
            <span class="preco">${item.preco}</span>
            <button class="remover" data-index="${index}">Remover</button>
        </div>
        `;
                carrinhoContainer.appendChild(div);

                document.querySelectorAll(".remover").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const i = e.target.getAttribute("data-index");
                        carrinho.splice(i, 1);
                        localStorage.setItem("carrinho", JSON.stringify(carrinho));
                        renderCarrinho();
                        verificarFormasPagamento();
                    });
                });
            });

            verificarFormasPagamento();
        }

        function alterarQuantidade(index, change) {
            if (!carrinho[index].quantidade) {
                carrinho[index].quantidade = 1;
            }

            carrinho[index].quantidade += change;

            if (carrinho[index].quantidade <= 0) {
                carrinho.splice(index, 1);
            }

            localStorage.setItem("carrinho", JSON.stringify(carrinho));
            renderCarrinho();
        }

        // FUNÇÃO PARA VERIFICAR SE PODE FINALIZAR COMPRA
        function verificarCompra() {
            // Verificar se carrinho está vazio
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
                return false;
            }

            // Verificar se tem conta criada
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (!usuarioLogado) {
                alert("⚠️ Você precisa criar uma conta para finalizar a compra!\n\nRedirecionando para a página de cadastro...");
                window.location.href = 'perfil.html?fromCarrinho=true';
                return false;
            }

            // Verificar se tem forma de pagamento cadastrada
            const formasDisponiveis = verificarFormasPagamentoDisponiveis(usuarioLogado);
            if (formasDisponiveis.length === 0) {
                alert("⚠️ Você precisa cadastrar pelo menos uma forma de pagamento para finalizar a compra!\n\nRedirecionando para a página de perfil...");
                window.location.href = 'perfil.html?fromCarrinho=true';
                return false;
            }

            // Verificar se o frete foi calculado
            if (!freteSelecionado) {
                alert('⚠️ Por favor, calcule o frete antes de finalizar a compra.');
                if (cepInput) cepInput.focus();
                return false;
            }

            return true;
        }

        // Verificar formas de pagamento disponíveis
        function verificarFormasPagamento() {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            const formasDisponiveis = verificarFormasPagamentoDisponiveis(usuarioLogado);

            if (!usuarioLogado || formasDisponiveis.length === 0) {
                infoPagamento.innerHTML = '<p>Nenhuma forma de pagamento cadastrada</p>';
                finalizarBtn.disabled = true;
                return;
            }

            const formasTexto = formasDisponiveis.map(forma => forma.nome).join(', ');

            infoPagamento.innerHTML = `
        <p><strong>Formas cadastradas:</strong> ${formasTexto}</p>
        <p>✔️ Você poderá escolher a forma de pagamento ao finalizar</p>
    `;
            finalizarBtn.disabled = false;
        }

        // Verificar formas de pagamento disponíveis no perfil do usuário
        function verificarFormasPagamentoDisponiveis(usuarioLogado) {
            const formasDisponiveis = [];

            if (usuarioLogado && usuarioLogado.pagamentos) {
                usuarioLogado.pagamentos.forEach(pagamento => {
                    if (pagamento.type === 'Cartão de Crédito') {
                        formasDisponiveis.push({
                            tipo: 'Cartão de Crédito',
                            nome: '💳 Cartão de Crédito',
                            descricao: pagamento.number ? `Cartão terminado em ${pagamento.number.slice(-4)}` : 'Cartão cadastrado',
                            icone: '💳'
                        });
                    } else if (pagamento.type === 'Pix') {
                        formasDisponiveis.push({
                            tipo: 'Pix',
                            nome: '🏦 PIX',
                            descricao: 'Pagamento instantâneo',
                            icone: '🏦'
                        });
                    } else if (pagamento.type === 'Boleto') {
                        formasDisponiveis.push({
                            tipo: 'Boleto',
                            nome: '📄 Boleto',
                            descricao: 'Pagamento em até 3 dias',
                            icone: '📄'
                        });
                    }
                });
            }

            // Remover duplicatas
            return formasDisponiveis.filter((pagamento, index, self) =>
                index === self.findIndex(p => p.tipo === pagamento.tipo)
            );
        }

        // FUNÇÃO PARA FINALIZAR COMPRA
        function finalizarCompra() {
            if (!verificarCompra()) {
                return; // Não pode finalizar - já redirecionou para perfil
            }

            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

            // Verificar quais formas de pagamento o usuário tem cadastradas
            const formasPagamentoDisponiveis = verificarFormasPagamentoDisponiveis(usuarioLogado);

            if (formasPagamentoDisponiveis.length === 0) {
                alert("⚠️ Você precisa cadastrar pelo menos uma forma de pagamento no seu perfil!");
                window.location.href = 'perfil.html?fromCarrinho=true';
                return;
            }

            // Se tiver apenas uma forma de pagamento, usar diretamente
            if (formasPagamentoDisponiveis.length === 1) {
                const formaPagamento = formasPagamentoDisponiveis[0].tipo;
                const total = localStorage.getItem('totalCompra');
                processarPagamento(formaPagamento, total);
            } else {
                // Se tiver múltiplas, mostrar modal de seleção
                mostrarSelecaoPagamento(formasPagamentoDisponiveis);
            }
        }

        // Mostrar modal de seleção de pagamento
        function mostrarSelecaoPagamento(formasPagamento) {
            // Criar modal se não existir
            if (!document.getElementById('modalSelecaoPagamento')) {
                criarModalSelecaoPagamento();
            }

            const modalSelecao = document.getElementById('modalSelecaoPagamento');
            const listaPagamentos = document.getElementById('listaPagamentos');

            listaPagamentos.innerHTML = '';

            formasPagamento.forEach((forma, index) => {
                const itemPagamento = document.createElement('div');
                itemPagamento.className = 'item-pagamento';
                itemPagamento.innerHTML = `
            <div class="info-pagamento-item">
                <span class="icone-pagamento">${forma.icone}</span>
                <div class="detalhes-pagamento">
                    <strong>${forma.nome}</strong>
                    <span>${forma.descricao}</span>
                </div>
            </div>
            <div class="selecionar-pagamento">
                <input type="radio" name="formaPagamento" id="pagamento${index}" value="${forma.tipo}">
                <label for="pagamento${index}">Selecionar</label>
            </div>
        `;

                // Adicionar evento de clique no item inteiro
                itemPagamento.addEventListener('click', (e) => {
                    // Não disparar se clicar no radio button diretamente
                    if (e.target.type !== 'radio') {
                        const radio = itemPagamento.querySelector('input[type="radio"]');
                        radio.checked = true;

                        // Atualizar seleção visual
                        document.querySelectorAll('.item-pagamento').forEach(item => {
                            item.classList.remove('selecionado');
                        });
                        itemPagamento.classList.add('selecionado');

                        // Habilitar botão continuar
                        document.getElementById('continuarPagamento').disabled = false;
                    }
                });

                // Adicionar evento quando o radio for clicado diretamente
                const radio = itemPagamento.querySelector('input[type="radio"]');
                radio.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.item-pagamento').forEach(item => {
                        item.classList.remove('selecionado');
                    });
                    itemPagamento.classList.add('selecionado');
                    document.getElementById('continuarPagamento').disabled = false;
                });

                listaPagamentos.appendChild(itemPagamento);
            });

            // Resetar botão continuar
            document.getElementById('continuarPagamento').disabled = true;

            // Mostrar modal
            modalSelecao.style.display = 'flex';
        }

        // Criar modal de seleção de pagamento dinamicamente
        function criarModalSelecaoPagamento() {
            const modalHTML = `
        <div id="modalSelecaoPagamento" class="modal-pagamento">
            <div class="modal-conteudo">
                <button class="modal-fechar" id="fecharSelecaoPagamento">&times;</button>
                <h2>Escolha a Forma de Pagamento</h2>
                <p>Selecione como deseja pagar sua compra:</p>
                
                <div id="listaPagamentos" class="lista-pagamentos">
                    <!-- Itens de pagamento serão inseridos aqui -->
                </div>
                
                <div class="modal-acoes">
                    <button class="btn-cancelar" id="cancelarSelecaoPagamento">Cancelar</button>
                    <button class="btn-continuar" id="continuarPagamento" disabled>Continuar com Pagamento</button>
                </div>
            </div>
        </div>
    `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Configurar eventos do modal
            const modalSelecao = document.getElementById('modalSelecaoPagamento');
            const fecharSelecao = document.getElementById('fecharSelecaoPagamento');
            const cancelarSelecao = document.getElementById('cancelarSelecaoPagamento');
            const continuarPagamento = document.getElementById('continuarPagamento');

            // Fechar modal
            fecharSelecao.addEventListener('click', () => modalSelecao.style.display = 'none');
            cancelarSelecao.addEventListener('click', () => modalSelecao.style.display = 'none');

            // Fechar ao clicar fora
            modalSelecao.addEventListener('click', (e) => {
                if (e.target === modalSelecao) {
                    modalSelecao.style.display = 'none';
                }
            });

            // Continuar com o pagamento selecionado
            continuarPagamento.addEventListener('click', function () {
                const formaSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
                if (formaSelecionada) {
                    const total = localStorage.getItem('totalCompra');
                    processarPagamento(formaSelecionada.value, total);
                    modalSelecao.style.display = 'none';
                }
            });
        }

        // Processar pagamento baseado na forma selecionada
        function processarPagamento(formaPagamento, total) {
            console.log('Processando pagamento:', formaPagamento);

            if (formaPagamento === 'Pix') {
                gerarPix(total);
            } else if (formaPagamento === 'Boleto') {
                gerarBoleto(total);
            } else if (formaPagamento === 'Cartão de Crédito') {
                processarCartaoCredito(total);
            }
        }

        // Gerar PIX
        function gerarPix(total) {
            const valorPix = document.getElementById('valorPix');
            valorPix.textContent = `R$ ${total.replace(".", ",")}`;

            // Gerar QR Code (simulação)
            const qrcodeContainer = document.getElementById('qrcodePix');
            qrcodeContainer.innerHTML = '';

            // Em uma implementação real, aqui viria o QR code real da API do PIX
            const qrText = `PIX: cultivar@pagamento.com.br | Valor: R$ ${total}`;
            new QRCode(qrcodeContainer, {
                text: qrText,
                width: 200,
                height: 200
            });

            modalPix.style.display = 'flex';
        }

        // Gerar Boleto
        function gerarBoleto(total) {
            const valorBoleto = document.getElementById('valorBoleto');
            const vencimentoBoleto = document.getElementById('vencimentoBoleto');

            valorBoleto.textContent = `R$ ${total.replace(".", ",")}`;

            // Data de vencimento: 3 dias a partir de hoje
            const vencimento = new Date();
            vencimento.setDate(vencimento.getDate() + 3);
            vencimentoBoleto.textContent = vencimento.toLocaleDateString('pt-BR');

            modalBoleto.style.display = 'flex';
        }

        // Processar cartão de crédito (simulação)
        function processarCartaoCredito(total) {
            // Simular processamento
            finalizarBtn.disabled = true;
            finalizarBtn.textContent = 'Processando...';

            setTimeout(() => {
                finalizarPedido('Cartão de Crédito');
            }, 2000);
        }

        // Finalizar pedido
        function finalizarPedido(metodoPagamento) {
            // Gerar número do pedido
            const numeroPedido = '#' + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Preparar dados do pedido CORRETAMENTE
            const pedido = {
                id: numeroPedido,
                data: new Date().toISOString(),
                dataFormatada: new Date().toLocaleDateString('pt-BR'),
                itens: JSON.parse(JSON.stringify(carrinho)), // Deep copy dos itens
                subtotal: calcularSubtotal(),
                frete: freteSelecionado ? (freteSelecionado.gratis ? 0 : freteSelecionado.preco) : 0,
                total: parseFloat(localStorage.getItem('totalCompra')),
                metodoPagamento: metodoPagamento,
                status: 'Confirmado',
                freteInfo: freteSelecionado ? { ...freteSelecionado } : null, // Copia do frete
                cep: cepAtual
            };

            console.log('Salvando pedido:', pedido);

            // Salvar no histórico do usuário
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (usuarioLogado) {
                // Atualizar usuário no localStorage
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

                if (usuarioIndex !== -1) {
                    // Garantir que pedidos existe como array
                    if (!usuarios[usuarioIndex].pedidos || !Array.isArray(usuarios[usuarioIndex].pedidos)) {
                        usuarios[usuarioIndex].pedidos = [];
                    }

                    // Adicionar pedido no início do array
                    usuarios[usuarioIndex].pedidos.unshift(pedido);
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));

                    // Atualizar usuário logado
                    usuarioLogado.pedidos = usuarios[usuarioIndex].pedidos;
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

                    console.log('Pedido salvo no usuário:', usuarioLogado.email);
                    console.log('Total de pedidos:', usuarioLogado.pedidos.length);
                }
            }

            // Salvar pedido no localStorage global (para backup)
            const todosPedidos = JSON.parse(localStorage.getItem('todosPedidos') || '[]');
            pedido.usuarioEmail = usuarioLogado ? usuarioLogado.email : 'Anônimo';
            todosPedidos.unshift(pedido);
            localStorage.setItem('todosPedidos', JSON.stringify(todosPedidos));

            // Limpar carrinho
            localStorage.removeItem('carrinho');
            carrinho = [];

            // Mostrar confirmação
            document.getElementById('numeroPedido').textContent = numeroPedido;
            modalConfirmacao.style.display = 'flex';

            // Fechar outros modais
            modalPix.style.display = 'none';
            modalBoleto.style.display = 'none';

            // Resetar botão
            finalizarBtn.disabled = false;
            finalizarBtn.textContent = 'Finalizar Compra';
        }
        // Configurar eventos dos modais
        function configurarEventosModais() {
            // Fechar modais
            fecharPix.addEventListener('click', () => modalPix.style.display = 'none');
            fecharBoleto.addEventListener('click', () => modalBoleto.style.display = 'none');

            // Copiar chave PIX
            copiarChavePix.addEventListener('click', () => {
                navigator.clipboard.writeText('cultivar@pagamento.com.br')
                    .then(() => alert('Chave PIX copiada!'))
                    .catch(() => alert('Erro ao copiar chave PIX'));
            });

            // Copiar código de barras
            copiarCodigoBarras.addEventListener('click', () => {
                const codigo = '34191790010104351004791020150008588410000015000';
                navigator.clipboard.writeText(codigo)
                    .then(() => alert('Código de barras copiado!'))
                    .catch(() => alert('Erro ao copiar código'));
            });

            // Imprimir boleto
            imprimirBoleto.addEventListener('click', () => {
                window.print();
            });

            // Pagamentos concluídos
            pixConcluido.addEventListener('click', () => {
                finalizarPedido('PIX');
            });

            boletoConcluido.addEventListener('click', () => {
                finalizarPedido('Boleto');
            });

            // Voltar ao início
            voltarInicio.addEventListener('click', () => {
                window.location.href = 'index.html';
            });

            // Fechar modais clicando fora
            window.addEventListener('click', (e) => {
                if (e.target === modalPix) modalPix.style.display = 'none';
                if (e.target === modalBoleto) modalBoleto.style.display = 'none';
                if (e.target === modalConfirmacao) modalConfirmacao.style.display = 'none';
            });
        }

        // EVENT LISTENER PARA O BOTÃO FINALIZAR COMPRA
        finalizarBtn.addEventListener("click", finalizarCompra);

        // Renderizar carrinho ao carregar a página
        renderCarrinho();
        configurarEventosModais();

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

        // Verificar status ao carregar a página (para feedback visual)
        window.onload = function () {
            const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
            const formasPagamento = usuarioLogado ? verificarFormasPagamentoDisponiveis(usuarioLogado) : [];

            if (usuarioLogado && formasPagamento.length > 0) {
                console.log("✅ Usuário pronto para comprar: conta e pagamento cadastrados");
            } else if (usuarioLogado && formasPagamento.length === 0) {
                console.log("⚠️ Usuário tem conta mas precisa cadastrar pagamento");
            } else {
                console.log("❌ Usuário precisa criar conta e cadastrar pagamento");
            }
        };