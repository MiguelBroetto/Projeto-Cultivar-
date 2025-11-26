// ============================================
// HISTÓRICO DE COMPRAS
// ============================================

// Elementos do DOM
const listaHistorico = document.getElementById("listaHistorico");
const mensagemVazio = document.getElementById("vazio");
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Estado do histórico
let historicoCompras = JSON.parse(localStorage.getItem("historicoCompras")) || [];

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Carrega e exibe o histórico de compras
 * Ordena por data (mais recente primeiro)
 */
function carregarHistorico() {
    console.log("Carregando histórico de compras...");

    // Limpa a lista antes de recarregar
    listaHistorico.innerHTML = '';

    // Verifica se há compras no histórico
    if (historicoCompras.length === 0) {
        mostrarMensagemVazio();
        return;
    }

    // Oculta mensagem de vazio
    mensagemVazio.style.display = "none";

    // Ordena por data (mais recente primeiro)
    const historicoOrdenado = ordenarHistoricoPorData();

    // Renderiza cada compra
    historicoOrdenado.forEach((compra, index) => {
        const cardCompra = criarCardCompra(compra, index);
        listaHistorico.appendChild(cardCompra);
    });

    console.log(`Histórico carregado: ${historicoCompras.length} compras`);
}

/**
 * Ordena o histórico por data (mais recente primeiro)
 * @returns {Array} Histórico ordenado
 */
function ordenarHistoricoPorData() {
    return historicoCompras.sort((a, b) => {
        const dataA = new Date(a.data || a.timestamp || Date.now());
        const dataB = new Date(b.data || b.timestamp || Date.now());
        return dataB - dataA; // Mais recente primeiro
    });
}

/**
 * Cria um card para exibir uma compra no histórico
 * @param {Object} compra - Dados da compra
 * @param {number} index - Índice da compra no array
 * @returns {HTMLElement} Elemento do card da compra
 */
function criarCardCompra(compra, index) {
    const card = document.createElement("div");
    card.classList.add("item");
    card.setAttribute('data-index', index);

    // Formata a data da compra
    const dataFormatada = formatarDataCompra(compra.data || compra.timestamp);

    // Verifica se é uma compra antiga (formato simples) ou nova (formato completo)
    if (compra.itens && Array.isArray(compra.itens)) {
        // Compra nova (com múltiplos itens e dados completos)
        card.innerHTML = criarHTMLCompraCompleta(compra, dataFormatada);
    } else {
        // Compra antiga (formato simples com um item)
        card.innerHTML = criarHTMLCompraSimples(compra, dataFormatada);
    }

    return card;
}

/**
 * Cria o HTML para uma compra completa (múltiplos itens)
 * @param {Object} compra - Dados completos da compra
 * @param {string} dataFormatada - Data formatada
 * @returns {string} HTML da compra
 */
function criarHTMLCompraCompleta(compra, dataFormatada) {
    const itensHTML = compra.itens.map(item => `
        <div class="item-compra">
            <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='./imagens/placeholder.jpg'">
            <div class="info-item">
                <h3>${item.nome}</h3>
                <span class="preco-item">${item.preco}</span>
            </div>
        </div>
    `).join('');

    return `
        <div class="cabecalho-compra">
            <h2>Compra #${compra.id || 'N/A'}</h2>
            <span class="data-compra">${dataFormatada}</span>
        </div>
        <div class="itens-compra">
            ${itensHTML}
        </div>
        <div class="resumo-compra">
            <div class="info-adicional">
                <span class="total">Total: R$ ${compra.total?.toFixed(2).replace('.', ',') || 'N/A'}</span>
                <span class="pagamento">Pagamento: ${compra.formaPagamento || 'Não informado'}</span>
            </div>
            <button class="btn-detalhes" onclick="verDetalhesCompra(${compra.id ? `'${compra.id}'` : 'null'})">
                Ver Detalhes
            </button>
        </div>
    `;
}

