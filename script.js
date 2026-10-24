
const formulario = document.getElementById("form-evento");

const campoTitulo = document.getElementById("titulo");
const campoData = document.getElementById("data");
const campoAnotacao = document.getElementById("anotacao");

const listaEventos = document.getElementById("lista-eventos");
const botaoEnviar = formulario.querySelector('button[type="submit"]');

// Recupera os eventos salvos no navegador.
let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

// Guarda o ID do evento que está sendo editado.
let idEmEdicao = null;

// Cria o botão de cancelar edição.
const botaoCancelar = document.createElement("button");
botaoCancelar.type = "button";
botaoCancelar.textContent = "Cancelar edição";
botaoCancelar.hidden = true;
formulario.appendChild(botaoCancelar);

// Retorna a data de hoje sem considerar as horas.
function obterHoje() {
    const hoje = new Date();

    return new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );
}

// Converte a data para evitar problemas com fuso horário.
function converterData(data) {
    const [ano, mes, dia] = data.split("-").map(Number);

    return new Date(ano, mes - 1, dia);
}

// Calcula quantos dias faltam para o evento.
function calcularDias(data) {
    return Math.round(
        (converterData(data) - obterHoje()) / 86400000
    );
}

// Salva os eventos no navegador.
function salvarEventos() {
    localStorage.setItem("eventos", JSON.stringify(eventos));
}

// Limpa o formulário e encerra o modo de edição.
function cancelarEdicao() {
    idEmEdicao = null;

    formulario.reset();

    botaoEnviar.textContent = "Adicionar evento";
    botaoCancelar.hidden = true;
}

// Prepara o formulário para editar um evento.
function editarEvento(id) {
    const evento = eventos.find(function(item) {
        return item.id === id;
    });

    if (!evento) return;

    idEmEdicao = id;

    campoTitulo.value = evento.titulo;
    campoData.value = evento.data;
    campoAnotacao.value = evento.anotacao;

    botaoEnviar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;

    // Leva o formulário para a área visível.
    formulario.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoTitulo.focus();
}

// Exclui um evento manualmente.
function excluirEvento(id) {
    const evento = eventos.find(function(item) {
        return item.id === id;
    });

    if (!evento) return;

    const confirmar = confirm(
        `Deseja excluir o evento "${evento.titulo}"?`
    );

    if (!confirmar) return;

    eventos = eventos.filter(function(item) {
        return item.id !== id;
    });

    // Se o evento excluído estava sendo editado, limpa o formulário.
    if (idEmEdicao === id) {
        cancelarEdicao();
    }

    salvarEventos();
    renderizarEventos();
}


function atualizarResumo() {
    let verdes = 0;
    let laranjas = 0;
    let vermelhos = 0;

    eventos.forEach(function(evento) {
        const dias = calcularDias(evento.data);

        if (dias <= 3) {
            vermelhos++;
        } else if (dias <= 7) {
            laranjas++;
        } else {
            verdes++;
        }
    });

    document.getElementById("total-verde").textContent = verdes;
    document.getElementById("total-laranja").textContent = laranjas;
    document.getElementById("total-vermelho").textContent = vermelhos;
}



function atualizarDestaqueHoje() {
    const listaHoje = document.getElementById("lista-hoje");

    listaHoje.replaceChildren();

    const eventosDeHoje = eventos.filter(function(evento) {
        return calcularDias(evento.data) === 0;
    });

    if (eventosDeHoje.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum compromisso para hoje.";
        listaHoje.appendChild(mensagem);
        return;
    }

    eventosDeHoje.forEach(function(evento) {
        const cartao = document.createElement("article");
        cartao.classList.add("evento-hoje");

        const titulo = document.createElement("h3");
        titulo.textContent = evento.titulo;

        const anotacao = document.createElement("p");
        anotacao.textContent = evento.anotacao;

        const aviso = document.createElement("p");
        aviso.textContent = "📍 Acontece hoje";

        const acoes = document.createElement("div");
        acoes.classList.add("acoes-evento");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function() {
            editarEvento(evento.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            excluirEvento(evento.id);
        });

        acoes.append(botaoEditar, botaoExcluir);
        cartao.append(titulo, anotacao, aviso, acoes);

        listaHoje.appendChild(cartao);
    });
}



