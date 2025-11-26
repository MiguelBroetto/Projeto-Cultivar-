// ============================================
// PÁGINA INICIAL - CATÁLOGO DE PRODUTOS
// ============================================

// Elementos do DOM
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const listaProdutos = document.getElementById('listaProdutos');
const mensagemVazia = document.getElementById('mensagemVazia');
const catalogoRelacionado = document.getElementById('catalogoRelacionado');

// ============================================
// FILTROS DE PRODUTOS
// ============================================

/**
 * Filtra os produtos baseado na categoria e preço selecionados
 */
function filtrarProdutos() {
    const categoria = document.getElementById("categoriaFiltro").value;
    const preco = document.getElementById("precoFiltro").value;
    const produtos = document.querySelectorAll(".produto");
    let produtosVisiveis = 0;

    produtos.forEach(produto => {
        const catProduto = produto.dataset.categoria;
        const precoProduto = Number(produto.dataset.preco);
        let exibir = true;

        // Filtro por categoria
        if (categoria && catProduto !== categoria) {
            exibir = false;
        }

        // Filtro por faixa de preço
        if (preco && !verificarFaixaPreco(precoProduto, preco)) {
            exibir = false;
        }

        produto.style.display = exibir ? "block" : "none";
        if (exibir) produtosVisiveis++;
    });

    // Atualiza interface baseado nos resultados
    atualizarInterfaceFiltros(produtosVisiveis, categoria);
}

/**
 * Verifica se o preço está dentro da faixa selecionada
 * @param {number} precoProduto - Preço do produto
 * @param {string} faixaPreco - Faixa de preço selecionada
 * @returns {boolean} True se está na faixa
 */
function verificarFaixaPreco(precoProduto, faixaPreco) {
    const faixas = {
        "1": { min: 2, max: 100 },
        "2": { min: 101, max: 500 },
        "3": { min: 501, max: 1000 },
        "4": { min: 1001, max: 10000 },
        "5": { min: 10001, max: 100000 },
        "6": { min: 100001, max: 500000 },
        "7": { min: 500001, max: 1000000 },
        "8": { min: 1000001, max: 5000000 },
        "9": { min: 5000001, max: Infinity }
    };

    const faixa = faixas[faixaPreco];
    return precoProduto >= faixa.min && precoProduto <= faixa.max;
}

/**
 * Atualiza a interface após aplicar filtros
 * @param {number} produtosVisiveis - Número de produtos visíveis
 * @param {string} categoria - Categoria filtrada
 */
function atualizarInterfaceFiltros(produtosVisiveis, categoria) {
    if (produtosVisiveis === 0) {
        mensagemVazia.textContent = "Nenhum produto cadastrado com essas condições.";
        mensagemVazia.style.display = "block";
        catalogoRelacionado.style.display = "none";
    } else {
        mensagemVazia.style.display = "none";
        
        // Mostra produtos relacionados se filtrou por categoria
        if (categoria) {
            mostrarProdutosRelacionados(categoria);
        } else {
            catalogoRelacionado.style.display = "none";
        }
    }
}

/**
 * Limpa todos os filtros aplicados
 */
function limparFiltros() {
    document.getElementById("categoriaFiltro").value = "";
    document.getElementById("precoFiltro").value = "";
    
    // Mostra todos os produtos
    const produtos = document.querySelectorAll(".produto");
    produtos.forEach(produto => produto.style.display = "block");
    
    // Atualiza interface
    mensagemVazia.style.display = "none";
    catalogoRelacionado.style.display = "none";
}

// ============================================
// GESTÃO DE PRODUTOS CADASTRADOS
// ============================================

/**
 * Carrega produtos cadastrados dinamicamente no catálogo
 */
function carregarProdutosCadastrados() {
    const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
    console.log("Produtos cadastrados encontrados:", produtosCadastrados.length);

    if (produtosCadastrados.length === 0) return;

    produtosCadastrados.forEach((produto, index) => {
        criarProdutoCadastrado(produto, index);
    });
}

/**
 * Cria um elemento de produto cadastrado no catálogo
 * @param {Object} produto - Dados do produto
 * @param {number} index - Índice do produto
 */
