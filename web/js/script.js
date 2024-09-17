// Função para incluir uma nova linha na tabela e também enviar os dados ao backend
async function incluir() {
    // Obter os valores dos campos de entrada
    var nome = document.getElementById('cliente').value;
    var tel = document.getElementById('tel').value;
    var data = document.getElementById('venda').value;

    // Verificar se os campos foram preenchidos
    if (nome === "" || tel === "" || data === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Verificar se o telefone contém apenas números
    if (!/^\d+$/.test(tel)) {
        alert("Por favor, insira apenas números no campo Telefone.");
        return;
    }

    // Criar o objeto de contato
    const contato = {
        nome: nome,
        telefone: tel,
        data: data // Formato yyyy-mm-dd já é o padrão do HTML5 para campos do tipo date
    };

    try {
        // Enviar os dados para o backend
        const response = await fetch('http://localhost:3000/contato', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contato)
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar contato');
        }

        // Limpar os campos de entrada
        document.getElementById('cliente').value = "";
        document.getElementById('tel').value = "";
        document.getElementById('venda').value = "";

        // Atualizar a tabela
        atualizarTabela();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar contato');
    }
}

// Função para formatar a data no formato dd/mm/aaaa
function formatarData(dataISO) {
    var partes = dataISO.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0]; // dd/mm/aaaa
}

// Função para obter a data no formato yyyy-mm-dd ajustada para o fuso horário de Brasília
function obterDataBrasilISO() {
    var agora = new Date();

    // Converte para o fuso horário do Brasil (UTC-3), sem considerar o horário de verão
    var fusoHorarioBrasil = -3;
    var dataBrasil = new Date(agora.getTime() + (fusoHorarioBrasil * 60 * 60 * 1000));

    // Formata a data no formato yyyy-mm-dd
    var dia = String(dataBrasil.getUTCDate()).padStart(2, '0');
    var mes = String(dataBrasil.getUTCMonth() + 1).padStart(2, '0'); // Meses começam do 0
    var ano = dataBrasil.getUTCFullYear();

    return `${ano}-${mes}-${dia}`;
}

// Função para definir a data de hoje no campo de data
function hoje() {
    var dataHojeISO = obterDataBrasilISO();
    document.getElementById('venda').value = dataHojeISO;
}

// Função para atualizar a data no banco de dados
async function atualizarData(contatoId, novaData) {
    try {
        const response = await fetch(`http://localhost:3000/contato/${contatoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data_contato: novaData })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar a data');
        }

        // Atualizar a tabela após a alteração
        atualizarTabela();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar a data');
    }
}

// Função para atualizar a tabela com os contatos do backend
async function atualizarTabela() {
    try {
        const response = await fetch('http://localhost:3000/contatos');
        if (!response.ok) {
            throw new Error('Erro ao carregar contatos');
        }
        const contatos = await response.json();

        // Limpar a tabela existente
        var tabela = document.getElementById("tabela").getElementsByTagName('tbody')[0];
        tabela.innerHTML = "";

        contatos.forEach(contato => {
            var novaLinha = tabela.insertRow();

            // Criar células para nome, telefone, data e os botões
            var celulaID = novaLinha.insertCell(0);
            var celulaNome = novaLinha.insertCell(1);
            var celulaTelefone = novaLinha.insertCell(2);
            var celulaData = novaLinha.insertCell(3);
            var celulaEditarBtn = novaLinha.insertCell(4);
            var celulaDataBtn = novaLinha.insertCell(5);
            var celulaContactar = novaLinha.insertCell(6);

            // Adicionar o conteúdo nas células
            celulaID.innerHTML = contato.id;
            celulaNome.innerHTML = contato.nome;
            celulaTelefone.innerHTML = contato.telefone;
            celulaData.innerHTML = contato.data_contato;

            // Adicionar botão "Editar"
            var botaoEditar = document.createElement("button");
            botaoEditar.className = "editBtn";
            botaoEditar.innerHTML = "Editar";
            botaoEditar.onclick = function() {
                exibirModal(contato); // Exibe o modal com os dados do contato
            };
            celulaEditarBtn.appendChild(botaoEditar);

            // Adicionar botão "Data de hoje"
            var botaoDataHoje = document.createElement("button");
            botaoDataHoje.className = "dataBtn";
            botaoDataHoje.innerHTML = "Data de hoje";
            botaoDataHoje.onclick = function() {
                var hoje = obterDataBrasilISO();
                atualizarData(contato.id, hoje); // Envia a atualização para o backend
            };
            celulaDataBtn.appendChild(botaoDataHoje);

            // Adicionar botão "Contactar"
            var botaoContactar = document.createElement("button");
            botaoContactar.className = "contactar";
            botaoContactar.innerHTML = "Contactar";
            botaoContactar.onclick = function() {
                var mensagem = "Olá! Tudo bem por aí? To entrando em contato pra saber se está tudo bem com vocês e se está tudo OK de material";
                var link = `https://wa.me/${contato.telefone}?text=${encodeURIComponent(mensagem)}`;
                window.open(link, '_blank');
            };
            celulaContactar.appendChild(botaoContactar);
        });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar contatos');
    }
}

// Função para exibir o modal de edição
function exibirModal(contato) {
    document.getElementById('editId').value = contato.id;
    document.getElementById('editNome').value = contato.nome;
    document.getElementById('editTelefone').value = contato.telefone;
    document.getElementById('editData').value = (formatarDataModal(contato.data_contato));

    var modal = document.getElementById('modalEditar');
    modal.style.display = 'block';
}

// Função para salvar as edições
async function salvarEdicoes() {
    var id = document.getElementById('editId').value;
    var nome = document.getElementById('editNome').value;
    var telefone = document.getElementById('editTelefone').value;
    var data = document.getElementById('editData').value;

    if (!nome || !telefone || !data) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/contato/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, telefone, data_contato: data })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar edições');
        }

        // Fechar o modal e atualizar a tabela após a alteração
        document.getElementById('modalEditar').style.display = 'none';
        atualizarTabela();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar edições');
    }
}

// Função para fechar o modal
function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
}

// Adicionar evento de clique no botão de fechar do modal
document.querySelector('.modal .close').addEventListener('click', fecharModal);

// Função para formatar a data no formato yyyy-mm-dd
function formatarDataModal(dataISO) {
    var partes = dataISO.split("/");
    return partes[2] + "-" + partes[1] + "-" + partes[0]; // yyyy-mm-dd
}

// Carregar contatos ao iniciar a página
window.onload = atualizarTabela;