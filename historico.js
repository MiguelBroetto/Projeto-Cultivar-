    // historico.js - versão unificada e robusta (mantém o menu de configurações)

// ELEMENTOS PRINCIPAIS
const usuarioNaoLogado = document.getElementById('usuarioNaoLogado');
const historicoVazio = document.getElementById('historicoVazio');
const historicoComprasDiv = document.getElementById('historicoCompras'); // div que contém lista
const listaPedidos = document.getElementById('listaPedidos'); // onde os cards vão
const modalDetalhes = document.getElementById('modalDetalhes');
const detalhesPedidoConteudo = document.getElementById('detalhesPedidoConteudo');
const filtroStatus = document.getElementById('filtroStatus');
const filtroData = document.getElementById('filtroData');

// elementos do menu de configurações (NÃO ALTERAR A LÓGICA)
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Estado interno
let pedidosCache = []; // array combinado de pedidos que exibimos

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    configurarMenuDropdown();   // mantém a fórmula do menu exatamente como antes
    configurarEventos();
    carregarHistorico();
});

// -----------------------------
// CARREGAR / SINCRONIZAR HISTÓRICO
// -----------------------------
function carregarHistorico() {
    // Verifica login corretamente
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

    // Se não estiver logado → mostra aviso e para tudo
    if (!usuarioLogado) {
        mostrarUsuarioNaoLogado();
        return;
    }

    // Continua normalmente
    const historicoLocal = JSON.parse(localStorage.getItem('historicoCompras') || '[]');
    const todosPedidos = JSON.parse(localStorage.getItem('todosPedidos') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Carrega pedidos do usuário logado
    let pedidosDoUsuario = [];
    if (Array.isArray(usuarioLogado.pedidos)) {
        pedidosDoUsuario = usuarioLogado.pedidos.slice();
    } else {
        const u = usuarios.find(x => x.email === usuarioLogado.email);
        if (u && Array.isArray(u.pedidos)) {
            pedidosDoUsuario = u.pedidos.slice();
        }
    }

    // Filtra pedidos do sistema pelo email
    let pedidosFiltradosTodos = [];
    if (Array.isArray(todosPedidos) && todosPedidos.length) {
        pedidosFiltradosTodos = todosPedidos.filter(p => p.usuarioEmail === usuarioLogado.email);
    }

    // Histórico local (compatibilidade)
    const pedidosHistoricoLocal = Array.isArray(historicoLocal) ? historicoLocal.slice() : [];

    // Unir tudo sem duplicar
    const combined = mergePedidos([
        ...pedidosDoUsuario,
        ...pedidosFiltradosTodos,
        ...pedidosHistoricoLocal
    ]);

    // Atualiza cache interno
    pedidosCache = combined;

    // Se não há pedidos
    if (!pedidosCache.length) {
        mostrarHistoricoVazio();
        return;
    }

    // Exibe histórico normalmente
    usuarioNaoLogado.style.display = 'none';
    historicoVazio.style.display = 'none';
    historicoComprasDiv.style.display = 'block';

    // Ordenar por data
    pedidosCache.sort((a, b) => {
        const da = parseDateForSort(a);
        const db = parseDateForSort(b);
        return db - da;
    });

    exibirPedidos(pedidosCache);

    // Salva versão consolidada
    localStorage.setItem('historicoCompras', JSON.stringify(pedidosCache));
}

// Mescla arrays de pedidos evitando duplicatas (usa id quando disponível, senão gera key)
function mergePedidos(arrs) {
    const map = new Map();
    arrs.forEach(p => {
        if (!p) return;
        // preferir usar p.id quando existir
        const key = p.id != null ? String(p.id) : (
            p.timestamp ? `ts:${p.timestamp}` : (
                p.data ? `d:${p.data}` : JSON.stringify(p)
            )
        );
        if (!map.has(key)) {
            map.set(key, p);
        } else {
            // se já existe, podemos tentar mesclar campos faltantes
            const existing = map.get(key);
            map.set(key, Object.assign({}, existing, p));
        }
    });
    return Array.from(map.values());
}

// parsea data para sort (fallback para Date.now)
function parseDateForSort(p) {
    const s = p?.data ?? p?.timestamp ?? p?.createdAt ?? null;
    const d = s ? new Date(s) : null;
    if (d && !isNaN(d)) return d.getTime();
    return 0;
}

// -----------------------------
// RENDER / INTERAÇÃO
// -----------------------------
function exibirPedidos(pedidos) {
    if (!listaPedidos) return;
    listaPedidos.innerHTML = '';

    pedidos.forEach(pedido => {
        const pedidoElement = document.createElement('div');
        pedidoElement.className = `pedido-item status-${(pedido.status || 'Confirmado').toLowerCase()}`;

        const totalNum = Number(pedido.total) || 0;
        const totalFormatado = `R$ ${totalNum.toFixed(2).replace('.', ',')}`;

        const itensQtd = Array.isArray(pedido.itens) ? pedido.itens.reduce((t, i) => t + (Number(i.quantidade) || 1), 0) : (pedido.itensQnt || 1);
        const dataFormatada = pedido.dataFormatada || (pedido.data ? new Date(pedido.data).toLocaleDateString('pt-BR') : '');

        pedidoElement.innerHTML = `
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido ${pedido.id || pedido.codigo || ''}</h3>
                    <span class="pedido-data">${dataFormatada}</span>
                </div>
                <div class="pedido-status ${(pedido.status || 'Confirmado').toLowerCase()}">
                    ${getIconeStatus(pedido.status)} ${pedido.status || 'Confirmado'}
                </div>
            </div>

            <div class="pedido-detalhes">
                <div class="detalhes-item"><span class="detalhes-label">Itens:</span> ${itensQtd}</div>
                <div class="detalhes-item"><span class="detalhes-label">Total:</span> ${totalFormatado}</div>
                <div class="detalhes-item"><span class="detalhes-label">Pagamento:</span> ${getIconePagamento(pedido.metodoPagamento)} ${pedido.metodoPagamento || '-'}</div>
            </div>

            <div class="pedido-acoes">
                <button class="btn-detalhes" onclick="verDetalhesPedido('${pedido.id || ''}')">📋 Ver Detalhes</button>
            </div>
        `;

        listaPedidos.appendChild(pedidoElement);
    });
}

function verDetalhesPedido(pedidoId) {
    if (!pedidoId) return alert('Pedido sem ID disponível para exibir detalhes.');

    // procurar no cache
    const pedido = pedidosCache.find(p => String(p.id) === String(pedidoId));
    if (!pedido) return alert('Pedido não encontrado.');

    detalhesPedidoConteudo.innerHTML = montarHTMLDetalhes(pedido);
    if (modalDetalhes) modalDetalhes.style.display = 'flex';
}

function montarHTMLDetalhes(pedido) {
    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
    const itensHTML = itens.map(item => `
        <div class="item-detalhe">
            <img src="${item.imagem || './imagens/placeholder.jpg'}" class="item-imagem">
            <div>
                <h4>${item.nome || 'Produto'}</h4>
                <p>Qtd: ${item.quantidade || 1}</p>
                <p>R$ ${(Number((item.preco || '').replace?.('R$', '') ) || 0).toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');

    return `
        <h2>Pedido ${pedido.id || ''}</h2>
        <p><strong>Status:</strong> ${getIconeStatus(pedido.status)} ${pedido.status || ''}</p>
        <p><strong>Data:</strong> ${pedido.dataFormatada || pedido.data || ''}</p>
        <h3>Itens</h3>
        ${itensHTML || '<p>Nenhum item listado.</p>'}
    `;
}

// -----------------------------
// ÍCONES (simples)
function getIconeStatus(s) {
    if (s === 'Confirmado' || s === 'confirmado') return '✅';
    if (s === 'Entregue' || s === 'entregue') return '📦';
    if (s === 'Cancelado' || s === 'cancelado') return '❌';
    return '📋';
}
function getIconePagamento(m) {
    if (!m) return '💰';
    if (/pix/i.test(m)) return '🏦';
    if (/boleto/i.test(m)) return '📄';
    if (/cartão|cartao|crédito|credito/i.test(m)) return '💳';
    return '💰';
}

// -----------------------------
// FILTROS & EVENTOS
// -----------------------------
function aplicarFiltros() {
    const statusSelecionado = filtroStatus?.value || 'todos';
    const ordem = filtroData?.value || 'recentes';

    let lista = pedidosCache.slice();

    if (statusSelecionado !== 'todos') {
        lista = lista.filter(p => String((p.status || '')).toLowerCase() === String(statusSelecionado).toLowerCase());
    }

    lista.sort((a, b) => {
        const da = parseDateForSort(a);
        const db = parseDateForSort(b);
        return ordem === 'recentes' ? db - da : da - db;
    });

    exibirPedidos(lista);
}

function configurarEventos() {
    // fecha modal clicando fora
    modalDetalhes?.addEventListener('click', e => {
        if (e.target === modalDetalhes) modalDetalhes.style.display = 'none';
    });

    // fechar botão (pode não existir no seu HTML; por isso opcional)
    const fecharDetalhes = document.getElementById('fecharDetalhes');
    fecharDetalhes?.addEventListener('click', () => {
        if (modalDetalhes) modalDetalhes.style.display = 'none';
    });

    filtroStatus?.addEventListener('change', aplicarFiltros);
    filtroData?.addEventListener('change', aplicarFiltros);
}

// -----------------------------
// MENU DROPDOWN (NÃO ALTEREI A LÓGICA)
// -----------------------------
function configurarMenuDropdown() {
    if (!settingsBtn || !dropdownMenu) return;

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && e.target !== settingsBtn) {
            dropdownMenu.classList.remove('active');
        }
    });

    // fechar com ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') dropdownMenu.classList.remove('active');
    });
}

// -----------------------------
// Sincronização externa (quando outra aba grava)
window.addEventListener('storage', (e) => {
    // se algo mudou no localStorage que influencia, recarregamos
    if (['historicoCompras', 'todosPedidos', 'usuarioLogado', 'usuarios'].includes(e.key)) {
        carregarHistorico();
    }
});

// -----------------------------
// AUXILIARES (ações disponibilizadas globalmente)
function mostrarUsuarioNaoLogado() {
    if (usuarioNaoLogado) usuarioNaoLogado.style.display = 'block';
    if (historicoVazio) historicoVazio.style.display = 'none';
    if (historicoComprasDiv) historicoComprasDiv.style.display = 'none';
}
function mostrarHistoricoVazio() {
    if (historicoVazio) {
        historicoVazio.style.display = 'block';
        historicoVazio.innerHTML = `
            <div class="aviso-conteudo">
                <h2>📭 Nenhuma Compra Encontrada</h2>
                <p>Você ainda não realizou nenhuma compra.</p>
                <a href="index.html" class="btn-comprar">Fazer Minha Primeira Compra</a>
            </div>
        `;
    }
    if (usuarioNaoLogado) usuarioNaoLogado.style.display = 'none';
    if (historicoComprasDiv) historicoComprasDiv.style.display = 'none';
}

// disponibiliza globalmente (se for necessário chamar por onclick inline)
window.verDetalhesPedido = verDetalhesPedido;
window.aplicarFiltros = aplicarFiltros;