function criarProdutoCadastrado(produto, index) {
    const divProduto = document.createElement('div');
    divProduto.className = 'produto';
    divProduto.setAttribute('data-categoria', produto.categoria);
    divProduto.setAttribute('data-preco', produto.preco);

    // ID único para evitar conflitos
    const offsetId = 1000 + index;

    // Descrição curta para o card
    const descricaoCurta = produto.descricao.split(' ').slice(0, 10).join(' ') + '...';

    divProduto.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='./imagens/placeholder.jpg'">
        <h2>${produto.nome}</h2>
        <p class="descricao">${descricaoCurta}</p>
        <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
        <button class="btn${offsetId}-descricao">Descrição</button>
        <button class="btn-comprar">Adicionar ao Carrinho</button>
    `;

    listaProdutos.appendChild(divProduto);

    // Configura eventos do produto cadastrado
    configurarEventosProdutoCadastrado(divProduto, produto, offsetId);
}

/**
 * Configura eventos para um produto cadastrado
 * @param {HTMLElement} elementoProduto - Elemento do produto
 * @param {Object} produto - Dados do produto
 * @param {number} offsetId - ID único do produto
 */
function configurarEventosProdutoCadastrado(elementoProduto, produto, offsetId) {
    const btnDescricao = elementoProduto.querySelector(`.btn${offsetId}-descricao`);
    const btnCarrinho = elementoProduto.querySelector('.btn-comprar');

    // Evento para ver descrição
    if (btnDescricao) {
        btnDescricao.addEventListener('click', () => {
            redirecionarParaDetalhes(produto, offsetId);
        });
    }

    // Evento para adicionar ao carrinho
    if (btnCarrinho) {
        btnCarrinho.addEventListener('click', () => {
            adicionarAoCarrinho(produto, btnCarrinho);
        });
    }
}

/**
 * Atualiza a lista de produtos cadastrados
 */
function atualizarListaProdutos() {
    // Remove produtos cadastrados antigos
    document.querySelectorAll('.produto').forEach(produto => {
        if (produto.querySelector('button[class*="btn"][class*="descricao"]')) {
            const btnClass = produto.querySelector('button[class*="btn"][class*="descricao"]').className;
            if (btnClass && btnClass.includes('btn') && parseInt(btnClass.match(/btn(\d+)-descricao/)?.[1]) >= 1000) {
                produto.remove();
            }
        }
    });

    // Recarrega os produtos
    carregarProdutosCadastrados();
}

// ============================================
// EVENTOS DOS PRODUTOS FIXOS
// ============================================

/**
 * Configura eventos para todos os produtos fixos da página
 */
function configurarEventosProdutosFixos() {
    document.querySelectorAll(".produto").forEach((produto, index) => {
        const btnDescricao = produto.querySelector("button[class*='-descricao']");
        const btnCarrinho = produto.querySelector(".btn-comprar");

        // Evento de descrição
        if (btnDescricao && !btnDescricao.className.includes('btn1')) {
            btnDescricao.addEventListener("click", () => {
                const dadosProduto = extrairDadosProduto(produto, index + 1);
                redirecionarParaDetalhes(dadosProduto, index + 1);
            });
        }

        // Evento do carrinho
        if (btnCarrinho) {
            btnCarrinho.addEventListener("click", () => {
                const dadosProduto = extrairDadosProduto(produto, index + 1);
                adicionarAoCarrinho(dadosProduto, btnCarrinho);
            });
        }
    });
}

/**
 * Extrai dados do produto do elemento HTML
 * @param {HTMLElement} produto - Elemento do produto
 * @param {number} id - ID do produto
 * @returns {Object} Dados do produto
 */
function extrairDadosProduto(produto, id) {
    return {
        id: id,
        nome: produto.querySelector("h2") ? produto.querySelector("h2").innerText : ("Produto " + id),
        preco: produto.querySelector(".preco") ? produto.querySelector(".preco").innerText : "",
        descricao: produto.querySelector(".descricao") ? produto.querySelector(".descricao").innerText : "",
        imagem: produto.querySelector("img") ? produto.querySelector("img").getAttribute("src") : ""
    };
}

// ============================================
// FUNÇÕES DE REDIRECIONAMENTO
// ============================================

/**
 * Redireciona para a página de detalhes do produto
 * @param {Object} produto - Dados do produto
 * @param {number} id - ID do produto
 */
function redirecionarParaDetalhes(produto, id) {
    const produtoComId = { ...produto, id: id };
    
    // Salva para compatibilidade com diferentes páginas
    localStorage.setItem("produtoDescricao", JSON.stringify(produtoComId));
    localStorage.setItem("produtoSelecionado", JSON.stringify(produtoComId));

    console.log("Redirecionando para detalhes do produto:", produto.nome);
    window.location.href = "Produto.html";
}

/**
 * Adiciona produto ao carrinho
 * @param {Object} produto - Dados do produto
 * @param {HTMLElement} botao - Elemento do botão para feedback
 */
function adicionarAoCarrinho(produto, botao) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    
    // Adiciona produto ao carrinho
    carrinho.push({
        nome: produto.nome,
        preco: produto.preco,
        descricao: produto.descricao,
        imagem: produto.imagem
    });
    
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    // Feedback visual
    botao.innerText = "Adicionado!";
    botao.disabled = true;
    setTimeout(() => {
        botao.innerText = "Adicionar ao Carrinho";
        botao.disabled = false;
    }, 1500);

    console.log("Produto adicionado ao carrinho:", produto.nome);
}

// ============================================
// OBSERVADORES E ATUALIZAÇÕES
// ============================================

/**
 * Observa mudanças no localStorage para atualizar automaticamente
 */
function configurarObservadores() {
    // Observa mudanças no localStorage (entre abas)
    window.addEventListener('storage', function (e) {
        if (e.key === 'produtosCadastrados') {
            console.log("Produtos cadastrados atualizados, recarregando...");
            atualizarListaProdutos();
        }
    });

    // Atualiza quando a página ganha foco (útil ao voltar do admin)
    window.addEventListener('focus', function () {
        console.log("Página em foco, verificando atualizações...");
        atualizarListaProdutos();
    });
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
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa todas as funcionalidades da página inicial
 */
function inicializarIndex() {
    console.log("Inicializando página inicial...");
    
    // Configura eventos
    configurarMenuDropdown();
    configurarEventosProdutosFixos();
    configurarObservadores();
    
    // Carrega produtos cadastrados
    carregarProdutosCadastrados();
    
    console.log("Página inicial inicializada com sucesso");
}

// Inicia quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarIndex);

// ============================================
// EXPORTAÇÕES PARA USO GLOBAL
// ============================================

// Torna as funções disponíveis globalmente para os eventos onclick no HTML
window.filtrarProdutos = filtrarProdutos;
window.limparFiltros = limparFiltros;