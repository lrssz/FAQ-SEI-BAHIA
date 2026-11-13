/**
 * Interface do Fórum SEI Bahia (js/forum.js)
 * Protótipo de Demonstração - Etapa 1
 * 
 * REGRA ABSOLUTA DE SEGURANÇA:
 * - Nenhum acesso direto a localStorage (apenas via window.SEIForumAPI)
 * - Todo texto do usuário inserido exclusivamente via textContent (prevenção contra XSS)
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // Referência para a API
  const api = window.SEIForumAPI;
  if (!api) {
    console.error('Módulo SEIForumAPI não encontrado. Certifique-se de que js/api.js foi carregado.');
    return;
  }

  // Elementos do DOM
  const feedbackRegion = document.getElementById('feedbackRegion');
  const profileSelector = document.getElementById('profileSelector');
  const activeProfileBadge = document.getElementById('activeProfileBadge');
  const btnResetDados = document.getElementById('btnResetDados');
  
  const buscaInput = document.getElementById('buscaForum');
  const clearBtn = document.getElementById('clearBtnForum');
  const chipsCategorias = document.getElementById('chipsCategorias');
  const chipsStatus = document.getElementById('chipsStatus');
  
  const resultsCount = document.getElementById('forumResultsCount');
  const listaPerguntas = document.getElementById('listaPerguntas');
  const emptyState = document.getElementById('forumEmptyState');
  const btnResetSearch = document.getElementById('btnResetSearch');
  
  const authNoticeContainer = document.getElementById('authNoticeContainer');
  const btnOpenNewQuestion = document.getElementById('btnOpenNewQuestion');
  const newQuestionSection = document.getElementById('newQuestionSection');
  const formNovaPergunta = document.getElementById('formNovaPergunta');
  const inputTitulo = document.getElementById('novoTitulo');
  const selectCategoria = document.getElementById('novaCategoria');
  const inputTexto = document.getElementById('novoTexto');
  const tituloCount = document.getElementById('tituloCharCount');
  const textoCount = document.getElementById('textoCharCount');
  const formError = document.getElementById('formError');
  const btnCancelForm = document.getElementById('btnCancelForm');

  // Estado da Aplicação
  let usuario = await api.usuarioAtual();
  let categoriaAtiva = 'Todos';
  let statusAtivo = 'todos';
  let termoBusca = '';
  let perguntasCarregadas = [];

  /* ==========================================================================
     UTILITÁRIOS E ACESSIBILIDADE
     ========================================================================== */

  // Anúncio amigável em leitor de tela
  function anunciar(mensagem) {
    if (feedbackRegion) {
      feedbackRegion.textContent = '';
      setTimeout(() => {
        feedbackRegion.textContent = mensagem;
      }, 50);
    }
  }

  // Formatação de data relativa humanizada em português
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

  // Data e hora completas para o atributo title (tooltip acessível)
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

  /* ==========================================================================
     GERENCIAMENTO DE PERFIL (SIMULADOR DE LOGIN)
     ========================================================================== */

  function renderizarPerfilAtivo() {
    if (profileSelector) {
      profileSelector.value = usuario.id || usuario.papel;
    }

    if (activeProfileBadge) {
      activeProfileBadge.textContent = '';
      
      const badgeIcon = document.createElement('span');
      badgeIcon.className = 'profile-badge-icon';
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

    // Controle de visibilidade da área de Nova Pergunta
    if (usuario.papel === 'visitante') {
      if (btnOpenNewQuestion) btnOpenNewQuestion.style.display = 'none';
      if (authNoticeContainer) {
        authNoticeContainer.style.display = 'flex';
        authNoticeContainer.innerHTML = '';

        const noticeIcon = document.createElement('span');
        noticeIcon.className = 'auth-notice-icon';
        noticeIcon.setAttribute('aria-hidden', 'true');
        noticeIcon.textContent = '🔒';

        const noticeMsg = document.createElement('span');
        noticeMsg.className = 'auth-notice-msg';
        noticeMsg.textContent = 'Entre como usuário para perguntar.';

        const quickLoginBtn = document.createElement('button');
        quickLoginBtn.type = 'button';
        quickLoginBtn.className = 'btn-quick-login';
        quickLoginBtn.textContent = 'Simular login como Maria Souza';
        quickLoginBtn.addEventListener('click', async () => {
          await trocarPerfil('usuario');
        });

        authNoticeContainer.appendChild(noticeIcon);
        authNoticeContainer.appendChild(noticeMsg);
        authNoticeContainer.appendChild(quickLoginBtn);
      }
      if (newQuestionSection) newQuestionSection.hidden = true;
    } else {
      if (authNoticeContainer) authNoticeContainer.style.display = 'none';
      if (btnOpenNewQuestion) {
        btnOpenNewQuestion.style.display = 'inline-flex';
        btnOpenNewQuestion.setAttribute('aria-expanded', newQuestionSection && !newQuestionSection.hidden ? 'true' : 'false');
      }
    }
  }

  async function trocarPerfil(novoPerfilId) {
    try {
      usuario = await api.entrar(novoPerfilId);
      
      // Se era 'oculta' e saiu de moderador, redefinir filtro de status
      if (usuario.papel !== 'moderador' && statusAtivo === 'oculta') {
        statusAtivo = 'todos';
      }

      renderizarPerfilAtivo();
      await atualizarFiltrosERenderizar();
      anunciar(`Perfil alternado para ${usuario.nome} (${usuario.papel}).`);
    } catch (err) {
      console.error('Erro ao trocar perfil:', err);
    }
  }

  if (profileSelector) {
    profileSelector.addEventListener('change', async (e) => {
      await trocarPerfil(e.target.value);
    });
  }

  if (btnResetDados) {
    btnResetDados.addEventListener('click', async () => {
      const confirmacao = window.confirm(
        'Deseja restaurar as perguntas e respostas originais de exemplo do protótipo?\n\nTodas as alterações salvas neste navegador serão reiniciadas para o padrão inicial.'
      );
      if (!confirmacao) return;

      try {
        await api.resetarDados();
        termoBusca = '';
        if (buscaInput) buscaInput.value = '';
        categoriaAtiva = 'Todos';
        statusAtivo = 'todos';
        
        await atualizarFiltrosERenderizar();
        anunciar('Dados originais de demonstração restaurados com sucesso.');
      } catch (err) {
        console.error('Erro ao resetar dados:', err);
      }
    });
  }

  /* ==========================================================================
     CHIPS DE CATEGORIA E STATUS
     ========================================================================== */

  async function renderizarChips() {
    // Busca base completa para contagens
    const basePerguntas = await api.listarPerguntas({
      busca: '',
      status: 'todos',
      categoria: 'Todos'
    });

    // 1. Chips de Categoria
    if (chipsCategorias) {
      chipsCategorias.innerHTML = '';
      const todasCategorias = ['Todos', ...api.CATEGORIAS];

      todasCategorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn';
        btn.setAttribute('aria-pressed', cat === categoriaAtiva ? 'true' : 'false');

        const labelSpan = document.createElement('span');
        labelSpan.textContent = cat;

        const countSpan = document.createElement('span');
        countSpan.className = 'chip-count';
        const total = cat === 'Todos'
          ? basePerguntas.length
          : basePerguntas.filter(p => p.categoria === cat).length;
        countSpan.textContent = String(total);

        btn.appendChild(labelSpan);
        btn.appendChild(countSpan);

        btn.addEventListener('click', () => {
          categoriaAtiva = cat;
          [...chipsCategorias.children].forEach(c => {
            c.setAttribute('aria-pressed', c === btn ? 'true' : 'false');
          });
          atualizarFiltrosERenderizar();
        });

        chipsCategorias.appendChild(btn);
      });
    }

    // 2. Chips de Status
    if (chipsStatus) {
      chipsStatus.innerHTML = '';
      const opcoesStatus = [
        { id: 'todos', label: 'Todos os status' },
        { id: 'aberta', label: 'Abertas' },
        { id: 'respondida', label: 'Respondidas' }
      ];

      // Ocultas só aparecem para moderador
      if (usuario.papel === 'moderador') {
        opcoesStatus.push({ id: 'oculta', label: 'Ocultas' });
      }

      opcoesStatus.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn';
        btn.setAttribute('aria-pressed', opt.id === statusAtivo ? 'true' : 'false');

        const labelSpan = document.createElement('span');
        labelSpan.textContent = opt.label;

        const countSpan = document.createElement('span');
        countSpan.className = 'chip-count';
        const total = opt.id === 'todos'
          ? basePerguntas.length
          : basePerguntas.filter(p => p.status === opt.id).length;
        countSpan.textContent = String(total);

        btn.appendChild(labelSpan);
        btn.appendChild(countSpan);

        btn.addEventListener('click', () => {
          statusAtivo = opt.id;
          [...chipsStatus.children].forEach(c => {
            c.setAttribute('aria-pressed', c === btn ? 'true' : 'false');
          });
          atualizarFiltrosERenderizar();
        });

        chipsStatus.appendChild(btn);
      });
    }
  }

  /* ==========================================================================
     CONSTRUÇÃO DO CARD DE PERGUNTA (SEGURANÇA COM textContent)
     ========================================================================== */

  function criarCardPergunta(pergunta) {
    const card = document.createElement('article');
    card.className = 'forum-card';
    card.id = `card-${pergunta.id}`;
    if (pergunta.fixada) card.classList.add('is-pinned');
    if (pergunta.status === 'oculta') card.classList.add('is-hidden');

    // Cabeçalho do Card: Selos e Moderação
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    const badgesWrap = document.createElement('div');
    badgesWrap.className = 'card-badges';

    // Selo de Pergunta Fixada
    if (pergunta.fixada) {
      const pinBadge = document.createElement('span');
      pinBadge.className = 'badge-pinned';
      pinBadge.title = 'Pergunta fixada no topo da lista';
      
      const pinIcon = document.createElement('span');
      pinIcon.setAttribute('aria-hidden', 'true');
      pinIcon.textContent = '📌';

      const pinText = document.createElement('span');
      pinText.textContent = ' Fixada';

      pinBadge.appendChild(pinIcon);
      pinBadge.appendChild(pinText);
      badgesWrap.appendChild(pinBadge);
    }

    // Chip de Categoria
    const catBadge = document.createElement('span');
    catBadge.className = 'card-cat-badge';
    catBadge.textContent = pergunta.categoria;
    badgesWrap.appendChild(catBadge);

    // Selo de Status
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge-status status-${pergunta.status}`;
    if (pergunta.status === 'aberta') {
      statusBadge.textContent = 'Aberta';
    } else if (pergunta.status === 'respondida') {
      statusBadge.textContent = 'Respondida';
    } else if (pergunta.status === 'oculta') {
      statusBadge.textContent = 'Oculta';
    } else {
      statusBadge.textContent = pergunta.status;
    }
    badgesWrap.appendChild(statusBadge);

    cardHeader.appendChild(badgesWrap);

    // Controles de Moderação rápidos para o Moderador
    if (usuario.papel === 'moderador') {
      const modActions = document.createElement('div');
      modActions.className = 'mod-actions';

      // Fixar / Desafixar
      const btnFixar = document.createElement('button');
      btnFixar.type = 'button';
      btnFixar.className = 'btn-mod';
      btnFixar.title = pergunta.fixada ? 'Desafixar pergunta' : 'Fixar pergunta no topo';
      btnFixar.textContent = pergunta.fixada ? '📌 Desafixar' : '📌 Fixar';
      btnFixar.addEventListener('click', async (e) => {
        e.stopPropagation();
        await api.moderarItem('pergunta', pergunta.id, 'fixar');
        anunciar(pergunta.fixada ? 'Pergunta desafixada.' : 'Pergunta fixada no topo.');
        await atualizarFiltrosERenderizar();
      });
      modActions.appendChild(btnFixar);

      // Ocultar / Mostrar
      const btnOcultar = document.createElement('button');
      btnOcultar.type = 'button';
      btnOcultar.className = 'btn-mod';
      btnOcultar.title = pergunta.status === 'oculta' ? 'Tornar pergunta pública' : 'Ocultar pergunta';
      btnOcultar.textContent = pergunta.status === 'oculta' ? '👁️ Mostrar' : '🚫 Ocultar';
      btnOcultar.addEventListener('click', async (e) => {
        e.stopPropagation();
        const acao = pergunta.status === 'oculta' ? 'mostrar' : 'ocultar';
        await api.moderarItem('pergunta', pergunta.id, acao);
        anunciar(acao === 'mostrar' ? 'Pergunta tornada pública.' : 'Pergunta ocultada.');
        await atualizarFiltrosERenderizar();
      });
      modActions.appendChild(btnOcultar);

      // Marcar Respondida se estiver aberta
      if (pergunta.status === 'aberta') {
        const btnResolver = document.createElement('button');
        btnResolver.type = 'button';
        btnResolver.className = 'btn-mod btn-mod-resolve';
        btnResolver.title = 'Marcar como respondida';
        btnResolver.textContent = '✓ Resolvida';
        btnResolver.addEventListener('click', async (e) => {
          e.stopPropagation();
          await api.moderarItem('pergunta', pergunta.id, 'marcarRespondida');
          anunciar('Pergunta marcada como respondida.');
          await atualizarFiltrosERenderizar();
        });
        modActions.appendChild(btnResolver);
      }

      cardHeader.appendChild(modActions);
    }

    card.appendChild(cardHeader);

    // Título da Pergunta (Link para a página da pergunta)
    const titleEl = document.createElement('h3');
    titleEl.className = 'card-title';
    const titleLink = document.createElement('a');
    titleLink.href = `pergunta.html?id=${encodeURIComponent(pergunta.id)}`;
    titleLink.className = 'card-title-link';
    titleLink.style.color = 'inherit';
    titleLink.style.textDecoration = 'none';
    titleLink.textContent = pergunta.titulo;
    titleEl.appendChild(titleLink);
    card.appendChild(titleEl);

    // Trecho do texto (preview)
    const snippetEl = document.createElement('p');
    snippetEl.className = 'card-snippet';
    const textoLimpo = pergunta.texto || '';
    snippetEl.textContent = textoLimpo.length > 175 ? textoLimpo.substring(0, 175) + '…' : textoLimpo;
    card.appendChild(snippetEl);

    // Metadados do Rodapé
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-meta';

    const metaInfo = document.createElement('div');
    metaInfo.className = 'meta-info-group';

    // Autor
    const authorEl = document.createElement('span');
    authorEl.className = 'card-author';
    const authorIcon = document.createElement('span');
    authorIcon.className = 'meta-icon';
    authorIcon.setAttribute('aria-hidden', 'true');
    authorIcon.textContent = '👤';
    const authorText = document.createElement('span');
    authorText.textContent = `${pergunta.autor.nome} · ${pergunta.autor.orgao}`;
    authorEl.appendChild(authorIcon);
    authorEl.appendChild(authorText);
    metaInfo.appendChild(authorEl);

    // Data relativa
    const dateEl = document.createElement('span');
    dateEl.className = 'card-date';
    dateEl.title = formatarDataCompleta(pergunta.data);
    const dateIcon = document.createElement('span');
    dateIcon.className = 'meta-icon';
    dateIcon.setAttribute('aria-hidden', 'true');
    dateIcon.textContent = '🕒';
    const dateText = document.createElement('span');
    dateText.textContent = formatarDataRelativa(pergunta.data);
    dateEl.appendChild(dateIcon);
    dateEl.appendChild(dateText);
    metaInfo.appendChild(dateEl);

    cardFooter.appendChild(metaInfo);

    // Quantidade de Respostas e Link para a Página da Pergunta
    const repliesMeta = document.createElement('div');
    repliesMeta.className = 'card-replies-group';

    const repliesLink = document.createElement('a');
    repliesLink.href = `pergunta.html?id=${encodeURIComponent(pergunta.id)}`;
    repliesLink.className = 'btn-toggle-replies';
    repliesLink.style.textDecoration = 'none';
    const tot = pergunta.respostasCount || 0;
    repliesLink.setAttribute('aria-label', `Ver detalhes e ${tot === 1 ? '1 resposta' : tot + ' respostas'} para: ${pergunta.titulo}`);

    const countIcon = document.createElement('span');
    countIcon.setAttribute('aria-hidden', 'true');
    countIcon.textContent = '💬 ';

    const countText = document.createElement('span');
    countText.textContent = tot === 1 ? '1 resposta' : `${tot} respostas`;

    const chevron = document.createElement('span');
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = ' →';

    repliesLink.appendChild(countIcon);
    repliesLink.appendChild(countText);
    repliesLink.appendChild(chevron);

    repliesMeta.appendChild(repliesLink);
    cardFooter.appendChild(repliesMeta);

    card.appendChild(cardFooter);

    // Tornar todo o cartão clicável para a página da pergunta
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, a')) return;
      window.location.href = `pergunta.html?id=${encodeURIComponent(pergunta.id)}`;
    });

    return card;
  }

  /* ==========================================================================
     ATUALIZAÇÃO DA LISTA DE PERGUNTAS E BUSCA EM TEMPO REAL
     ========================================================================== */

  async function atualizarFiltrosERenderizar() {
    await renderizarChips();

    perguntasCarregadas = await api.listarPerguntas({
      busca: termoBusca,
      status: statusAtivo,
      categoria: categoriaAtiva
    });

    listaPerguntas.innerHTML = '';

    if (clearBtn) {
      clearBtn.style.display = buscaInput && buscaInput.value.length > 0 ? 'inline-flex' : 'none';
    }

    // Contagem de Resultados
    if (resultsCount) {
      if (perguntasCarregadas.length === 0) {
        resultsCount.textContent = 'Nenhuma pergunta encontrada';
      } else if (perguntasCarregadas.length === 1) {
        resultsCount.textContent = 'Exibindo 1 pergunta';
      } else {
        resultsCount.textContent = `Exibindo ${perguntasCarregadas.length} perguntas`;
      }
    }

    // Estado Vazio
    if (emptyState) {
      emptyState.hidden = perguntasCarregadas.length > 0;
    }

    // Renderiza cada Card
    perguntasCarregadas.forEach(p => {
      const card = criarCardPergunta(p);
      listaPerguntas.appendChild(card);
    });
  }

  // Evento de digitação na busca em tempo real
  if (buscaInput) {
    buscaInput.addEventListener('input', () => {
      termoBusca = buscaInput.value;
      atualizarFiltrosERenderizar();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (buscaInput) {
        buscaInput.value = '';
        termoBusca = '';
        buscaInput.focus();
        atualizarFiltrosERenderizar();
      }
    });
  }

  // Redefinir filtros no botão do estado vazio
  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (buscaInput) buscaInput.value = '';
      termoBusca = '';
      categoriaAtiva = 'Todos';
      statusAtivo = 'todos';
      atualizarFiltrosERenderizar();
      if (buscaInput) buscaInput.focus();
    });
  }

  // Tecla ESC para limpar busca
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === buscaInput) {
      if (buscaInput.value.length > 0) {
        buscaInput.value = '';
        termoBusca = '';
        atualizarFiltrosERenderizar();
      }
    }
  });

  /* ==========================================================================
     FORMULÁRIO DE NOVA PERGUNTA
     ========================================================================== */

  function abrirFormulario() {
    if (newQuestionSection) {
      newQuestionSection.hidden = false;
      if (btnOpenNewQuestion) btnOpenNewQuestion.setAttribute('aria-expanded', 'true');
      if (inputTitulo) {
        inputTitulo.focus();
      }
    }
  }

  function fecharFormulario() {
    if (newQuestionSection) {
      newQuestionSection.hidden = true;
      if (btnOpenNewQuestion) {
        btnOpenNewQuestion.setAttribute('aria-expanded', 'false');
        btnOpenNewQuestion.focus();
      }
      if (formNovaPergunta) formNovaPergunta.reset();
      if (tituloCount) tituloCount.textContent = '0';
      if (textoCount) textoCount.textContent = '0';
      if (formError) {
        formError.hidden = true;
        formError.textContent = '';
      }
    }
  }

  if (btnOpenNewQuestion) {
    btnOpenNewQuestion.addEventListener('click', () => {
      if (newQuestionSection.hidden) {
        abrirFormulario();
      } else {
        fecharFormulario();
      }
    });
  }

  if (btnCancelForm) {
    btnCancelForm.addEventListener('click', fecharFormulario);
  }

  // Contadores de Caracteres em Tempo Real
  if (inputTitulo && tituloCount) {
    inputTitulo.addEventListener('input', () => {
      tituloCount.textContent = String(inputTitulo.value.length);
    });
  }

  if (inputTexto && textoCount) {
    inputTexto.addEventListener('input', () => {
      textoCount.textContent = String(inputTexto.value.length);
    });
  }

  // Submissão do Formulário de Nova Pergunta
  if (formNovaPergunta) {
    formNovaPergunta.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (formError) {
        formError.hidden = true;
        formError.textContent = '';
      }

      const titulo = inputTitulo ? inputTitulo.value.trim() : '';
      const categoria = selectCategoria ? selectCategoria.value.trim() : '';
      const texto = inputTexto ? inputTexto.value.trim() : '';

      // Validação no frontend
      if (!titulo) {
        mostrarErro('Por favor, informe o título da dúvida.');
        inputTitulo?.focus();
        return;
      }
      if (titulo.length > 120) {
        mostrarErro('O título não pode ultrapassar 120 caracteres.');
        inputTitulo?.focus();
        return;
      }
      if (!categoria) {
        mostrarErro('Por favor, selecione uma categoria.');
        selectCategoria?.focus();
        return;
      }
      if (!texto) {
        mostrarErro('Por favor, descreva detalhadamente sua dúvida.');
        inputTexto?.focus();
        return;
      }
      if (texto.length > 2000) {
        mostrarErro('O texto detalhado não pode ultrapassar 2000 caracteres.');
        inputTexto?.focus();
        return;
      }

      try {
        const nova = await api.criarPergunta({ titulo, texto, categoria });
        
        fecharFormulario();
        
        // Redefine busca e filtros para que a nova pergunta seja visível de imediato no topo
        termoBusca = '';
        if (buscaInput) buscaInput.value = '';
        categoriaAtiva = 'Todos';
        statusAtivo = 'todos';
        
        await atualizarFiltrosERenderizar();
        
        anunciar('Sua pergunta foi publicada com sucesso e já está disponível no topo da lista!');

        // Efeito de destaque no novo card
        const novoCard = document.getElementById(`card-${nova.id}`);
        if (novoCard) {
          novoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          novoCard.classList.add('just-created');
          setTimeout(() => novoCard.classList.remove('just-created'), 3000);
        }
      } catch (err) {
        mostrarErro(err.message || 'Erro ao publicar pergunta. Tente novamente.');
      }
    });
  }

  function mostrarErro(msg) {
    if (formError) {
      formError.hidden = false;
      formError.textContent = msg;
    }
  }

  /* ==========================================================================
     INICIALIZAÇÃO DA INTERFACE
     ========================================================================== */

  renderizarPerfilAtivo();
  await atualizarFiltrosERenderizar();
});

