/**
 * Lógica da Página de Detalhe da Pergunta (js/pergunta.js)
 * Protótipo SEI Bahia - Etapa 2
 * 
 * REGRAS DE SEGURANÇA E ACESSIBILIDADE:
 * - Apenas js/api.js acessa o localStorage (chamadas via window.SEIForumAPI).
 * - Todo texto inserido com textContent, nunca innerHTML.
 * - Caminhos relativos, sem barra inicial.
 * - Anúncios dinâmicos para leitores de tela via aria-live.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const api = window.SEIForumAPI;
  if (!api) {
    console.error('Módulo SEIForumAPI não encontrado. Certifique-se de que js/api.js foi carregado.');
    return;
  }

  // Extrai o parâmetro ID da URL
  const urlParams = new URLSearchParams(window.location.search);
  const perguntaId = urlParams.get('id');

  // Elementos do DOM
  const feedbackRegion = document.getElementById('feedbackRegion');
  const profileSelector = document.getElementById('profileSelector');
  const activeProfileBadge = document.getElementById('activeProfileBadge');

  const perguntaNaoEncontrada = document.getElementById('perguntaNaoEncontrada');
  const perguntaConteudo = document.getElementById('perguntaConteudo');

  // Bloco da Pergunta
  const blocoPergunta = document.getElementById('blocoPergunta');
  const perguntaBadgePinned = document.getElementById('perguntaBadgePinned');
  const perguntaCategoriaChip = document.getElementById('perguntaCategoriaChip');
  const perguntaStatusBadge = document.getElementById('perguntaStatusBadge');
  const btnEditarPergunta = document.getElementById('btnEditarPergunta');
  const perguntaModActions = document.getElementById('perguntaModActions');
  const perguntaTitulo = document.getElementById('perguntaTitulo');
  const perguntaTexto = document.getElementById('perguntaTexto');
  const perguntaAutorNome = document.getElementById('perguntaAutorNome');
  const perguntaDataRelativa = document.getElementById('perguntaDataRelativa');
  const perguntaEditadaInfo = document.getElementById('perguntaEditadaInfo');

  // Formulário de Edição da Pergunta
  const formEditarPerguntaWrap = document.getElementById('formEditarPerguntaWrap');
  const formEditarPergunta = document.getElementById('formEditarPergunta');
  const editPerguntaTitulo = document.getElementById('editPerguntaTitulo');
  const editPerguntaCategoria = document.getElementById('editPerguntaCategoria');
  const editPerguntaTexto = document.getElementById('editPerguntaTexto');
  const editPerguntaTituloCount = document.getElementById('editPerguntaTituloCount');
  const editPerguntaTextoCount = document.getElementById('editPerguntaTextoCount');
  const erroEditarPergunta = document.getElementById('erroEditarPergunta');
  const btnCancelarEditarPergunta = document.getElementById('btnCancelarEditarPergunta');

  // Seção de Respostas
  const contagemRespostasBadge = document.getElementById('contagemRespostasBadge');
  const listaRespostas = document.getElementById('listaRespostas');
  const emptyRepliesBox = document.getElementById('emptyRepliesBox');

  // Seção de Nova Resposta
  const authNoticeBox = document.getElementById('authNoticeBox');
  const btnQuickLogin = document.getElementById('btnQuickLogin');
  const formNovaRespostaWrapper = document.getElementById('formNovaRespostaWrapper');
  const formNovaResposta = document.getElementById('formNovaResposta');
  const labelNovaResposta = document.getElementById('labelNovaResposta');
  const textoNovaResposta = document.getElementById('textoNovaResposta');
  const novaRespostaCharCount = document.getElementById('novaRespostaCharCount');
  const erroNovaResposta = document.getElementById('erroNovaResposta');
  const btnSubmitResposta = document.getElementById('btnSubmitResposta');

  // Estado Local
  let usuario = await api.usuarioAtual();
  let perguntaAtual = null;

  /* ==========================================================================
     UTILITÁRIOS E ACESSIBILIDADE
     ========================================================================== */

  function anunciar(mensagem) {
    if (feedbackRegion) {
      feedbackRegion.textContent = '';
      setTimeout(() => {
        feedbackRegion.textContent = mensagem;
      }, 50);
    }
  }

  function formatarDataRelativa(dataIso) {
    if (!dataIso) return '';
    const agora = Date.now();
    const data = new Date(dataIso).getTime();
    const seg = Math.max(0, Math.floor((agora - data) / 1000));

    if (seg < 60) return 'Agora mesmo';
    const min = Math.floor(seg / 60);
    if (min < 60) return min === 1 ? 'Há 1 minuto' : `Há ${min} minutos`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return horas === 1 ? 'Há 1 hora' : `Há ${horas} horas`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return dias === 1 ? 'Há 1 dia' : `Há ${dias} dias`;
    const semanas = Math.floor(dias / 7);
    if (semanas < 5) return semanas === 1 ? 'Há 1 semana' : `Há ${semanas} semanas`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return meses === 1 ? 'Há 1 mês' : `Há ${meses} meses`;
    const anos = Math.floor(dias / 365);
    return anos === 1 ? 'Há 1 ano' : `Há ${anos} anos`;
  }

  function formatarDataCompleta(dataIso) {
    if (!dataIso) return '';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dataIso;
    }
  }

  function ehMesmoAutor(usr, autorItem) {
    if (!usr || !autorItem) return false;
    if (usr.id && autorItem.id && usr.id === autorItem.id) return true;
    if (usr.nome && autorItem.nome && usr.nome.trim().toLowerCase() === autorItem.nome.trim().toLowerCase()) return true;
    return false;
  }

  /* ==========================================================================
     SIMULADOR DE PERFIL
     ========================================================================== */

  function renderizarPerfilAtivo() {
    if (profileSelector) {
      profileSelector.value = usuario.id || usuario.papel;
    }

    if (activeProfileBadge) {
      activeProfileBadge.textContent = '';

      const badgeIcon = document.createElement('span');
      badgeIcon.setAttribute('aria-hidden', 'true');
      if (usuario.papel === 'moderador') {
        badgeIcon.textContent = '🛡️';
      } else if (usuario.papel === 'usuario') {
        badgeIcon.textContent = '👤';
      } else {
        badgeIcon.textContent = '🌐';
      }

      const infoContainer = document.createElement('span');
      infoContainer.className = 'profile-badge-text';

      const nomeEl = document.createElement('strong');
      nomeEl.textContent = usuario.nome;

      const orgaoEl = document.createElement('span');
      orgaoEl.className = 'profile-badge-sub';
      orgaoEl.textContent = ` (${usuario.orgao})`;

      infoContainer.appendChild(nomeEl);
      infoContainer.appendChild(orgaoEl);

      activeProfileBadge.appendChild(badgeIcon);
      activeProfileBadge.appendChild(infoContainer);
    }
  }

  async function trocarPerfil(novoPerfilId) {
    try {
      usuario = await api.entrar(novoPerfilId);
      renderizarPerfilAtivo();
      await carregarPerguntaERespostas();
      anunciar(`Perfil alternado para ${usuario.nome} (${usuario.papel}).`);
    } catch (err) {
      console.error('Erro ao alternar perfil:', err);
    }
  }

  if (profileSelector) {
    profileSelector.addEventListener('change', async (e) => {
      await trocarPerfil(e.target.value);
    });
  }

  if (btnQuickLogin) {
    btnQuickLogin.addEventListener('click', async () => {
      await trocarPerfil('usuario');
    });
  }

  const btnResetDados = document.getElementById('btnResetDados');
  if (btnResetDados) {
    btnResetDados.addEventListener('click', async () => {
      const confirmacao = window.confirm(
        'Deseja restaurar as perguntas e respostas originais de exemplo do protótipo?\n\nTodas as alterações salvas neste navegador serão reiniciadas para o padrão inicial.'
      );
      if (!confirmacao) return;

      try {
        await api.resetarDados();
        await carregarPerguntaERespostas();
        anunciar('Dados originais de demonstração restaurados com sucesso.');
      } catch (err) {
        console.error('Erro ao resetar dados:', err);
      }
    });
  }

  /* ==========================================================================
     CARREGAMENTO E RENDERIZAÇÃO DA PÁGINA DA PERGUNTA
     ========================================================================== */

  async function carregarPerguntaERespostas() {
    if (!perguntaId) {
      mostrarNaoEncontrada();
      return;
    }

    perguntaAtual = await api.obterPergunta(perguntaId);

    // Se o id não existir ou a pergunta estiver oculta e o perfil não for moderador:
    if (!perguntaAtual) {
      mostrarNaoEncontrada();
      return;
    }

    // Pergunta encontrada
    if (perguntaNaoEncontrada) perguntaNaoEncontrada.hidden = true;
    if (perguntaConteudo) perguntaConteudo.style.display = 'flex';

    // Atualiza o título da página
    document.title = `${perguntaAtual.titulo} · Fórum SEI Bahia`;

    renderizarBlocoPergunta();
    await renderizarSecaoRespostas();
    renderizarFormularioResposta();
  }

  function mostrarNaoEncontrada() {
    if (perguntaNaoEncontrada) perguntaNaoEncontrada.hidden = false;
    if (perguntaConteudo) perguntaConteudo.style.display = 'none';
    document.title = 'Pergunta não encontrada · Fórum SEI Bahia';
  }

  /* ==========================================================================
     BLOCO DA PERGUNTA
     ========================================================================== */

  function renderizarBlocoPergunta() {
    if (!perguntaAtual) return;

    // Estilos de destaque do cartão
    if (blocoPergunta) {
      if (perguntaAtual.fixada) {
        blocoPergunta.classList.add('is-pinned');
      } else {
        blocoPergunta.classList.remove('is-pinned');
      }

      if (perguntaAtual.status === 'oculta') {
        blocoPergunta.classList.add('is-hidden');
      } else {
        blocoPergunta.classList.remove('is-hidden');
      }
    }

    // Selo de Fixada
    if (perguntaBadgePinned) {
      perguntaBadgePinned.hidden = !perguntaAtual.fixada;
    }

    // Categoria
    if (perguntaCategoriaChip) {
      perguntaCategoriaChip.textContent = perguntaAtual.categoria;
    }

    // Status
    if (perguntaStatusBadge) {
      perguntaStatusBadge.className = `badge-status status-${perguntaAtual.status}`;
      if (perguntaAtual.status === 'aberta') {
        perguntaStatusBadge.textContent = 'Aberta';
      } else if (perguntaAtual.status === 'respondida') {
        perguntaStatusBadge.textContent = 'Respondida';
      } else if (perguntaAtual.status === 'oculta') {
        perguntaStatusBadge.textContent = 'Oculta';
      } else {
        perguntaStatusBadge.textContent = perguntaAtual.status;
      }
    }

    // Título e Texto
    if (perguntaTitulo) {
      perguntaTitulo.textContent = perguntaAtual.titulo;
    }
    if (perguntaTexto) {
      perguntaTexto.textContent = perguntaAtual.texto;
    }

    // Autor e Data
    if (perguntaAutorNome) {
      perguntaAutorNome.textContent = `${perguntaAtual.autor.nome} (${perguntaAtual.autor.orgao})`;
    }
    if (perguntaDataRelativa) {
      perguntaDataRelativa.textContent = formatarDataRelativa(perguntaAtual.data);
      perguntaDataRelativa.title = formatarDataCompleta(perguntaAtual.data);
    }
    if (perguntaEditadaInfo) {
      if (perguntaAtual.editadaEm) {
        perguntaEditadaInfo.hidden = false;
        perguntaEditadaInfo.textContent = `· Editada ${formatarDataRelativa(perguntaAtual.editadaEm)}`;
        perguntaEditadaInfo.title = `Editada em: ${formatarDataCompleta(perguntaAtual.editadaEm)}`;
      } else {
        perguntaEditadaInfo.hidden = true;
      }
    }

    // Permissão para "Editar pergunta": autor ou moderador
    const podeEditarPergunta = usuario.papel === 'moderador' || ehMesmoAutor(usuario, perguntaAtual.autor);
    if (btnEditarPergunta) {
      btnEditarPergunta.style.display = podeEditarPergunta ? 'inline-flex' : 'none';
      btnEditarPergunta.setAttribute('aria-label', `Editar pergunta: ${perguntaAtual.titulo}`);
    }

    // Ações de moderação para Moderador
    if (perguntaModActions) {
      perguntaModActions.innerHTML = '';
      if (usuario.papel === 'moderador') {
        perguntaModActions.style.display = 'inline-flex';

        // Botão Fixar / Desafixar
        const btnFixar = document.createElement('button');
        btnFixar.type = 'button';
        btnFixar.className = 'btn-action-pill';
        btnFixar.textContent = perguntaAtual.fixada ? '📌 Desafixar' : '📌 Fixar';
        btnFixar.setAttribute('aria-label', perguntaAtual.fixada ? 'Desafixar esta pergunta do topo' : 'Fixar esta pergunta no topo');
        btnFixar.addEventListener('click', async () => {
          await api.moderarItem('pergunta', perguntaAtual.id, 'fixar');
          anunciar(perguntaAtual.fixada ? 'Pergunta desafixada.' : 'Pergunta fixada no topo.');
          await carregarPerguntaERespostas();
        });
        perguntaModActions.appendChild(btnFixar);

        // Botão Ocultar / Mostrar
        const btnOcultar = document.createElement('button');
        btnOcultar.type = 'button';
        btnOcultar.className = 'btn-action-pill';
        const estaOculta = perguntaAtual.status === 'oculta';
        btnOcultar.textContent = estaOculta ? '👁️ Mostrar' : '🚫 Ocultar';
        btnOcultar.setAttribute('aria-label', estaOculta ? 'Tornar pergunta pública' : 'Ocultar pergunta da visão pública');
        btnOcultar.addEventListener('click', async () => {
          const acao = estaOculta ? 'mostrar' : 'ocultar';
          await api.moderarItem('pergunta', perguntaAtual.id, acao);
          anunciar(acao === 'mostrar' ? 'Pergunta tornada pública.' : 'Pergunta ocultada.');
          await carregarPerguntaERespostas();
        });
        perguntaModActions.appendChild(btnOcultar);
      } else {
        perguntaModActions.style.display = 'none';
      }
    }
  }

  /* ==========================================================================
     EDIÇÃO DA PERGUNTA (INLINE)
     ========================================================================== */

  function abrirEdicaoPergunta() {
    if (!formEditarPerguntaWrap || !perguntaAtual) return;
    formEditarPerguntaWrap.hidden = false;
    if (btnEditarPergunta) btnEditarPergunta.setAttribute('aria-expanded', 'true');

    if (editPerguntaTitulo) {
      editPerguntaTitulo.value = perguntaAtual.titulo;
      if (editPerguntaTituloCount) editPerguntaTituloCount.textContent = String(editPerguntaTitulo.value.length);
    }
    if (editPerguntaCategoria) {
      editPerguntaCategoria.value = perguntaAtual.categoria;
    }
    if (editPerguntaTexto) {
      editPerguntaTexto.value = perguntaAtual.texto;
      if (editPerguntaTextoCount) editPerguntaTextoCount.textContent = String(editPerguntaTexto.value.length);
    }
    if (erroEditarPergunta) {
      erroEditarPergunta.hidden = true;
      erroEditarPergunta.textContent = '';
    }

    editPerguntaTitulo?.focus();
  }

  function fecharEdicaoPergunta() {
    if (!formEditarPerguntaWrap) return;
    formEditarPerguntaWrap.hidden = true;
    if (btnEditarPergunta) {
      btnEditarPergunta.setAttribute('aria-expanded', 'false');
      btnEditarPergunta.focus();
    }
    if (erroEditarPergunta) {
      erroEditarPergunta.hidden = true;
      erroEditarPergunta.textContent = '';
    }
  }

  if (btnEditarPergunta) {
    btnEditarPergunta.addEventListener('click', () => {
      if (formEditarPerguntaWrap && formEditarPerguntaWrap.hidden) {
        abrirEdicaoPergunta();
      } else {
        fecharEdicaoPergunta();
      }
    });
  }

  if (btnCancelarEditarPergunta) {
    btnCancelarEditarPergunta.addEventListener('click', fecharEdicaoPergunta);
  }

  if (editPerguntaTitulo && editPerguntaTituloCount) {
    editPerguntaTitulo.addEventListener('input', () => {
      editPerguntaTituloCount.textContent = String(editPerguntaTitulo.value.length);
    });
  }

  if (editPerguntaTexto && editPerguntaTextoCount) {
    editPerguntaTexto.addEventListener('input', () => {
      editPerguntaTextoCount.textContent = String(editPerguntaTexto.value.length);
    });
  }

  if (formEditarPergunta) {
    formEditarPergunta.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!perguntaAtual) return;

      const titulo = editPerguntaTitulo ? editPerguntaTitulo.value.trim() : '';
      const categoria = editPerguntaCategoria ? editPerguntaCategoria.value.trim() : '';
      const texto = editPerguntaTexto ? editPerguntaTexto.value.trim() : '';

      if (erroEditarPergunta) erroEditarPergunta.hidden = true;

      try {
        const atualizada = await api.editarPergunta(perguntaAtual.id, { titulo, texto, categoria });
        perguntaAtual = atualizada;
        fecharEdicaoPergunta();
        renderizarBlocoPergunta();
        anunciar('Pergunta atualizada com sucesso!');
      } catch (err) {
        if (erroEditarPergunta) {
          erroEditarPergunta.hidden = false;
          erroEditarPergunta.textContent = err.message || 'Erro ao atualizar a pergunta.';
        }
      }
    });
  }

  /* ==========================================================================
     SEÇÃO E LISTA DE RESPOSTAS
     ========================================================================== */

  async function renderizarSecaoRespostas() {
    if (!perguntaAtual || !listaRespostas) return;

    listaRespostas.innerHTML = '';
    const respostas = await api.listarRespostas(perguntaAtual.id);

    if (contagemRespostasBadge) {
      contagemRespostasBadge.textContent = `(${respostas.length})`;
    }

    if (respostas.length === 0) {
      if (emptyRepliesBox) emptyRepliesBox.hidden = false;
      return;
    }

    if (emptyRepliesBox) emptyRepliesBox.hidden = true;

    // Verifica se já existe uma resposta aceita no conjunto
    const temRespostaAceita = respostas.some(r => r.aceita);

    // Permissões em relação à pergunta
    const ehModerador = usuario.papel === 'moderador';
    const ehAutorPergunta = ehMesmoAutor(usuario, perguntaAtual.autor);
    const podeAceitarResposta = ehModerador || ehAutorPergunta;

    respostas.forEach(resp => {
      const card = criarCardResposta(resp, {
        temRespostaAceita,
        podeAceitarResposta,
        ehModerador
      });
      listaRespostas.appendChild(card);
    });
  }

  function criarCardResposta(resp, { temRespostaAceita, podeAceitarResposta, ehModerador }) {
    const card = document.createElement('article');
    card.className = 'response-card';
    card.id = `resposta-${resp.id}`;

    if (resp.aceita) {
      card.classList.add('response-accepted');
    }
    if (resp.status === 'oculta') {
      card.classList.add('is-hidden');
    }

    // Cabeçalho da Resposta: Autor, Data e Selos
    const header = document.createElement('div');
    header.className = 'response-header';

    const authorBox = document.createElement('div');
    authorBox.className = 'response-author-box';

    const authorEl = document.createElement('span');
    authorEl.className = 'response-author-name';
    const authorIcon = document.createElement('span');
    authorIcon.setAttribute('aria-hidden', 'true');
    authorIcon.textContent = resp.autor.papel === 'moderador' ? '🛡️ ' : '👤 ';
    const authorName = document.createElement('span');
    authorName.textContent = resp.autor.nome;
    const authorOrg = document.createElement('span');
    authorOrg.className = 'response-author-org';
    authorOrg.textContent = ` · ${resp.autor.orgao}`;

    authorEl.appendChild(authorIcon);
    authorEl.appendChild(authorName);
    authorEl.appendChild(authorOrg);
    authorBox.appendChild(authorEl);

    // Data relativa
    const dateEl = document.createElement('span');
    dateEl.className = 'response-date';
    dateEl.title = formatarDataCompleta(resp.data);
    const dateIcon = document.createElement('span');
    dateIcon.setAttribute('aria-hidden', 'true');
    dateIcon.textContent = '🕒 ';
    const dateText = document.createElement('span');
    dateText.textContent = formatarDataRelativa(resp.data);
    dateEl.appendChild(dateIcon);
    dateEl.appendChild(dateText);
    authorBox.appendChild(dateEl);

    header.appendChild(authorBox);

    // Badges da Resposta: "Resposta aceita" e "Oculta"
    const badgesWrap = document.createElement('div');
    badgesWrap.className = 'response-badges-wrap';

    if (resp.aceita) {
      const badgeAceita = document.createElement('span');
      badgeAceita.className = 'badge-accepted';
      badgeAceita.setAttribute('role', 'status');
      badgeAceita.textContent = '✓ Resposta aceita';
      badgesWrap.appendChild(badgeAceita);
    }

    if (resp.status === 'oculta' && ehModerador) {
      const badgeOculta = document.createElement('span');
      badgeOculta.className = 'badge-status status-oculta';
      badgeOculta.textContent = 'Oculta';
      badgesWrap.appendChild(badgeOculta);
    }

    header.appendChild(badgesWrap);
    card.appendChild(header);

    // Corpo da Resposta (Texto)
    const bodyP = document.createElement('p');
    bodyP.className = 'response-body';
    bodyP.id = `texto-corpo-${resp.id}`;
    bodyP.textContent = resp.texto;
    card.appendChild(bodyP);

    // Formulário Inline de Edição da Resposta (Oculto inicialmente)
    const editFormWrap = document.createElement('div');
    editFormWrap.className = 'inline-edit-box';
    editFormWrap.id = `edit-form-wrap-${resp.id}`;
    editFormWrap.hidden = true;

    const editForm = document.createElement('form');
    editForm.noValidate = true;

    const editFormGroup = document.createElement('div');
    editFormGroup.className = 'form-group';

    const editLabel = document.createElement('label');
    editLabel.htmlFor = `edit-input-${resp.id}`;
    editLabel.textContent = `Editar resposta de ${resp.autor.nome}:`;

    const editTextarea = document.createElement('textarea');
    editTextarea.id = `edit-input-${resp.id}`;
    editTextarea.rows = 4;
    editTextarea.maxLength = 2000;
    editTextarea.required = true;
    editTextarea.value = resp.texto;

    const editCounter = document.createElement('div');
    editCounter.className = 'char-counter';
    const editCountSpan = document.createElement('span');
    editCountSpan.textContent = String(resp.texto.length);
    editCounter.appendChild(editCountSpan);
    editCounter.appendChild(document.createTextNode(' / 2000 caracteres'));

    editTextarea.addEventListener('input', () => {
      editCountSpan.textContent = String(editTextarea.value.length);
    });

    editFormGroup.appendChild(editLabel);
    editFormGroup.appendChild(editTextarea);
    editFormGroup.appendChild(editCounter);

    const editErrorBox = document.createElement('div');
    editErrorBox.className = 'form-error';
    editErrorBox.hidden = true;
    editErrorBox.setAttribute('role', 'alert');
    editErrorBox.setAttribute('aria-live', 'polite');

    const editActions = document.createElement('div');
    editActions.className = 'form-actions';

    const btnSalvarEdicao = document.createElement('button');
    btnSalvarEdicao.type = 'submit';
    btnSalvarEdicao.className = 'btn-submit';
    btnSalvarEdicao.textContent = 'Salvar';

    const btnCancelarEdicao = document.createElement('button');
    btnCancelarEdicao.type = 'button';
    btnCancelarEdicao.className = 'btn-cancel';
    btnCancelarEdicao.textContent = 'Cancelar';

    btnCancelarEdicao.addEventListener('click', () => {
      editFormWrap.hidden = true;
      bodyP.hidden = false;
    });

    editActions.appendChild(btnSalvarEdicao);
    editActions.appendChild(btnCancelarEdicao);

    editForm.appendChild(editFormGroup);
    editForm.appendChild(editErrorBox);
    editForm.appendChild(editActions);
    editFormWrap.appendChild(editForm);

    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const novoTexto = editTextarea.value.trim();
      if (!novoTexto) {
        editErrorBox.hidden = false;
        editErrorBox.textContent = 'O texto da resposta não pode ficar vazio.';
        return;
      }
      try {
        btnSalvarEdicao.disabled = true;
        await api.editarResposta(resp.id, novoTexto);
        bodyP.textContent = novoTexto;
        editFormWrap.hidden = true;
        bodyP.hidden = false;
        anunciar(`Resposta de ${resp.autor.nome} atualizada.`);
        await carregarPerguntaERespostas();
      } catch (err) {
        editErrorBox.hidden = false;
        editErrorBox.textContent = err.message || 'Erro ao editar a resposta.';
      } finally {
        btnSalvarEdicao.disabled = false;
      }
    });

    card.appendChild(editFormWrap);

    // Barra de Ações da Resposta
    const actionsBar = document.createElement('div');
    actionsBar.className = 'response-actions-bar';

    // Ações do Autor da Resposta: "Editar" e "Excluir"
    const ehAutorResposta = ehMesmoAutor(usuario, resp.autor);
    const podeEditarExcluir = ehModerador || ehAutorResposta;

    const authorActionsGroup = document.createElement('div');
    authorActionsGroup.className = 'response-author-actions';

    if (podeEditarExcluir) {
      // Botão Editar
      const btnEditarResp = document.createElement('button');
      btnEditarResp.type = 'button';
      btnEditarResp.className = 'btn-reply-action';
      btnEditarResp.textContent = '✏️ Editar';
      btnEditarResp.setAttribute('aria-label', `Editar resposta de ${resp.autor.nome}`);
      btnEditarResp.addEventListener('click', () => {
        const estaAberto = !editFormWrap.hidden;
        if (estaAberto) {
          editFormWrap.hidden = true;
          bodyP.hidden = false;
        } else {
          editFormWrap.hidden = false;
          bodyP.hidden = true;
          editTextarea.value = resp.texto;
          editCountSpan.textContent = String(resp.texto.length);
          editErrorBox.hidden = true;
          editTextarea.focus();
        }
      });
      authorActionsGroup.appendChild(btnEditarResp);

      // Botão Excluir (com confirmação prévia)
      const btnExcluirResp = document.createElement('button');
      btnExcluirResp.type = 'button';
      btnExcluirResp.className = 'btn-reply-action btn-delete';
      btnExcluirResp.textContent = '🗑️ Excluir';
      btnExcluirResp.setAttribute('aria-label', `Excluir resposta de ${resp.autor.nome}`);
      btnExcluirResp.addEventListener('click', async () => {
        const confirmacao = window.confirm(
          `Deseja realmente excluir esta resposta de ${resp.autor.nome}?\n\nEsta ação removerá a resposta permanentemente.`
        );
        if (!confirmacao) return;

        try {
          await api.excluirResposta(resp.id);
          anunciar('Resposta excluída com sucesso.');
          await carregarPerguntaERespostas();
        } catch (err) {
          alert(err.message || 'Erro ao excluir resposta.');
        }
      });
      authorActionsGroup.appendChild(btnExcluirResp);
    }

    // Ações de moderação para moderador (Ocultar / Mostrar resposta)
    if (ehModerador) {
      const btnModResp = document.createElement('button');
      btnModResp.type = 'button';
      btnModResp.className = 'btn-reply-action';
      const estaOculta = resp.status === 'oculta';
      btnModResp.textContent = estaOculta ? '👁️ Mostrar' : '🚫 Ocultar';
      btnModResp.setAttribute('aria-label', estaOculta ? `Tornar visível resposta de ${resp.autor.nome}` : `Ocultar resposta de ${resp.autor.nome}`);
      btnModResp.addEventListener('click', async () => {
        const acao = estaOculta ? 'mostrar' : 'ocultar';
        await api.moderarItem('resposta', resp.id, acao);
        anunciar(acao === 'mostrar' ? 'Resposta tornada pública.' : 'Resposta ocultada.');
        await carregarPerguntaERespostas();
      });
      authorActionsGroup.appendChild(btnModResp);
    }

    actionsBar.appendChild(authorActionsGroup);

    // Botão "Aceitar resposta" / "Trocar para esta"
    // Visível só para o autor da pergunta e para o moderador
    if (podeAceitarResposta) {
      const acceptGroup = document.createElement('div');

      if (!resp.aceita) {
        const btnAceitar = document.createElement('button');
        btnAceitar.type = 'button';
        btnAceitar.className = 'btn-accept-reply';

        const textoBotao = temRespostaAceita ? 'Trocar para esta' : 'Aceitar resposta';
        btnAceitar.textContent = `✓ ${textoBotao}`;
        btnAceitar.setAttribute(
          'aria-label',
          temRespostaAceita
            ? `Trocar resposta aceita para resposta de ${resp.autor.nome}`
            : `Aceitar resposta de ${resp.autor.nome}`
        );

        btnAceitar.addEventListener('click', async () => {
          try {
            btnAceitar.disabled = true;
            await api.aceitarResposta(resp.id);
            anunciar(`Resposta de ${resp.autor.nome} marcada como resposta aceita!`);
            await carregarPerguntaERespostas();
          } catch (err) {
            alert(err.message || 'Erro ao aceitar resposta.');
            btnAceitar.disabled = false;
          }
        });

        acceptGroup.appendChild(btnAceitar);
      }

      actionsBar.appendChild(acceptGroup);
    }

    card.appendChild(actionsBar);

    return card;
  }

  /* ==========================================================================
     FORMULÁRIO "SUA RESPOSTA"
     ========================================================================== */

  function renderizarFormularioResposta() {
    if (usuario.papel === 'visitante') {
      if (authNoticeBox) authNoticeBox.hidden = false;
      if (formNovaRespostaWrapper) formNovaRespostaWrapper.style.display = 'none';
    } else {
      if (authNoticeBox) authNoticeBox.hidden = true;
      if (formNovaRespostaWrapper) formNovaRespostaWrapper.style.display = 'flex';

      if (labelNovaResposta) {
        labelNovaResposta.textContent = '';
        const strongEl = document.createElement('strong');
        strongEl.textContent = `${usuario.nome} (${usuario.orgao})`;
        labelNovaResposta.appendChild(document.createTextNode('Sua resposta como '));
        labelNovaResposta.appendChild(strongEl);
        const reqSpan = document.createElement('span');
        reqSpan.className = 'req';
        reqSpan.setAttribute('aria-hidden', 'true');
        reqSpan.textContent = ' *';
        labelNovaResposta.appendChild(reqSpan);
      }
    }
  }

  // Contador de caracteres do formulário de resposta
  if (textoNovaResposta && novaRespostaCharCount) {
    textoNovaResposta.addEventListener('input', () => {
      novaRespostaCharCount.textContent = String(textoNovaResposta.value.length);
    });
  }

  // Envio de nova resposta
  if (formNovaResposta) {
    formNovaResposta.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!perguntaAtual) return;

      if (erroNovaResposta) {
        erroNovaResposta.hidden = true;
        erroNovaResposta.textContent = '';
      }

      const texto = textoNovaResposta ? textoNovaResposta.value.trim() : '';
      if (!texto) {
        if (erroNovaResposta) {
          erroNovaResposta.hidden = false;
          erroNovaResposta.textContent = 'Por favor, escreva a sua resposta antes de publicar.';
        }
        textoNovaResposta?.focus();
        return;
      }

      if (texto.length > 2000) {
        if (erroNovaResposta) {
          erroNovaResposta.hidden = false;
          erroNovaResposta.textContent = 'A resposta não pode ultrapassar 2000 caracteres.';
        }
        textoNovaResposta?.focus();
        return;
      }

      try {
        if (btnSubmitResposta) {
          btnSubmitResposta.disabled = true;
          btnSubmitResposta.textContent = 'Publicando...';
        }

        await api.criarResposta(perguntaAtual.id, texto);

        if (textoNovaResposta) textoNovaResposta.value = '';
        if (novaRespostaCharCount) novaRespostaCharCount.textContent = '0';

        await carregarPerguntaERespostas();
        anunciar('Resposta publicada com sucesso!');

        // Rola suavemente até a seção de respostas
        const secaoRespostas = document.getElementById('secaoRespostas');
        if (secaoRespostas) {
          secaoRespostas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        if (erroNovaResposta) {
          erroNovaResposta.hidden = false;
          erroNovaResposta.textContent = err.message || 'Erro ao publicar resposta. Tente novamente.';
        }
      } finally {
        if (btnSubmitResposta) {
          btnSubmitResposta.disabled = false;
          btnSubmitResposta.textContent = 'Publicar Resposta';
        }
      }
    });
  }

  /* ==========================================================================
     INICIALIZAÇÃO DA PÁGINA
     ========================================================================== */

  renderizarPerfilAtivo();
  await carregarPerguntaERespostas();
});
