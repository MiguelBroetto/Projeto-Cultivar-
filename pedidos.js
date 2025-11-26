// Estrutura de dados para pedidos
let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

// Inicialização da página
document.addEventListener('DOMContentLoaded', function () {
    inicializarPedidos();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Fechar modal clicando fora
    window.onclick = function (event) {
        const modal = document.getElementById('modalDetalhes');
        if (event.target === modal) {
            fecharModal();
        }
    }

    // Enter nos filtros
    document.getElementById('filtroCliente').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            filtrarPedidos();
        }
    });

    // Configurações do dropdown
    const settingsBtn = document.getElementById('settingsBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (settingsBtn) {
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

// Inicializar pedidos
function inicializarPedidos() {
    debugPedidos();
    carregarPedidos();
    atualizarResumo();
}

// Carregar lista de pedidos
function carregarPedidos() {
    const listaPedidos = document.getElementById('listaPedidos');

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <div class="sem-pedidos">
                <h3>Nenhum pedido encontrado</h3>
                <p>Ainda não há pedidos realizados na loja.</p>
            </div>
        `;
        return;
    }

    // Ordenar por data (mais recente primeiro)
    pedidos.sort((a, b) => new Date(b.data) - new Date(a.data));

    listaPedidos.innerHTML = pedidos.map(pedido => `
        <div class="pedido-item" data-id="${pedido.id}">
            <div class="pedido-id">#${pedido.id}</div>
            <div>
                <div class="pedido-cliente">${pedido.cliente.nome}</div>
                <div class="pedido-data">${formatarData(pedido.data)}</div>
            </div>
            <div class="pedido-valor">R$ ${pedido.total.toFixed(2).replace('.', ',')}</div>
            <div class="pedido-status status-${pedido.status}">${formatarStatus(pedido.status)}</div>
            <button class="btn-detalhes" onclick="verDetalhes('${pedido.id}')">Ver Detalhes</button>
        </div>
    `).join('');
}

// Filtrar pedidos
function filtrarPedidos() {
    const status = document.getElementById('filtroStatus').value;
    const data = document.getElementById('filtroData').value;
    const cliente = document.getElementById('filtroCliente').value.toLowerCase();

    const pedidosFiltrados = pedidos.filter(pedido => {
        const matchStatus = !status || pedido.status === status;
        const matchData = !data || pedido.data.split('T')[0] === data;
        const matchCliente = !cliente || pedido.cliente.nome.toLowerCase().includes(cliente);

        return matchStatus && matchData && matchCliente;
    });

    atualizarListaPedidos(pedidosFiltrados);
}

// Atualizar lista de pedidos filtrados
function atualizarListaPedidos(pedidosFiltrados) {
    const listaPedidos = document.getElementById('listaPedidos');

    if (pedidosFiltrados.length === 0) {
        listaPedidos.innerHTML = `
            <div class="sem-pedidos">
                <h3>Nenhum pedido encontrado</h3>
                <p>Nenhum pedido corresponde aos filtros aplicados.</p>
            </div>
        `;
        return;
    }

    listaPedidos.innerHTML = pedidosFiltrados.map(pedido => `
        <div class="pedido-item" data-id="${pedido.id}">
            <div class="pedido-id">#${pedido.id}</div>
            <div>
                <div class="pedido-cliente">${pedido.cliente.nome}</div>
                <div class="pedido-data">${formatarData(pedido.data)}</div>
            </div>
            <div class="pedido-valor">R$ ${pedido.total.toFixed(2).replace('.', ',')}</div>
            <div class="pedido-status status-${pedido.status}">${formatarStatus(pedido.status)}</div>
            <button class="btn-detalhes" onclick="verDetalhes('${pedido.id}')">Ver Detalhes</button>
        </div>
    `).join('');
}

// Limpar filtros
function limparFiltros() {
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroData').value = '';
    document.getElementById('filtroCliente').value = '';
    carregarPedidos();
}

// Ver detalhes do pedido
function verDetalhes(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
        alert('Pedido não encontrado!');
        return;
    }

    const modal = document.getElementById('modalDetalhes');
    const detalhes = document.getElementById('detalhesPedido');

    detalhes.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #2f4f2f; margin-bottom: 15px;">Informações do Cliente</h3>
            <p><strong>Nome:</strong> ${pedido.cliente.nome}</p>
            <p><strong>Email:</strong> ${pedido.cliente.email}</p>
            <p><strong>Telefone:</strong> ${pedido.cliente.telefone || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${pedido.cliente.endereco || 'Não informado'}</p>
        </div>

        <div style="margin-bottom: 20px;">
            <h3 style="color: #2f4f2f; margin-bottom: 15px;">Produtos</h3>
            ${pedido.produtos.map(produto => `
                <div class="produto-pedido">
                    <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='./imagens/placeholder.jpg'">
                    <div class="info-produto">
                        <strong>${produto.nome}</strong>
                        <div>Quantidade: ${produto.quantidade || 1}</div>
                        <div>Preço: R$ ${(produto.preco || 0).toFixed(2).replace('.', ',')}</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="total-pedido">
            Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}
        </div>

        <div style="margin-top: 20px;">
            <h3 style="color: #2f4f2f; margin-bottom: 15px;">Status do Pedido</h3>
            <select id="alterarStatus" onchange="alterarStatus('${pedido.id}', this.value)" 
                    style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="pago" ${pedido.status === 'pago' ? 'selected' : ''}>Pago</option>
                <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
        </div>
    `;

    modal.style.display = 'block';
}

// Alterar status do pedido
function alterarStatus(pedidoId, novoStatus) {
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].status = novoStatus;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));

        // Atualizar a interface
        carregarPedidos();
        atualizarResumo();

        // Feedback visual
        mostrarNotificacao(`Status do pedido #${pedidoId} alterado para ${formatarStatus(novoStatus)}`, 'success');
    }
}

