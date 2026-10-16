document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const lista = document.getElementById('lista');
  const busca = document.getElementById('busca');
  const clearBtn = document.getElementById('clearBtn');
  const vazio = document.getElementById('vazio');
  const chipsContainer = document.getElementById('chips');
  const resultsCount = document.getElementById('resultsCount');
  const toggleAllBtn = document.getElementById('toggleAllBtn');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  if (!lista || !busca || !chipsContainer) return;

  // Estado
  let temaAtual = "Todos";
  let termoBusca = "";

  // Normalização de texto: remove diacríticos (acentos) e converte para minúsculas
  function normalizar(texto) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Escapar caracteres especiais para RegExp seguro
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Escapar HTML para evitar XSS
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Destaque de termos correspondentes com <mark>
  function destacarTexto(textoOriginal, termo) {
    if (!termo || termo.trim().length === 0) return escapeHTML(textoOriginal);
    
    const termoNorm = normalizar(termo.trim());
    const textoNorm = normalizar(textoOriginal);
    
    const matches = [];
    let index = textoNorm.indexOf(termoNorm);
    while (index !== -1) {
      matches.push({ start: index, end: index + termoNorm.length });
      index = textoNorm.indexOf(termoNorm, index + 1);
    }

    if (matches.length === 0) return escapeHTML(textoOriginal);

    let resultado = "";
    let ultimoFim = 0;

    for (const m of matches) {
      resultado += escapeHTML(textoOriginal.slice(ultimoFim, m.start));
      resultado += `<mark class="highlight">${escapeHTML(textoOriginal.slice(m.start, m.end))}</mark>`;
      ultimoFim = m.end;
    }
    resultado += escapeHTML(textoOriginal.slice(ultimoFim));
    return resultado;
  }

  // Quantidade de perguntas por tema
  function contarPorTema(nomeTema) {
    if (nomeTema === "Todos") return FAQ.length;
    return FAQ.filter(item => item[0] === nomeTema).length;
  }

  // Renderizar chips de categorias
  function renderChips() {
    chipsContainer.innerHTML = '';
    TEMAS.forEach(tema => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      btn.setAttribute('aria-pressed', tema === temaAtual ? 'true' : 'false');

      const total = contarPorTema(tema);
      btn.innerHTML = `<span>${tema}</span><span class="chip-count">${total}</span>`;

      btn.addEventListener('click', () => {
        temaAtual = tema;
        [...chipsContainer.children].forEach(c => {
          c.setAttribute('aria-pressed', c === btn ? 'true' : 'false');
        });
        renderFAQ();
      });

      chipsContainer.appendChild(btn);
    });
  }

  // Renderizar lista de acordeão
  function renderFAQ() {
    const query = normalizar(busca.value.trim());
    termoBusca = query;
    lista.innerHTML = '';
    let visiveis = 0;

    // Visibilidade do botão de limpar
    if (clearBtn) {
      clearBtn.style.display = busca.value.length > 0 ? 'inline-flex' : 'none';
    }

    FAQ.forEach((item, index) => {
      const [tema, pergunta, resposta, apostila] = item;

      // Filtro de categoria
      if (temaAtual !== "Todos" && tema !== temaAtual) return;

      // Filtro de texto
      const textoCompleto = normalizar(`${pergunta} ${resposta} ${apostila}`);
      if (query && !textoCompleto.includes(query)) return;

      visiveis++;

      const itemEl = document.createElement('div');
      itemEl.className = 'item';
      itemEl.id = `item-${index}`;

      const perguntaDestacada = query ? destacarTexto(pergunta, busca.value) : escapeHTML(pergunta);
      const respostaDestacada = query ? destacarTexto(resposta, busca.value) : escapeHTML(resposta);

      itemEl.innerHTML = `
        <h3>
          <button
            type="button"
            class="q"
            id="btn-faq-${index}"
            aria-expanded="false"
            aria-controls="answer-faq-${index}"
          >
            <span class="q-text">${perguntaDestacada}</span>
            <i class="pm" aria-hidden="true"></i>
          </button>
        </h3>
        <div
          class="a"
          id="answer-faq-${index}"
          role="region"
          aria-labelledby="btn-faq-${index}"
        >
          <div class="a-inner">
            <div class="a-content">
              <p>${respostaDestacada}</p>
              <span class="ref">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Apostila · ${apostila}
              </span>
            </div>
          </div>
        </div>
      `;

      const btn = itemEl.querySelector('.q');
      btn.addEventListener('click', () => {
        const estaAberto = btn.getAttribute('aria-expanded') === 'true';
        const novoEstado = !estaAberto;
        btn.setAttribute('aria-expanded', String(novoEstado));
        itemEl.classList.toggle('open', novoEstado);
        atualizarTextoBotaoToggleAll();
      });

      lista.appendChild(itemEl);
    });

    // Atualizar estado vazio e contagem de resultados
    if (vazio) vazio.hidden = visiveis > 0;
    if (resultsCount) {
      if (visiveis === 0) {
        resultsCount.textContent = "Nenhuma pergunta correspondente";
        if (toggleAllBtn) toggleAllBtn.style.display = 'none';
      } else {
        resultsCount.textContent = visiveis === 1 
          ? "Exibindo 1 pergunta" 
          : `Exibindo ${visiveis} perguntas`;
        if (toggleAllBtn) toggleAllBtn.style.display = 'inline-block';
      }
    }

    // Se busca específica com 1 a 3 resultados, expandir automaticamente
    if (query.length >= 3 && visiveis <= 3 && visiveis > 0) {
      document.querySelectorAll('.item').forEach(el => {
        const b = el.querySelector('.q');
        b.setAttribute('aria-expanded', 'true');
        el.classList.add('open');
      });
    }

    atualizarTextoBotaoToggleAll();
  }

  // Atualizar rótulo do botão Expandir / Recolher
  function atualizarTextoBotaoToggleAll() {
    if (!toggleAllBtn) return;
    const itens = document.querySelectorAll('.item');
    if (itens.length === 0) return;
    const todosAbertos = [...itens].every(item => item.classList.contains('open'));
    toggleAllBtn.textContent = todosAbertos ? "Recolher todas" : "Expandir todas";
  }

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      const itens = document.querySelectorAll('.item');
      const todosAbertos = [...itens].every(item => item.classList.contains('open'));
      const novoEstado = !todosAbertos;

      itens.forEach(item => {
        const btn = item.querySelector('.q');
        btn.setAttribute('aria-expanded', String(novoEstado));
        item.classList.toggle('open', novoEstado);
      });

      toggleAllBtn.textContent = novoEstado ? "Recolher todas" : "Expandir todas";
    });
  }

  // Evento de digitação na busca
  busca.addEventListener('input', () => {
    renderFAQ();
  });

  // Botão Limpar busca
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      busca.value = '';
      busca.focus();
      renderFAQ();
    });
  }

  // Redefinir busca e filtros no estado vazio
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      busca.value = '';
      temaAtual = "Todos";
      [...chipsContainer.children].forEach(c => {
        c.setAttribute('aria-pressed', c.textContent.startsWith('Todos') ? 'true' : 'false');
      });
      renderFAQ();
      busca.focus();
    });
  }

  // Atalho: tecla Escape limpa busca
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === busca) {
      if (busca.value.length > 0) {
        busca.value = '';
        renderFAQ();
      }
    }
  });

  // Inicialização
  renderChips();
  renderFAQ();
});
