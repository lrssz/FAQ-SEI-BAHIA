/**
 * API do Fórum SEI Bahia (Camada de Dados)
 * Protótipo de Demonstração - Etapa 1
 * 
 * REGRA: Este é o ÚNICO arquivo do sistema que acessa o localStorage.
 * Todas as funções são assíncronas (retornando Promise) para permitir
 * substituição futura por chamadas fetch/HTTP sem alterar as telas.
 */

(function (global) {
  'use strict';

  // Configuração e Chaves do Armazenamento com prefixo obrigatório
  const STORAGE_PREFIX = 'seiforum:';
  const SCHEMA_VERSION = '2.0';

  const KEYS = {
    SCHEMA_VERSION: `${STORAGE_PREFIX}schema_version`,
    PERGUNTAS: `${STORAGE_PREFIX}perguntas`,
    RESPOSTAS: `${STORAGE_PREFIX}respostas`,
    USUARIO_ATUAL: `${STORAGE_PREFIX}usuario_atual`
  };

  // Perfis Simulados
  const PERFIS = {
    visitante: {
      id: 'visitante',
      nome: 'Visitante',
      papel: 'visitante',
      orgao: 'Acesso público sem login'
    },
    usuario: {
      id: 'usuario',
      nome: 'Maria Souza',
      papel: 'usuario',
      orgao: 'Secretaria de Educação'
    },
    moderador: {
      id: 'moderador',
      nome: 'João Lima',
      papel: 'moderador',
      orgao: 'Secretaria de Administração'
    }
  };

  const CATEGORIAS_VALIDAS = [
    'Acesso',
    'Processos',
    'Documentos',
    'Blocos',
    'Busca',
    'Usuários externos'
  ];

  // Helper para simular pequena latência assíncrona (comportamento de Promise)
  function delay(ms = 20) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Normalização de texto: remove acentos e converte para minúsculas
  function normalizar(texto) {
    if (!texto) return '';
    return texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Verifica se o usuário atual é o autor do item (pergunta ou resposta)
  function ehMesmoAutor(usuario, autorItem) {
    if (!usuario || !autorItem) return false;
    if (usuario.id && autorItem.id && usuario.id === autorItem.id) return true;
    if (usuario.nome && autorItem.nome && usuario.nome.trim().toLowerCase() === autorItem.nome.trim().toLowerCase()) return true;
    return false;
  }

  // Gera dados iniciais de demonstração (fictícios)
  function obterDadosIniciais() {
    const agora = Date.now();
    const UMA_HORA = 3600 * 1000;
    const UM_DIA = 24 * UMA_HORA;

    const perguntas = [
      {
        id: 'p-1',
        titulo: 'Como assinar documento em lote utilizando bloco de assinaturas?',
        texto: 'Preciso disponibilizar vários pareceres para assinatura simultânea do diretor de departamento. Qual o procedimento correto para incluir os documentos no bloco e liberá-lo para a outra unidade sem perder o controle do processo? [Dado fictício para demonstração]',
        categoria: 'Blocos',
        autor: {
          nome: 'Maria Souza',
          papel: 'usuario',
          orgao: 'Secretaria de Educação'
        },
        data: new Date(agora - 2 * UMA_HORA).toISOString(),
        status: 'aberta',
        fixada: true,
        respostasCount: 1
      },
      {
        id: 'p-2',
        titulo: 'Qual a diferença prática entre anexar processo e relacionar processos?',
        texto: 'Estou com dois expedientes administrativos que tratam do mesmo servidor. Em que situações devo usar a ferramenta Anexar Processo e quando devo apenas Relacionar no SEI Bahia? [Dado fictício para demonstração]',
        categoria: 'Processos',
        autor: {
          nome: 'Carlos Mendes',
          papel: 'usuario',
          orgao: 'Secretaria de Saúde'
        },
        data: new Date(agora - 1 * UM_DIA).toISOString(),
        status: 'respondida',
        fixada: false,
        respostasCount: 2,
        respostaAceitaId: 'r-2'
      },
      {
        id: 'p-3',
        titulo: 'Como reabrir um processo que já foi concluído na minha unidade?',
        texto: 'Concluí um processo por engano antes de inserir o despacho final com o parecer financeiro. Como faço para reabrir a tramitação na unidade sem solicitar suporte técnico? [Dado fictício para demonstração]',
        categoria: 'Processos',
        autor: {
          nome: 'Ana Ribeiro',
          papel: 'usuario',
          orgao: 'Secretaria da Fazenda'
        },
        data: new Date(agora - 2 * UM_DIA).toISOString(),
        status: 'aberta',
        fixada: false,
        respostasCount: 1
      },
      {
        id: 'p-4',
        titulo: 'Passo a passo para liberar acesso externo a cidadão para assinatura de convênio',
        texto: 'Um representante de cooperativa municipal precisa assinar eletronicamente um termo de parceria. Como liberar o acesso do usuário externo e como ele visualiza o documento para assinatura? [Dado fictício para demonstração]',
        categoria: 'Usuários externos',
        autor: {
          nome: 'Maria Souza',
          papel: 'usuario',
          orgao: 'Secretaria de Educação'
        },
        data: new Date(agora - 3 * UM_DIA).toISOString(),
        status: 'aberta',
        fixada: false,
        respostasCount: 1
      },
      {
        id: 'p-5',
        titulo: 'Qual certificado digital é aceito para assinatura de documentos com validade legal?',
        texto: 'Dúvida sobre uso de certificado em token físico ICP-Brasil vs login com senha funcional e GOV.BR no módulo de assinatura eletrônica do SEI Bahia. [Dado fictício para demonstração]',
        categoria: 'Documentos',
        autor: {
          nome: 'Roberto Alves',
          papel: 'usuario',
          orgao: 'Gabinete do Prefeito'
        },
        data: new Date(agora - 4 * UM_DIA).toISOString(),
        status: 'oculta',
        fixada: false,
        respostasCount: 1
      },
      {
        id: 'p-6',
        titulo: 'O que fazer quando o OCR não reconhece texto em PDF digitalizado inserido no processo?',
        texto: 'Digitalizei uma folha de ponto antiga e subi no SEI como documento externo, mas a busca textual não encontra os termos contidos no arquivo. Como corrigir isso? [Dado fictício para demonstração]',
        categoria: 'Busca',
        autor: {
          nome: 'Fernanda Lima',
          papel: 'usuario',
          orgao: 'Secretaria de Finanças'
        },
        data: new Date(agora - 5 * UM_DIA).toISOString(),
        status: 'respondida',
        fixada: false,
        respostasCount: 1,
        respostaAceitaId: 'r-7'
      }
    ];

    const respostas = [
      {
        id: 'r-1',
        perguntaId: 'p-1',
        texto: 'Para fazer isso, acesse o menu "Blocos de Assinatura", crie um novo bloco indicando a unidade de destino, selecione os documentos desejados na árvore do processo e clique no ícone "Incluir em Bloco". Lembre-se de clicar em "Disponibilizar Bloco" para que a outra unidade consiga visualizá-lo e assinar.',
        autor: {
          nome: 'João Lima',
          papel: 'moderador',
          orgao: 'Secretaria de Administração'
        },
        data: new Date(agora - 1 * UMA_HORA).toISOString(),
        status: 'visivel'
      },
      {
        id: 'r-2',
        perguntaId: 'p-2',
        texto: 'A anexação é definitiva e unifica os processos: o processo acessório passa a tramitar dentro do principal, e a ação só pode ser desfeita pelo administrador. Já o relacionamento é apenas um vínculo de referência rápida para consulta mútua, mantendo a tramitação independente de cada processo.',
        autor: {
          nome: 'João Lima',
          papel: 'moderador',
          orgao: 'Secretaria de Administração'
        },
        data: new Date(agora - 20 * UMA_HORA).toISOString(),
        status: 'visivel',
        aceita: true
      },
      {
        id: 'r-3',
        perguntaId: 'p-2',
        texto: 'Excelente explicação! Recomendo consultar também o Capítulo 4 da Apostila oficial (página 38), que traz um quadro comparativo detalhado.',
        autor: {
          nome: 'Maria Souza',
          papel: 'usuario',
          orgao: 'Secretaria de Educação'
        },
        data: new Date(agora - 18 * UMA_HORA).toISOString(),
        status: 'visivel'
      },
      {
        id: 'r-4',
        perguntaId: 'p-3',
        texto: 'Basta localizar o processo pela barra de busca do SEI ou clicar em "Ver Processos Concluídos nesta Unidade". Ao abrir a árvore do processo, clique no ícone "Reabrir Processo" na barra superior (ícone de pasta aberta com seta amarela). O processo voltará imediatamente para a lista de processos gerados.',
        autor: {
          nome: 'João Lima',
          papel: 'moderador',
          orgao: 'Secretaria de Administração'
        },
        data: new Date(agora - 40 * UMA_HORA).toISOString(),
        status: 'visivel'
      },
      {
        id: 'r-5',
        perguntaId: 'p-4',
        texto: 'Primeiro o cidadão precisa ter o cadastro prévio aprovado no Portal SEI Bahia. Em seguida, na árvore do processo, clique no ícone "Gerenciar Disponibilizações de Acesso Externo", selecione o e-mail cadastrado dele, marque o documento e defina o prazo de validade.',
        autor: {
          nome: 'Carlos Mendes',
          papel: 'usuario',
          orgao: 'Secretaria de Saúde'
        },
        data: new Date(agora - 68 * UMA_HORA).toISOString(),
        status: 'visivel'
      },
      {
        id: 'r-6',
        perguntaId: 'p-5',
        texto: 'O SEI Bahia aceita tanto a assinatura eletrônica com login e senha funcional (assinatura cadastrada), quanto certificados padrão ICP-Brasil (A1 ou A3 em token/cartão) e contas GOV.BR nos níveis Prata ou Ouro.',
        autor: {
          nome: 'João Lima',
          papel: 'moderador',
          orgao: 'Secretaria de Administração'
        },
        data: new Date(agora - 90 * UMA_HORA).toISOString(),
        status: 'visivel'
      },
      {
        id: 'r-7',
        perguntaId: 'p-6',
        texto: 'Ao anexar PDF escaneado, certifique-se de que o scanner gerou PDF pesquisável (com camada OCR ativa). Se o PDF for imagem pura, o SEI não conseguirá indexar o conteúdo. Recomenda-se rodar o OCR antes de fazer o upload ou descrever detalhadamente o campo "Nome na Árvore".',
        autor: {
          nome: 'João Lima',
          papel: 'moderador',
          orgao: 'Secretaria de Administração'
        },
        data: new Date(agora - 115 * UMA_HORA).toISOString(),
        status: 'visivel',
        aceita: true
      }
    ];

    return { perguntas, respostas };
  }

  // Inicialização com controle de versão no localStorage
  function garantirInicializacao() {
    const versao = localStorage.getItem(KEYS.SCHEMA_VERSION);
    const perguntasRaw = localStorage.getItem(KEYS.PERGUNTAS);
    const respostasRaw = localStorage.getItem(KEYS.RESPOSTAS);

    if (!versao || versao !== SCHEMA_VERSION || !perguntasRaw || !respostasRaw) {
      const dadosIniciais = obterDadosIniciais();
      localStorage.setItem(KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
      localStorage.setItem(KEYS.PERGUNTAS, JSON.stringify(dadosIniciais.perguntas));
      localStorage.setItem(KEYS.RESPOSTAS, JSON.stringify(dadosIniciais.respostas));
    }

    if (!localStorage.getItem(KEYS.USUARIO_ATUAL)) {
      localStorage.setItem(KEYS.USUARIO_ATUAL, 'visitante');
    }
  }

  // Leitura segura do localStorage
  function lerPerguntasRaw() {
    garantirInicializacao();
    try {
      const raw = localStorage.getItem(KEYS.PERGUNTAS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao ler perguntas do storage:', e);
      return [];
    }
  }

  function salvarPerguntasRaw(perguntas) {
    localStorage.setItem(KEYS.PERGUNTAS, JSON.stringify(perguntas));
  }

  function lerRespostasRaw() {
    garantirInicializacao();
    try {
      const raw = localStorage.getItem(KEYS.RESPOSTAS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao ler respostas do storage:', e);
      return [];
    }
  }

  function salvarRespostasRaw(respostas) {
    localStorage.setItem(KEYS.RESPOSTAS, JSON.stringify(respostas));
  }

  /* ==========================================================================
     API PÚBLICA (TODAS ASSÍNCRONAS / PROMISE)
     ========================================================================== */

  /**
   * Retorna o perfil do usuário ativo atual.
   * @returns {Promise<{id: string, nome: string, papel: string, orgao: string}>}
   */
  async function usuarioAtual() {
    await delay();
    garantirInicializacao();
    const idPerfil = localStorage.getItem(KEYS.USUARIO_ATUAL) || 'visitante';
    const perfil = PERFIS[idPerfil] || PERFIS.visitante;
    return { ...perfil };
  }

  /**
   * Altera o perfil do usuário ativo ('visitante', 'usuario', 'moderador').
   * @param {string|object} perfil 
   * @returns {Promise<{id: string, nome: string, papel: string, orgao: string}>}
   */
  async function entrar(perfil) {
    await delay();
    garantirInicializacao();
    let idPerfil = 'visitante';

    if (typeof perfil === 'string') {
      idPerfil = perfil.toLowerCase().trim();
    } else if (perfil && (perfil.id || perfil.papel)) {
      idPerfil = (perfil.id || perfil.papel).toLowerCase().trim();
    }

    if (!PERFIS[idPerfil]) {
      idPerfil = 'visitante';
    }

    localStorage.setItem(KEYS.USUARIO_ATUAL, idPerfil);
    return { ...PERFIS[idPerfil] };
  }

  /**
   * Encerra a sessão ativa (retorna para o papel de Visitante).
   * @returns {Promise<{id: string, nome: string, papel: string, orgao: string}>}
   */
  async function sair() {
    return entrar('visitante');
  }

  /**
   * Reseta os dados no localStorage para o estado inicial de demonstração.
   * @returns {Promise<{sucesso: boolean, mensagem: string}>}
   */
  async function resetarDados() {
    await delay();
    const dadosIniciais = obterDadosIniciais();
    localStorage.setItem(KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
    localStorage.setItem(KEYS.PERGUNTAS, JSON.stringify(dadosIniciais.perguntas));
    localStorage.setItem(KEYS.RESPOSTAS, JSON.stringify(dadosIniciais.respostas));
    return {
      sucesso: true,
      mensagem: 'Dados de demonstração redefinidos com sucesso.'
    };
  }

  /**
   * Lista perguntas com suporte a busca em tempo real, status e categoria.
   * Regras:
   * - Perguntas fixadas vêm primeiro (ordenadas por data decrescente).
   * - Perguntas não fixadas são ordenadas por data decrescente (mais recente no topo).
   * - Perguntas com status 'oculta' SÓ aparecem para o moderador.
   * 
   * @param {Object} [filtros={}]
   * @param {string} [filtros.busca=''] Termo para busca em título e texto
   * @param {string} [filtros.status='todos'] Filtro de status ('todos', 'aberta', 'respondida', 'oculta')
   * @param {string} [filtros.categoria='Todos'] Filtro por categoria temática
   * @returns {Promise<Array>}
   */
  async function listarPerguntas({ busca = '', status = 'todos', categoria = 'Todos' } = {}) {
    await delay();
    const usuario = await usuarioAtual();
    const eModerador = usuario.papel === 'moderador';

    const todasPerguntas = lerPerguntasRaw();
    const todasRespostas = lerRespostasRaw();

    // Contagem atualizada de respostas por pergunta
    const contagemRespostas = {};
    todasRespostas.forEach(r => {
      // Para usuários não moderadores, respostas ocultas não são contabilizadas
      if (!eModerador && r.status === 'oculta') return;
      contagemRespostas[r.perguntaId] = (contagemRespostas[r.perguntaId] || 0) + 1;
    });

    const buscaNorm = normalizar(busca.trim());
    const statusFiltro = (status || 'todos').toLowerCase().trim();
    const catFiltro = (categoria || 'Todos').trim();

    const filtradas = todasPerguntas.filter(item => {
      // Regra de privacidade: ocultas só para moderador
      if (item.status === 'oculta' && !eModerador) {
        return false;
      }

      // Filtro de status
      if (statusFiltro !== 'todos' && item.status !== statusFiltro) {
        return false;
      }

      // Filtro de categoria
      if (catFiltro !== 'Todos' && item.categoria !== catFiltro) {
        return false;
      }

      // Filtro de busca textual (sem acento, case-insensitive)
      if (buscaNorm) {
        const tituloNorm = normalizar(item.titulo);
        const textoNorm = normalizar(item.texto);
        const autorNorm = normalizar(item.autor?.nome || '');
        const catNorm = normalizar(item.categoria || '');

        const encontrou =
          tituloNorm.includes(buscaNorm) ||
          textoNorm.includes(buscaNorm) ||
          autorNorm.includes(buscaNorm) ||
          catNorm.includes(buscaNorm);

        if (!encontrou) return false;
      }

      return true;
    });

    // Anexa a contagem de respostas atualizada
    const comMetadados = filtradas.map(p => ({
      ...p,
      respostasCount: contagemRespostas[p.id] !== undefined ? contagemRespostas[p.id] : (p.respostasCount || 0)
    }));

    // Ordenação: fixadas primeiro; dentro de cada grupo, mais recentes primeiro
    comMetadados.sort((a, b) => {
      if (a.fixada && !b.fixada) return -1;
      if (!a.fixada && b.fixada) return 1;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

    return comMetadados;
  }

  /**
   * Obtém os detalhes de uma pergunta específica por ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async function obterPergunta(id) {
    await delay();
    if (!id) return null;
    const usuario = await usuarioAtual();
    const eModerador = usuario.papel === 'moderador';

    const todas = lerPerguntasRaw();
    const pergunta = todas.find(p => p.id === id);

    if (!pergunta) return null;
    if (pergunta.status === 'oculta' && !eModerador) return null;

    return { ...pergunta };
  }

  /**
   * Cria uma nova pergunta no fórum.
   * Valida permissão do usuário, limites de caracteres e campos obrigatórios.
   * 
   * @param {Object} dados
   * @param {string} dados.titulo Até 120 caracteres
   * @param {string} dados.texto Até 2000 caracteres
   * @param {string} dados.categoria Categoria válida do SEI
   * @returns {Promise<Object>} Pergunta recém-criada
   */
  async function criarPergunta({ titulo, texto, categoria }) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para perguntar.');
    }

    const tit = (titulo || '').trim();
    const txt = (texto || '').trim();
    const cat = (categoria || '').trim();

    if (!tit) {
      throw new Error('O título da pergunta é obrigatório.');
    }
    if (tit.length > 120) {
      throw new Error('O título não pode ultrapassar 120 caracteres.');
    }

    if (!cat) {
      throw new Error('Selecione uma categoria para a pergunta.');
    }
    if (!CATEGORIAS_VALIDAS.includes(cat)) {
      throw new Error('Categoria selecionada é inválida.');
    }

    if (!txt) {
      throw new Error('O texto detalhado da pergunta é obrigatório.');
    }
    if (txt.length > 2000) {
      throw new Error('O texto da pergunta não pode ultrapassar 2000 caracteres.');
    }

    const nova = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      titulo: tit,
      texto: txt,
      categoria: cat,
      autor: {
        id: usuario.id,
        nome: usuario.nome,
        papel: usuario.papel,
        orgao: usuario.orgao
      },
      data: new Date().toISOString(),
      status: 'aberta',
      fixada: false,
      respostasCount: 0
    };

    const perguntas = lerPerguntasRaw();
    perguntas.unshift(nova);
    salvarPerguntasRaw(perguntas);

    return { ...nova };
  }

  /**
   * Edita uma pergunta existente.
   * Regras de permissão: Usuário comum edita apenas a sua própria pergunta; moderador pode editar qualquer pergunta.
   * 
   * @param {string} id 
   * @param {Object} dados
   * @param {string} dados.titulo
   * @param {string} dados.texto
   * @param {string} dados.categoria
   * @returns {Promise<Object>} Pergunta atualizada
   */
  async function editarPergunta(id, { titulo, texto, categoria }) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para editar uma pergunta.');
    }

    if (!id) {
      throw new Error('ID da pergunta não informado.');
    }

    const perguntas = lerPerguntasRaw();
    const pergunta = perguntas.find(p => p.id === id);
    if (!pergunta) {
      throw new Error('Pergunta não encontrada.');
    }

    const ehModerador = usuario.papel === 'moderador';
    const ehAutorPergunta = ehMesmoAutor(usuario, pergunta.autor);

    if (!ehModerador && !ehAutorPergunta) {
      throw new Error('Você só tem permissão para editar a sua própria pergunta.');
    }

    const tit = (titulo || '').trim();
    const txt = (texto || '').trim();
    const cat = (categoria || '').trim();

    if (!tit) {
      throw new Error('O título da pergunta é obrigatório.');
    }
    if (tit.length > 120) {
      throw new Error('O título não pode ultrapassar 120 caracteres.');
    }

    if (!cat) {
      throw new Error('Selecione uma categoria para a pergunta.');
    }
    if (!CATEGORIAS_VALIDAS.includes(cat)) {
      throw new Error('Categoria selecionada é inválida.');
    }

    if (!txt) {
      throw new Error('O texto detalhado da pergunta é obrigatório.');
    }
    if (txt.length > 2000) {
      throw new Error('O texto da pergunta não pode ultrapassar 2000 caracteres.');
    }

    pergunta.titulo = tit;
    pergunta.categoria = cat;
    pergunta.texto = txt;
    pergunta.editadaEm = new Date().toISOString();

    salvarPerguntasRaw(perguntas);
    return { ...pergunta };
  }

  /**
   * Lista as respostas de uma pergunta.
   * @param {string} perguntaId 
   * @returns {Promise<Array>}
   */
  async function listarRespostas(perguntaId) {
    await delay();
    if (!perguntaId) return [];

    const usuario = await usuarioAtual();
    const eModerador = usuario.papel === 'moderador';

    const todasRespostas = lerRespostasRaw();
    const respostasDaPergunta = todasRespostas.filter(r => {
      if (r.perguntaId !== perguntaId) return false;
      if (r.status === 'oculta' && !eModerador) return false;
      return true;
    });

    // Ordenação: a resposta aceita aparece primeiro; as demais em ordem cronológica
    respostasDaPergunta.sort((a, b) => {
      if (a.aceita && !b.aceita) return -1;
      if (!a.aceita && b.aceita) return 1;
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });
    return respostasDaPergunta;
  }

  /**
   * Cria uma nova resposta para uma pergunta.
   * @param {string} perguntaId 
   * @param {string} texto 
   * @returns {Promise<Object>}
   */
  async function criarResposta(perguntaId, texto) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para responder.');
    }

    if (!perguntaId) {
      throw new Error('ID da pergunta não fornecido.');
    }

    const txt = (texto || '').trim();
    if (!txt) {
      throw new Error('O texto da resposta não pode ficar vazio.');
    }
    if (txt.length > 2000) {
      throw new Error('A resposta não pode ultrapassar 2000 caracteres.');
    }

    const perguntas = lerPerguntasRaw();
    const perguntaIndex = perguntas.findIndex(p => p.id === perguntaId);
    if (perguntaIndex === -1) {
      throw new Error('Pergunta não encontrada para responder.');
    }

    const nova = {
      id: 'r-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      perguntaId,
      texto: txt,
      autor: {
        id: usuario.id,
        nome: usuario.nome,
        papel: usuario.papel,
        orgao: usuario.orgao
      },
      data: new Date().toISOString(),
      status: 'visivel',
      aceita: false
    };

    const respostas = lerRespostasRaw();
    respostas.push(nova);
    salvarRespostasRaw(respostas);

    // Incrementa contagem de respostas da pergunta
    perguntas[perguntaIndex].respostasCount = (perguntas[perguntaIndex].respostasCount || 0) + 1;
    salvarPerguntasRaw(perguntas);

    return { ...nova };
  }

  /**
   * Edita o texto de uma resposta existente.
   * Regras de permissão: Usuário comum edita apenas a sua própria resposta; moderador pode editar qualquer resposta.
   * 
   * @param {string} respostaId 
   * @param {string} texto 
   * @returns {Promise<Object>} Resposta atualizada
   */
  async function editarResposta(respostaId, texto) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para editar uma resposta.');
    }

    if (!respostaId) {
      throw new Error('ID da resposta não informado.');
    }

    const txt = (texto || '').trim();
    if (!txt) {
      throw new Error('O texto da resposta não pode ficar vazio.');
    }
    if (txt.length > 2000) {
      throw new Error('A resposta não pode ultrapassar 2000 caracteres.');
    }

    const respostas = lerRespostasRaw();
    const resposta = respostas.find(r => r.id === respostaId);
    if (!resposta) {
      throw new Error('Resposta não encontrada.');
    }

    const ehModerador = usuario.papel === 'moderador';
    const ehAutorResposta = ehMesmoAutor(usuario, resposta.autor);

    if (!ehModerador && !ehAutorResposta) {
      throw new Error('Você só tem permissão para editar suas próprias respostas.');
    }

    resposta.texto = txt;
    resposta.editadaEm = new Date().toISOString();

    salvarRespostasRaw(respostas);
    return { ...resposta };
  }

  /**
   * Exclui uma resposta existente.
   * Regras de permissão: Usuário comum remove apenas a sua própria resposta; moderador pode excluir qualquer resposta.
   * 
   * @param {string} respostaId 
   * @returns {Promise<{sucesso: boolean, id: string}>}
   */
  async function excluirResposta(respostaId) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para excluir uma resposta.');
    }

    if (!respostaId) {
      throw new Error('ID da resposta não informado.');
    }

    const respostas = lerRespostasRaw();
    const index = respostas.findIndex(r => r.id === respostaId);
    if (index === -1) {
      throw new Error('Resposta não encontrada.');
    }

    const resposta = respostas[index];
    const ehModerador = usuario.papel === 'moderador';
    const ehAutorResposta = ehMesmoAutor(usuario, resposta.autor);

    if (!ehModerador && !ehAutorResposta) {
      throw new Error('Você só tem permissão para excluir suas próprias respostas.');
    }

    const perguntas = lerPerguntasRaw();
    const pergunta = perguntas.find(p => p.id === resposta.perguntaId);

    if (pergunta) {
      pergunta.respostasCount = Math.max(0, (pergunta.respostasCount || 1) - 1);
      // Se a resposta excluída era a aceita, limpa a referência e atualiza o status se não houver outra aceita
      if (resposta.aceita || pergunta.respostaAceitaId === respostaId) {
        delete pergunta.respostaAceitaId;
      }
      salvarPerguntasRaw(perguntas);
    }

    respostas.splice(index, 1);
    salvarRespostasRaw(respostas);

    return { sucesso: true, id: respostaId };
  }

  /**
   * Marca uma resposta como a resposta aceita e define a pergunta como "respondida".
   * Desmarca a resposta aceita anterior, se houver.
   * Regras de permissão: Apenas o autor da pergunta ou um moderador pode aceitar uma resposta.
   * 
   * @param {string} respostaId 
   * @returns {Promise<Object>} Resposta recém-aceita
   */
  async function aceitarResposta(respostaId) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel === 'visitante') {
      throw new Error('Entre como usuário para aceitar uma resposta.');
    }

    if (!respostaId) {
      throw new Error('ID da resposta não informado.');
    }

    const respostas = lerRespostasRaw();
    const resposta = respostas.find(r => r.id === respostaId);
    if (!resposta) {
      throw new Error('Resposta não encontrada.');
    }

    const perguntas = lerPerguntasRaw();
    const pergunta = perguntas.find(p => p.id === resposta.perguntaId);
    if (!pergunta) {
      throw new Error('Pergunta correspondente não encontrada.');
    }

    const ehModerador = usuario.papel === 'moderador';
    const ehAutorPergunta = ehMesmoAutor(usuario, pergunta.autor);

    if (!ehModerador && !ehAutorPergunta) {
      throw new Error('Apenas o autor da pergunta ou um moderador pode aceitar uma resposta.');
    }

    // Desmarca resposta anterior da mesma pergunta e marca a nova
    respostas.forEach(r => {
      if (r.perguntaId === pergunta.id) {
        r.aceita = (r.id === respostaId);
      }
    });

    // Atualiza a pergunta como "respondida" e armazena o id da aceita
    pergunta.status = 'respondida';
    pergunta.respostaAceitaId = respostaId;

    salvarRespostasRaw(respostas);
    salvarPerguntasRaw(perguntas);

    return { ...resposta, aceita: true };
  }

  /**
   * Modera uma pergunta ou resposta (ações: ocultar, mostrar, marcarRespondida, fixar).
   * Restrito exclusivamente ao papel de moderador.
   * 
   * @param {'pergunta'|'resposta'} tipo 
   * @param {string} id 
   * @param {'ocultar'|'mostrar'|'marcarRespondida'|'fixar'} acao 
   * @returns {Promise<Object>} Item modificado
   */
  async function moderarItem(tipo, id, acao) {
    await delay();
    const usuario = await usuarioAtual();

    if (usuario.papel !== 'moderador') {
      throw new Error('Apenas moderadores têm permissão para moderar itens.');
    }

    if (tipo === 'pergunta') {
      const perguntas = lerPerguntasRaw();
      const item = perguntas.find(p => p.id === id);
      if (!item) throw new Error('Pergunta não encontrada.');

      switch (acao) {
        case 'ocultar':
          item.status = 'oculta';
          break;
        case 'mostrar':
          item.status = 'aberta';
          break;
        case 'marcarRespondida':
          item.status = 'respondida';
          break;
        case 'fixar':
          item.fixada = !item.fixada;
          break;
        default:
          throw new Error(`Ação de moderação desconhecida: ${acao}`);
      }

      salvarPerguntasRaw(perguntas);
      return { ...item };
    }

    if (tipo === 'resposta') {
      const respostas = lerRespostasRaw();
      const item = respostas.find(r => r.id === id);
      if (!item) throw new Error('Resposta não encontrada.');

      switch (acao) {
        case 'ocultar':
          item.status = 'oculta';
          break;
        case 'mostrar':
          item.status = 'visivel';
          break;
        default:
          throw new Error(`Ação de moderação desconhecida para resposta: ${acao}`);
      }

      salvarRespostasRaw(respostas);
      return { ...item };
    }

    throw new Error(`Tipo de item inválido para moderação: ${tipo}`);
  }

  // Objeto de exportação
  const api = {
    listarPerguntas,
    obterPergunta,
    criarPergunta,
    editarPergunta,
    listarRespostas,
    criarResposta,
    editarResposta,
    excluirResposta,
    aceitarResposta,
    moderarItem,
    usuarioAtual,
    entrar,
    sair,
    resetarDados,
    CATEGORIAS: [...CATEGORIAS_VALIDAS]
  };

  // Exposição global para navegadores sem exigir bundler
  if (typeof window !== 'undefined') {
    window.listarPerguntas = listarPerguntas;
    window.obterPergunta = obterPergunta;
    window.criarPergunta = criarPergunta;
    window.editarPergunta = editarPergunta;
    window.listarRespostas = listarRespostas;
    window.criarResposta = criarResposta;
    window.editarResposta = editarResposta;
    window.excluirResposta = excluirResposta;
    window.aceitarResposta = aceitarResposta;
    window.moderarItem = moderarItem;
    window.usuarioAtual = usuarioAtual;
    window.entrar = entrar;
    window.sair = sair;
    window.resetarDados = resetarDados;
    window.SEIForumAPI = api;
  }

  // Compatibilidade com módulos Node.js / CommonJS se aplicável
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

})(typeof window !== 'undefined' ? window : globalThis);