// Fechar modal
function fecharModal() {
    document.getElementById('modalDetalhes').style.display = 'none';
}

// Atualizar resumo de vendas
function atualizarResumo() {
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const pedidosHoje = pedidos.filter(p => {
        const dataPedido = p.data.split('T')[0];
        return dataPedido === hoje;
    });

    const pedidosMes = pedidos.filter(p => {
        const dataPedido = new Date(p.data);
        const mesmoMes = dataPedido.getMonth() === mesAtual;
        const mesmoAno = dataPedido.getFullYear() === anoAtual;
        return mesmoMes && mesmoAno;
    });

    const totalVendas = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    const ticketMedio = pedidos.length > 0 ? totalVendas / pedidos.length : 0;

    // Atualizar a interface
    document.getElementById('totalVendas').textContent = `R$ ${totalVendas.toFixed(2).replace('.', ',')}`;
    document.getElementById('pedidosHoje').textContent = pedidosHoje.length;
    document.getElementById('pedidosMes').textContent = pedidosMes.length;
    document.getElementById('ticketMedio').textContent = `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Formatar status para exibição
function formatarStatus(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'pago': 'Pago',
        'enviado': 'Enviado',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    // Cor baseada no tipo
    const cores = {
        'success': '#388E3C',
        'error': '#e92020',
        'info': '#1976D2',
        'warning': '#FFB300'
    };

    notificacao.style.background = cores[tipo] || cores.info;
    notificacao.textContent = mensagem;

    document.body.appendChild(notificacao);

    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// === DEBUG - VERIFICAR PEDIDOS ===
function debugPedidos() {
    console.log("=== DEBUG PEDIDOS ===");
    const pedidosStorage = JSON.parse(localStorage.getItem('pedidos')) || [];
    console.log("Pedidos no localStorage:", pedidosStorage);
    console.log("Número de pedidos:", pedidosStorage.length);

    if (pedidosStorage.length > 0) {
        pedidosStorage.forEach((pedido, index) => {
            console.log(`Pedido ${index + 1}:`, {
                id: pedido.id,
                total: pedido.total,
                status: pedido.status,
                data: pedido.data,
                cliente: pedido.cliente.nome,
                produtos: pedido.produtos.length
            });
        });

        const totalCalculado = pedidosStorage.reduce((sum, p) => sum + (p.total || 0), 0);
        console.log("Total calculado:", totalCalculado);
    } else {
        console.log("Nenhum pedido encontrado no localStorage");

        // Criar dados de exemplo para demonstração
        if (confirm('Nenhum pedido encontrado. Deseja criar dados de exemplo?')) {
            criarPedidosExemplo();
        }
    }
    console.log("=====================");
}

// Criar pedidos de exemplo para demonstração
function criarPedidosExemplo() {
    const pedidosExemplo = [
        {
            id: 'PED001',
            data: new Date().toISOString(),
            cliente: {
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '(11) 99999-9999',
                endereco: 'Rua Exemplo, 123 - São Paulo, SP'
            },
            produtos: [
                {
                    nome: 'Semente de Tomate',
                    preco: 15.90,
                    quantidade: 2,
                    imagem: './imagens/tomate.jpg'
                },
                {
                    nome: 'Adubo Orgânico',
                    preco: 25.50,
                    quantidade: 1,
                    imagem: './imagens/adubo.jpg'
                }
            ],
            total: 57.30,
            status: 'pendente'
        },
        {
            id: 'PED002',
            data: new Date(Date.now() - 86400000).toISOString(), // Ontem
            cliente: {
                nome: 'Maria Santos',
                email: 'maria@email.com',
                telefone: '(11) 88888-8888',
                endereco: 'Av. Principal, 456 - Rio de Janeiro, RJ'
            },
            produtos: [
                {
                    nome: 'Vaso Cerâmica',
                    preco: 45.00,
                    quantidade: 1,
                    imagem: './imagens/vaso.jpg'
                }
            ],
            total: 45.00,
            status: 'pago'
        }
    ];

    localStorage.setItem('pedidos', JSON.stringify(pedidosExemplo));
    pedidos = pedidosExemplo;

    carregarPedidos();
    atualizarResumo();
    mostrarNotificacao('Dados de exemplo criados com sucesso!', 'success');
}

// Adicionar animação CSS para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);