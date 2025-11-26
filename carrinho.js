// ============================================
// CARRINHO DE COMPRAS
// ============================================

// Elementos do DOM
const carrinhoContainer = document.getElementById("carrinho");
const finalizarBtn = document.getElementById("finalizarCompra");
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Estado do carrinho
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Renderiza o carrinho na tela
 * Calcula o total e atualiza a interface
 */
function renderCarrinho() {
    carrinhoContainer.innerHTML = "";
    let total = 0;

    // Se carrinho estiver vazio
    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML = `
            <div class="carrinho-vazio">
                <p>Seu carrinho está vazio</p>
                <a href="index.html" class="btn-continuar-comprando">Continuar Comprando</a>
            </div>
        `;
        document.querySelector(".resumo h3").innerText = `Total: R$ 0,00`;
        return;
    }

    // Renderiza cada item do carrinho
    carrinho.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='./imagens/placeholder.jpg'">
            <div class="detalhes">
                <h2>${item.nome}</h2>
                <p>${item.descricao || 'Produto de qualidade'}</p>
            </div>
            <span class="preco">${item.preco}</span>
            <button class="remover" data-index="${index}">Remover</button>
        `;
        carrinhoContainer.appendChild(div);

        // Calcula o total
        let precoNumero = parseFloat(
            item.preco.replace("R$", "").replace(/\./g, "").replace(",", ".")
        );
        total += isNaN(precoNumero) ? 0 : precoNumero;
    });

    // Atualiza o total
    document.querySelector(".resumo h3").innerText = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;

    // Adiciona eventos aos botões de remover
    configurarBotoesRemover();
}

/**
 * Configura os eventos dos botões de remover itens
 */
function configurarBotoesRemover() {
    document.querySelectorAll(".remover").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            removerItemCarrinho(parseInt(index));
        });
    });
}

/**
 * Remove um item do carrinho
 * @param {number} index - Índice do item a ser removido
 */
function removerItemCarrinho(index) {
    if (index >= 0 && index < carrinho.length) {
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        renderCarrinho();
    }
}

/**
 * Finaliza a compra do carrinho
 * Valida se há itens e forma de pagamento
 */
function finalizarCompra() {
    // Validação: Carrinho vazio
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
        return;
    }

    // Validação: Forma de pagamento
    const pagamento = localStorage.getItem("formaPagamento");
    if (!pagamento) {
        alert("Nenhuma forma de pagamento cadastrada. Vá até o perfil e cadastre uma forma de pagamento.");
        return;
    }

    // Calcula total final
    const total = calcularTotal();

    // Confirmação da compra
    if (confirm(`Confirmar compra?\nTotal: R$ ${total.toFixed(2).replace(".", ",")}\nForma de pagamento: ${pagamento}`)) {
        processarCompra(total, pagamento);
    }
}

/**
 * Calcula o total do carrinho
 * @returns {number} Total calculado
 */
function calcularTotal() {
    return carrinho.reduce((total, item) => {
        let precoNumero = parseFloat(
            item.preco.replace("R$", "").replace(/\./g, "").replace(",", ".")
        );
        return total + (isNaN(precoNumero) ? 0 : precoNumero);
    }, 0);
}

/**
 * Processa a compra finalizada
 * @param {number} total - Total da compra
 * @param {string} pagamento - Forma de pagamento
 */
function processarCompra(total, pagamento) {
    // Salva no histórico de compras
    let historico = JSON.parse(localStorage.getItem("historicoCompras")) || [];
    
    const compra = {
        data: new Date().toISOString(),
        itens: [...carrinho],
        total: total,
        formaPagamento: pagamento
    };
    
    historico.push(compra);
    localStorage.setItem("historicoCompras", JSON.stringify(historico));

    // Cria pedido (para o painel administrativo)
    criarPedido(compra);

    // Limpa o carrinho
    carrinho = [];
    localStorage.removeItem("carrinho");

    // Feedback para o usuário
    alert(`✅ Compra finalizada com sucesso!\nTotal: R$ ${total.toFixed(2).replace(".", ",")}\nForma de pagamento: ${pagamento}`);

    // Atualiza a interface
    renderCarrinho();
}

/**
 * Cria um pedido no sistema
 * @param {object} compra - Dados da compra
 */
function criarPedido(compra) {
    // Simula dados do cliente (em um sistema real viria do perfil)
    const cliente = {
        nome: localStorage.getItem("usuarioNome") || "Cliente",
        email: localStorage.getItem("usuarioEmail") || "cliente@email.com",
        telefone: localStorage.getItem("usuarioTelefone") || ""
    };

    const novoPedido = {
        id: 'PED' + Date.now(),
        data: compra.data,
        cliente: cliente,
        produtos: compra.itens,
        total: compra.total,
        status: 'pago',
        formaPagamento: compra.formaPagamento
    };

    // Salva o pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(novoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

// ============================================
// CONFIGURAÇÃO DO MENU DROPDOWN
// ============================================

/**
 * Configura o menu dropdown de configurações
 */
function configurarMenuDropdown() {
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
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa todas as funcionalidades do carrinho
 */
function inicializarCarrinho() {
    // Configura eventos
    finalizarBtn.addEventListener("click", finalizarCompra);
    configurarMenuDropdown();
    
    // Renderiza o carrinho inicial
    renderCarrinho();
    
    console.log("Carrinho inicializado com", carrinho.length, "itens");
}

// Inicia quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarCarrinho);