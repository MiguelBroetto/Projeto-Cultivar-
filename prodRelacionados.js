// === PRODUTOS RELACIONADOS ===

// Mapeamento de categorias relacionadas
const categoriasRelacionadas = {
  'fertilizante': ['Inseticida', 'Sementes'],
  'Inseticida': ['fertilizante', 'Sementes'],
  'Sementes': ['fertilizante', 'Inseticida'],
  'construcao': ['Maquinario'],
  'Maquinario': ['construcao']
};

// Função para mostrar produtos relacionados
function mostrarProdutosRelacionados(categoriaFiltrada) {
  const catalogoRelacionado = document.getElementById('catalogoRelacionado');
  const listaRelacionados = document.getElementById('listaProdutosRelacionados');
  
  // Se não tiver categoria filtrada ou não houver relacionados, esconde a seção
  if (!categoriaFiltrada || !categoriasRelacionadas[categoriaFiltrada]) {
    catalogoRelacionado.style.display = 'none';
    return;
  }

  // Pega as categorias relacionadas
  const categorias = categoriasRelacionadas[categoriaFiltrada];
  
  // Filtra produtos das categorias relacionadas
  const produtosRelacionados = Array.from(document.querySelectorAll('.produto'))
    .filter(produto => {
      const categoriaProduto = produto.dataset.categoria;
      return categorias.includes(categoriaProduto);
    })
    .slice(0, 4); // Limita a 4 produtos

  // Se não encontrou produtos relacionados, esconde a seção
  if (produtosRelacionados.length === 0) {
    catalogoRelacionado.style.display = 'none';
    return;
  }

  // Cria os cards dos produtos relacionados
  listaRelacionados.innerHTML = produtosRelacionados.map(produto => {
    const nome = produto.querySelector('h2').innerText;
    const preco = produto.querySelector('.preco').innerText;
    const imagem = produto.querySelector('img').src;
    const descricao = produto.querySelector('.descricao').innerText;
    const categoria = produto.dataset.categoria;

    return `
      <div class="produto-relacionado" data-categoria="${categoria}">
        <img src="${imagem}" alt="${nome}">
        <h3>${nome}</h3>
        <p class="descricao-curta">${descricao}</p>
        <p class="preco">${preco}</p>
        <button class="btn-ver-detalhes" onclick="verDetalhesRelacionado(this)">
          Ver Detalhes
        </button>
        <button class="btn-comprar" onclick="adicionarCarrinhoRelacionado(this)">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
  }).join('');

  // Mostra a seção de relacionados
  catalogoRelacionado.style.display = 'block';
}

// Função para ver detalhes de produto relacionado
function verDetalhesRelacionado(botao) {
  const produtoCard = botao.closest('.produto-relacionado');
  const nome = produtoCard.querySelector('h3').innerText;
  const preco = produtoCard.querySelector('.preco').innerText;
  const imagem = produtoCard.querySelector('img').src;
  const descricao = produtoCard.querySelector('.descricao-curta').innerText;
  const categoria = produtoCard.dataset.categoria;

  // Encontra o produto original na lista principal
  const produtos = document.querySelectorAll('.produto');
  let produtoOriginal = null;
  let indexOriginal = -1;

  produtos.forEach((produto, index) => {
    const nomeOriginal = produto.querySelector('h2').innerText;
    if (nomeOriginal === nome) {
      produtoOriginal = produto;
      indexOriginal = index + 1; // +1 porque os IDs começam em 1
    }
  });

  // Prepara os dados para a página de detalhes
  const produtoDescricao = {
    id: indexOriginal > 0 ? indexOriginal : 1000, // Se não encontrar, usa ID alto
    nome: nome,
    preco: preco,
    descricao: descricao,
    imagem: imagem
  };

  // Salva no localStorage
  localStorage.setItem("produtoDescricao", JSON.stringify(produtoDescricao));
  localStorage.setItem("produtoSelecionado", JSON.stringify(produtoDescricao));

  // Redireciona para a página de detalhes
  window.location.href = "Produto.html";
}

// Função para adicionar produto relacionado ao carrinho
function adicionarCarrinhoRelacionado(botao) {
  const produtoCard = botao.closest('.produto-relacionado');
  const nome = produtoCard.querySelector('h3').innerText;
  const preco = produtoCard.querySelector('.preco').innerText;
  const imagem = produtoCard.querySelector('img').src;

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push({ nome, preco, imagem });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  // Feedback visual
  botao.innerText = "Adicionado!";
  botao.disabled = true;
  setTimeout(() => {
    botao.innerText = "Adicionar ao Carrinho";
    botao.disabled = false;
  }, 1500);
}