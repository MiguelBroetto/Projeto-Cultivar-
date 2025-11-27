  // Função para gerar ID único
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Carregar produtos existentes
        function carregarProdutos() {
            const produtos = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
            const lista = document.getElementById('listaProdutosCadastrados');

            lista.innerHTML = '';

            if (produtos.length === 0) {
                lista.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
                return;
            }

            // Mostrar últimos 10 produtos (mais recentes primeiro)
            const ultimosProdutos = produtos.slice(-10).reverse();

            ultimosProdutos.forEach((produto, index) => {
                const div = document.createElement('div');
                div.className = 'produto-item';
                div.innerHTML = `
            <div class="produto-info">
                <strong>${produto.nome}</strong> - R$ ${produto.preco.toFixed(2).replace('.', ',')}
                <br><small>Categoria: ${produto.categoria} | Descrição: ${produto.descricao.substring(0, 50)}...</small>
            </div>
            <button class="btn-remover" data-id="${produto.id}">Remover</button>
        `;
                lista.appendChild(div);
            });

            // Adicionar eventos aos botões de remover
            document.querySelectorAll('.btn-remover').forEach(btn => {
                btn.addEventListener('click', function () {
                    const produtoId = this.getAttribute('data-id');
                    removerProduto(produtoId);
                });
            });
        }

        // Cadastrar novo produto
        document.getElementById('formProduto').addEventListener('submit', function (e) {
            e.preventDefault();

            const novoProduto = {
                id: gerarId(),
                nome: document.getElementById('nomeProduto').value,
                categoria: document.getElementById('categoriaProduto').value,
                preco: parseFloat(document.getElementById('precoProduto').value),
                imagem: document.getElementById('imagemProduto').value,
                descricao: document.getElementById('descricaoProduto').value, // Descrição curta (será gerada)
                descricaoCompleta: document.getElementById('descricaoProduto').value, // Descrição COMPLETA
                dataCadastro: new Date().toISOString()
            };

            // Carregar produtos existentes
            let produtos = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];

            // Adicionar novo produto
            produtos.push(novoProduto);

            // Salvar no localStorage
            localStorage.setItem('produtosCadastrados', JSON.stringify(produtos));

            // Mostrar mensagem de sucesso
            const mensagem = document.getElementById('mensagemSucesso');
            mensagem.textContent = 'Produto cadastrado com sucesso!';
            mensagem.style.display = 'block';

            // Limpar formulário
            document.getElementById('formProduto').reset();

            // Atualizar lista
            carregarProdutos();

            // Esconder mensagem após 3 segundos
            setTimeout(() => {
                mensagem.style.display = 'none';
            }, 3000);
        });

        // Remover produto
        function removerProduto(produtoId) {
            if (!confirm('Tem certeza que deseja remover este produto?')) {
                return;
            }

            let produtos = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];

            // Filtrar o produto a ser removido
            const produtosAtualizados = produtos.filter(produto => produto.id !== produtoId);

            // Salvar lista atualizada
            localStorage.setItem('produtosCadastrados', JSON.stringify(produtosAtualizados));

            // Mostrar mensagem de sucesso
            const mensagem = document.getElementById('mensagemSucesso');
            mensagem.textContent = 'Produto removido com sucesso!';
            mensagem.style.display = 'block';

            // Atualizar lista
            carregarProdutos();

            // Esconder mensagem após 3 segundos
            setTimeout(() => {
                mensagem.style.display = 'none';
            }, 3000);
        }

        // Carregar produtos ao iniciar a página
        document.addEventListener('DOMContentLoaded', carregarProdutos);



        // icone de configuração 

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


        // Mostrar mensagem de sucesso
        const mensagem = document.getElementById('mensagemSucesso');
        mensagem.textContent = 'Produto removido com sucesso!';
        mensagem.style.display = 'block';

        // Atualizar lista
        carregarProdutos();

        // Esconder mensagem após 3 segundos
        setTimeout(() => {
            mensagem.style.display = 'none';
        }, 3000);


        // Carregar produtos ao iniciar a página
        document.addEventListener('DOMContentLoaded', carregarProdutos);