// Sistema de gerenciamento de produtos
class ProdutoManager {
    constructor() {
        this.produtosFixos = [
            {
                id: 1,
                nome: "Esterco de Curral Komatsu Garden",
                preco: 99.90,
                imagem: "./imagens/adubo.png",
                categoria: "adubos",
                descricao: "Adubo orgânico natural ideal para cultivo de jardins, vasos, hortas domésticas e plantas ornamentais.",
                descricaoCompleta: `
                    <strong>O Esterco de Curral Komatsu Garden</strong> é um adubo orgânico natural, ideal para
                    o cultivo de jardins, vasos, hortas domésticas e plantas ornamentais em geral. Produzido a partir de esterco curtido e
                    enriquecido com matéria orgânica, ele melhora a fertilidade do solo, aumenta a retenção de umidade e promove
                    um crescimento saudável das plantas.<br><br>

                    <h4>Características principais:</h4>
                    • 100% natural e orgânico<br>
                    • Melhora a estrutura e a umidade do solo<br>
                    • Estimula o crescimento e o florescimento<br>
                    • Indicado para vasos, canteiros e hortas<br>
                    • Peso líquido: 2 kg<br>
                    • Composição: terra vegetal e esterco curtido<br><br>

                    <strong>Modo de uso:</strong><br>
                    Misture o esterco ao solo antes do plantio (na proporção de 1 parte de adubo para 3 partes de terra) ou
                    aplique em cobertura, ao redor da planta, evitando o contato direto com o caule.
                `
            },
            {
                id: 2,
                nome: "Fipromix Inseticida",
                preco: 64.90,
                imagem: "./imagens/Inseticida.jpg",
                categoria: "defensivos",
                descricao: "Inseticida líquido de alta eficiência para eliminar baratas, formigas, moscas e cupins.",
                descricaoCompleta: `
                    <strong>O Fipromix</strong> é um inseticida líquido de alta eficiência indicado para eliminar baratas, formigas, moscas, cupins e outros
                    insetos rastejantes ou voadores. Ideal para uso em residências, comércios, indústrias e áreas externas, ele
                    proporciona uma ação rápida e duradoura, ajudando a manter o ambiente livre de pragas de forma prática e
                    segura.<br><br>

                    <h4>Características principais:</h4>
                    • Elimina baratas, formigas, moscas e cupins com eficiência<br>
                    • Efeito prolongado e ação imediata<br>
                    • Pode ser usado em áreas internas e externas<br>
                    • Alta concentração e rendimento<br>
                    • Fácil de aplicar e com baixo odor<br><br>

                    <strong>Modo de uso:</strong><br>
                    Dilua a dose recomendada de Fipromix em água, conforme as instruções da embalagem, e agite bem a mistura.
                    Aplique o produto com pulverizador manual ou costal nos locais onde os insetos costumam circular, como cantos,
                    rodapés e rachaduras. Evite aplicar em excesso ou em locais de preparo de alimentos. Após a aplicação,
                    mantenha o ambiente ventilado e aguarde a secagem completa antes de circular normalmente.
                `
            }
            // Adicione os outros 18 produtos seguindo o mesmo padrão...
        ];

        this.init();
    }

    init() {
        this.configurarEventListeners();
        this.carregarProdutoSelecionado();
        this.carregarProdutosCadastrados();
    }