// Desenha os cartões na tela.
function renderizarEventos() {
    // Remove automaticamente os eventos vencidos.
    eventos = eventos.filter(function(evento) {
        return calcularDias(evento.data) >= 0;
    });

    salvarEventos();
    atualizarResumo();
    atualizarDestaqueHoje();

    listaEventos.replaceChildren();

    // Ordena as datas da mais próxima para a mais distante.
    eventos.sort(function(a, b) {
        return a.data.localeCompare(b.data);
    });

    if (eventos.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhuma data importante cadastrada.";
        listaEventos.appendChild(mensagem);
        return;
    }

    eventos.forEach(function(evento) {
        const dias = calcularDias(evento.data);

        const cartao = document.createElement("article");
        cartao.classList.add("evento-card");

        // Define o status de proximidade.
        let status;
        let mensagemPrazo;

        if (dias <= 3) {
            status = "vermelho";
            mensagemPrazo = dias === 0
                ? "É hoje!"
                : `Faltam ${dias} dia(s)!`;
        } else if (dias <= 7) {
            status = "laranja";
            mensagemPrazo = `Faltam ${dias} dias`;
        } else {
            status = "verde";
            mensagemPrazo = `Faltam ${dias} dias`;
        }

        cartao.classList.add(`status-${status}`);

        const nomeEvento = document.createElement("h3");
        nomeEvento.textContent = evento.titulo;

        const dataEvento = document.createElement("p");
        const [ano, mes, dia] = evento.data.split("-");
        dataEvento.textContent = `Data: ${dia}/${mes}/${ano}`;

        const textoAnotacao = document.createElement("p");
        textoAnotacao.textContent = evento.anotacao;

        const avisoPrazo = document.createElement("p");
        avisoPrazo.classList.add("aviso-prazo");
        avisoPrazo.textContent = mensagemPrazo;

        // Botão para editar.
        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function() {
            editarEvento(evento.id);
        });

        // Botão para excluir.
        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            excluirEvento(evento.id);
        });

        const areaBotoes = document.createElement("div");
        areaBotoes.classList.add("acoes-evento");
        areaBotoes.append(botaoEditar, botaoExcluir);

        cartao.append(
            nomeEvento,
            dataEvento,
            textoAnotacao,
            avisoPrazo,
            areaBotoes
        );

        listaEventos.appendChild(cartao);
    });
}

// Cadastra um evento ou salva as alterações de um evento existente.
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const titulo = campoTitulo.value.trim();
    const data = campoData.value;
    const anotacao = campoAnotacao.value.trim();

    if (!titulo || !data || !anotacao) {
        alert("Preencha todos os campos.");
        return;
    }

    if (calcularDias(data) < 0) {
        alert("Escolha uma data de hoje em diante.");
        return;
    }

    if (idEmEdicao !== null) {
        // Atualiza o evento existente.
        const indice = eventos.findIndex(function(item) {
            return item.id === idEmEdicao;
        });

        if (indice !== -1) {
            eventos[indice] = {
                ...eventos[indice],
                titulo: titulo,
                data: data,
                anotacao: anotacao
            };
        }
    } else {
        // Cria um novo evento.
        eventos.push({
            id: Date.now(),
            titulo: titulo,
            data: data,
            anotacao: anotacao
        });
    }

    salvarEventos();
    cancelarEdicao();
    renderizarEventos();
});

// Cancela a edição sem alterar o evento.
botaoCancelar.addEventListener("click", cancelarEdicao);

// Exibe os eventos salvos ao abrir o painel.
renderizarEventos();


const botaoTelaCheia = document.getElementById("botao-tela-cheia");

// Ativa ou desativa o modo de tela cheia.
botaoTelaCheia.addEventListener("click", async function() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (erro) {
        alert("Não foi possível ativar a tela cheia neste navegador.");
    }
});

// Mantém o texto do botão sincronizado com o modo atual.
document.addEventListener("fullscreenchange", function() {
    if (document.fullscreenElement) {
        botaoTelaCheia.textContent = "⛶ Sair da tela cheia";
    } else {
        botaoTelaCheia.textContent = "⛶ Ativar tela cheia";
    }
});

// Atualiza os prazos a cada minuto.
setInterval(function() {



    
    renderizarEventos();
}, 60 * 1000);



/* =====================================
   ATUALIZAÇÃO AUTOMÁTICA À MEIA-NOITE
===================================== */

// Agenda a próxima atualização para a meia-noite local.
let temporizadorMeiaNoite;

function agendarAtualizacaoMeiaNoite() {
    clearTimeout(temporizadorMeiaNoite);

    const agora = new Date();
    const proximaMeiaNoite = new Date(agora);

    proximaMeiaNoite.setHours(24, 0, 0, 0);

    const tempoAteMeiaNoite =
        proximaMeiaNoite.getTime() - agora.getTime();

    temporizadorMeiaNoite = setTimeout(function() {
        // Atualiza cartões, resumo e compromissos de hoje.
        renderizarEventos();

        // Agenda a próxima meia-noite.
        agendarAtualizacaoMeiaNoite();
    }, tempoAteMeiaNoite);
}

// Inicia o agendamento.
agendarAtualizacaoMeiaNoite();

// Se a página voltar a ficar visível, atualiza os dados.
// Isso também ajuda quando o computador suspende a atividade.
document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        renderizarEventos();
        agendarAtualizacaoMeiaNoite();
    }
});

/* =====================================
   MODO APRESENTAÇÃO
===================================== */

const botaoApresentacao =
    document.getElementById("botao-apresentacao");

botaoApresentacao.addEventListener("click", function() {
    document.body.classList.toggle("modo-apresentacao");

    const modoAtivo = document.body.classList.contains(
        "modo-apresentacao"
    );

    if (modoAtivo) {
        botaoApresentacao.textContent = "📝 Sair da apresentação";
    } else {
        botaoApresentacao.textContent = "📺 Modo apresentação";
    }
});