/**
 * Cria o HTML para uma compra simples (um item)
 * @param {Object} compra - Dados simples da compra
 * @param {string} dataFormatada - Data formatada
 * @returns {string} HTML da compra
 */
function criarHTMLCompraSimples(compra, dataFormatada) {
    return `
        <img src="${compra.imagem}" alt="${compra.nome}" onerror="this.src='./imagens/placeholder.jpg'">
        <div class="info-compra">
            <h2>${compra.nome}</h2>
            <p class="preco">${compra.preco}</p>
            <span class="data">${dataFormatada}</span>
        </div>
        <div class="acoes-compra">
            <button class="btn-comprar-novamente" onclick="comprarNovamente('${compra.nome}', '${compra.preco}', '${compra.imagem}')">
                Comprar Novamente
            </button>
        </div>
    `;
}

/**
 * Formata a data da compra para exibição
 * @param {string} dataString - Data em formato string
 * @returns {string} Data formatada
 */
function formatarDataCompra(dataString) {
    if (!dataString) return 'Data não disponível';

    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

/**
 * Exibe mensagem quando não há compras no histórico
 */
function mostrarMensagemVazio() {
    mensagemVazio.style.display = "block";
    mensagemVazio.innerHTML = `
        <div class="historico-vazio">
            <h3>Nenhuma compra encontrada</h3>
            <p>Você ainda não realizou nenhuma compra em nossa loja.</p>
            <a href="index.html" class="btn-comprar-agora">Fazer Minha Primeira Compra</a>
        </div>
    `;
}

// ============================================
// FUNÇÕES DE INTERAÇÃO
// ============================================

/**
 * Adiciona um item do histórico de volta ao carrinho
 * @param {string} nome - Nome do produto
 * @param {string} preco - Preço do produto
 * @param {string} imagem - URL da imagem
 */
function comprarNovamente(nome, preco, imagem) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    // Verifica se o item já está no carrinho
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        if (confirm(`"${nome}" já está no seu carrinho. Deseja adicionar outra unidade?`)) {
            carrinho.push({ nome, preco, imagem });
        }
    } else {
        carrinho.push({ nome, preco, imagem });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    // Feedback visual
    alert(`"${nome}" adicionado ao carrinho!`);

    // Opcional: Redirecionar para o carrinho
    // window.location.href = "carrinho.html";
}

/**
 * Exibe detalhes de uma compra específica
 * @param {string} compraId - ID da compra
 */
function verDetalhesCompra(compraId) {
    if (!compraId) {
        alert('Detalhes completos não disponíveis para esta compra.');
        return;
    }

    // Em um sistema real, buscaria detalhes completos
    alert(`Detalhes da compra #${compraId}\n\nEsta funcionalidade exibiria informações completas da compra.`);
}

/**
 * Limpa todo o histórico de compras
 */
function limparHistorico() {
    if (historicoCompras.length === 0) {
        alert('O histórico já está vazio.');
        return;
    }

    if (confirm('Tem certeza que deseja limpar todo o histórico de compras?\nEsta ação não pode ser desfeita.')) {
        historicoCompras = [];
        localStorage.setItem("historicoCompras", JSON.stringify(historicoCompras));
        carregarHistorico();
        alert('Histórico limpo com sucesso!');
    }
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
 * Inicializa todas as funcionalidades da página de histórico
 */
function inicializarHistorico() {
    // Configura eventos
    configurarMenuDropdown();

    // Carrega o histórico
    carregarHistorico();

    console.log("Página de histórico inicializada");
}

// Inicia quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarHistorico);

// ============================================
// EXPORTAÇÕES PARA USO GLOBAL
// ============================================

// Torna as funções disponíveis globalmente para os eventos onclick no HTML
window.comprarNovamente = comprarNovamente;
window.verDetalhesCompra = verDetalhesCompra;
window.limparHistorico = limparHistorico;