    configurarEventListeners() {
        // Botões de voltar
        document.querySelectorAll(".btn-voltar, [class*='btn'][class*='descricao']").forEach(btn => {
            btn.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        });

        // Botões de comprar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-comprar')) {
                this.adicionarAoCarrinho(e.target);
            }
        });

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

    carregarProdutoSelecionado() {
        let raw = localStorage.getItem("produtoSelecionado") || localStorage.getItem("produtoDescricao");

        if (!raw) {
            this.mostrarPrimeiroProduto();
            return;
        }

        let produto = null;
        try {
            produto = JSON.parse(raw);
        } catch (e) {
            console.error("Erro ao parsear produto:", e);
            this.mostrarPrimeiroProduto();
            return;
        }

        if (!produto || !produto.id) {
            this.mostrarPrimeiroProduto();
            return;
        }

        // Verifica se é um produto cadastrado (ID maior ou igual a 1000)
        if (produto.id >= 1000) {
            this.criarProdutoCadastrado(produto);
        } else {
            this.mostrarProdutoFixo(produto);
        }

        // Limpa o localStorage após carregar
        localStorage.removeItem("produtoDescricao");
        localStorage.removeItem("produtoSelecionado");
    }

    mostrarPrimeiroProduto() {
        document.querySelectorAll(".produto-detalhe").forEach((d, index) => {
            d.style.display = index === 0 ? "block" : "none";
        });
    }

    criarProdutoCadastrado(produto) {
        console.log("Criando produto cadastrado:", produto);

        // Esconde todos os produtos fixos
        document.querySelectorAll(".produto-detalhe").forEach(d => {
            d.style.display = "none";
        });

        // Cria um container para o produto cadastrado
        const container = document.createElement('div');
        container.className = 'produto-detalhe produto-cadastrado';
        container.style.display = 'block';

        // Usa a descrição COMPLETA que foi salva no admin
        const descricaoCompleta = produto.descricaoCompleta || produto.descricao || 'Descrição não disponível.';

        // Formata a descrição para manter quebras de linha
        const descricaoFormatada = this.formatarDescricao(descricaoCompleta);

        container.innerHTML = `
            <center>
                <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='./imagens/placeholder.jpg'" style="max-width: 300px; max-height: 300px; object-fit: contain;">
            </center>
            <div class="produto-info">
                <h2>${produto.nome || 'Produto Cadastrado'}</h2>
                <div class="descricao-completa">${descricaoFormatada}</div>
                <br>
                <p class="preco">${produto.preco || 'Preço não disponível'}</p>
                <br>
                <button class="btn-comprar" data-id="${produto.id}">Adicionar ao Carrinho</button>
                <button class="btn-voltar">Voltar para Loja</button>
            </div>
        `;

        // Adiciona ao main (no início para aparecer primeiro)
        const main = document.querySelector('main');
        main.insertBefore(container, main.firstChild);

        // Adiciona evento ao botão voltar
        container.querySelector('.btn-voltar').addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    mostrarProdutoFixo(produto) {
        console.log("Mostrando produto fixo:", produto);

        // Esconde todos os produtos
        document.querySelectorAll(".produto-detalhe").forEach(d => {
            d.style.display = "none";
        });

        // Mostra o produto correto (fixo)
        const el = document.querySelector(".produto" + produto.id);
        if (el) {
            el.style.display = "block";
            console.log("Produto encontrado:", el);

            // Atualiza informações se necessário
            const img = el.querySelector("img");
            if (img && produto.imagem) {
                img.src = produto.imagem;
            }

            const precoEl = el.querySelector(".preco");
            if (precoEl && produto.preco) {
                precoEl.innerText = produto.preco;
            }
        } else {
            console.log("Produto não encontrado, ID:", produto.id);
            this.mostrarPrimeiroProduto();
        }
    }

    formatarDescricao(descricao) {
        return descricao
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/•/g, '•')
            .replace(/# (.*?)(<br>|$)/g, '<h4>$1</h4>')
            .replace(/## (.*?)(<br>|$)/g, '<h5>$1</h5>');
    }

    adicionarAoCarrinho(botao) {
        const card = botao.closest(".produto-detalhe");
        let nome, preco, imagem, id;

        // Obtém o ID do produto
        id = botao.getAttribute('data-id') || this.gerarIdProduto();

        // Tenta diferentes seletores para pegar as informações
        if (card.querySelector("h2")) {
            nome = card.querySelector("h2").innerText;
        } else if (card.querySelector("strong")) {
            nome = card.querySelector("strong").innerText;
        } else {
            nome = "Produto";
        }

        preco = card.querySelector(".preco")?.innerText || "";
        imagem = card.querySelector("img")?.src || "";

        // Extrai o valor numérico do preço
        const precoNumerico = this.extrairPrecoNumerico(preco);

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        // Verifica se o produto já está no carrinho
        const produtoExistente = carrinho.find(item => item.id === id);

        if (produtoExistente) {
            // Incrementa a quantidade
            produtoExistente.quantidade = (produtoExistente.quantidade || 1) + 1;
            produtoExistente.subtotal = precoNumerico * produtoExistente.quantidade;
        } else {
            // Adiciona novo produto
            carrinho.push({
                id: id,
                nome: nome.substring(0, 100),
                preco: preco,
                precoNumerico: precoNumerico,
                imagem: imagem,
                quantidade: 1,
                subtotal: precoNumerico
            });
        }

        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        // Feedback visual
        this.mostrarFeedbackCarrinho(botao);

        // Atualiza contador do carrinho (se existir)
        this.atualizarContadorCarrinho();
    }

    extrairPrecoNumerico(precoTexto) {
        if (!precoTexto) return 0;

        // Remove "R$", espaços e converte para número
        const precoLimpo = precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        return parseFloat(precoLimpo) || 0;
    }

    gerarIdProduto() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    mostrarFeedbackCarrinho(botao) {
        const textoOriginal = botao.innerText;
        botao.innerText = "✓ Adicionado!";
        botao.style.backgroundColor = "#388E3C";
        botao.disabled = true;

        setTimeout(() => {
            botao.innerText = textoOriginal;
            botao.style.backgroundColor = "";
            botao.disabled = false;
        }, 2000);
    }

    atualizarContadorCarrinho() {
        // Esta função pode ser chamada de outros lugares para atualizar o contador
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const totalItens = carrinho.reduce((total, item) => total + (item.quantidade || 1), 0);

        // Atualiza o contador na página se existir
        const contadorCarrinho = document.querySelector('.contador-carrinho');
        if (contadorCarrinho) {
            contadorCarrinho.textContent = totalItens;
            contadorCarrinho.style.display = totalItens > 0 ? 'flex' : 'none';
        }
    }

    carregarProdutosCadastrados() {
        const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
        console.log("Produtos cadastrados encontrados:", produtosCadastrados.length);

        if (produtosCadastrados.length === 0) return;

        // Esta função é para quando há uma lista de produtos na página
        // No produto.html, os produtos cadastrados são tratados individualmente
    }

    // Métodos utilitários
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    validarProduto(produto) {
        const erros = [];

        if (!produto.nome || produto.nome.trim().length < 2) {
            erros.push("Nome do produto deve ter pelo menos 2 caracteres");
        }

        if (!produto.preco || produto.preco <= 0) {
            erros.push("Preço deve ser maior que zero");
        }

        if (!produto.descricao || produto.descricao.trim().length < 10) {
            erros.push("Descrição deve ter pelo menos 10 caracteres");
        }

        return erros;
    }

    // Método para buscar produto por ID
    buscarProdutoPorId(id) {
        // Primeiro busca nos produtos fixos
        const produtoFixo = this.produtosFixos.find(p => p.id === parseInt(id));
        if (produtoFixo) return produtoFixo;

        // Depois busca nos produtos cadastrados
        const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
        const produtoCadastrado = produtosCadastrados.find(p => p.id === id);
        if (produtoCadastrado) return produtoCadastrado;

        return null;
    }

    // Método para obter todos os produtos (fixos + cadastrados)
    obterTodosProdutos() {
        const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
        return [...this.produtosFixos, ...produtosCadastrados];
    }

    // Método para filtrar produtos por categoria
    filtrarPorCategoria(categoria) {
        return this.obterTodosProdutos().filter(produto =>
            produto.categoria && produto.categoria.toLowerCase() === categoria.toLowerCase()
        );
    }

    // Método para buscar produtos por termo
    buscarProdutos(termo) {
        const todosProdutos = this.obterTodosProdutos();
        const termoLower = termo.toLowerCase();

        return todosProdutos.filter(produto =>
            produto.nome.toLowerCase().includes(termoLower) ||
            produto.descricao.toLowerCase().includes(termoLower) ||
            (produto.categoria && produto.categoria.toLowerCase().includes(termoLower))
        );
    }
}

// Sistema de notificações
class NotificacaoManager {
    static mostrar(mensagem, tipo = 'info') {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;

        // Adicionar estilos se não existirem
        this.adicionarEstilos();

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

    static adicionarEstilos() {
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
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    window.produtoManager = new ProdutoManager();
});

// Exportar para uso global
window.ProdutoManager = ProdutoManager;
window.NotificacaoManager = NotificacaoManager;