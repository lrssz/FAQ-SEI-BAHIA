/**
 * SEI Bahia · Capacitação - Banco de Dados de Perguntas e Respostas do FAQ
 * Extraído e estruturado a partir do "Guia Prático do SEI"
 * Formato: [Tema, Pergunta, Resposta, Referência Apostila]
 */

const TEMAS = [
  "Todos",
  "Acesso",
  "Processos",
  "Documentos",
  "Blocos",
  "Busca",
  "Usuários externos"
];

const FAQ = [
  // --- Acesso (3 perguntas) ---
  [
    "Acesso",
    "Como entro no SEI?",
    "Abra o endereço eletrônico do SEI do seu órgão ou município em um navegador moderno e atualizado (Google Chrome, Mozilla Firefox ou Microsoft Edge). Informe o seu usuário institucional (geralmente CPF ou matrícula funcional) e senha, escolha o órgão ou entidade se houver campo de seleção e clique em \"Acessar\". Não é necessário instalar nenhum programa no computador.",
    "Cap. 1.1"
  ],
  [
    "Acesso",
    "Esqueci minha senha. E agora?",
    "Na tela de login do SEI, clique na opção \"Esqueci minha senha\" para receber um link de redefinição no seu e-mail funcional cadastrado. Caso você não tenha mais acesso a esse e-mail ou o link não chegue, procure o Administrador Local do SEI no seu órgão ou o setor de TIC/RH para redefinição manual da credencial.",
    "Cap. 1.1"
  ],
  [
    "Acesso",
    "Como troco de unidade (setor)?",
    "Caso você possua permissão de trabalho em mais de uma unidade ou secretaria, utilize o campo de seleção \"Unidade\" localizado no canto superior direito da tela do SEI (ao lado do seu nome de usuário) e selecione a sigla da unidade desejada para alternar o ambiente de trabalho.",
    "Cap. 1.1"
  ],

  // --- Processos (5 perguntas) ---
  [
    "Processos",
    "Como crio um novo processo?",
    "No menu lateral esquerdo do SEI, clique em \"Iniciar Processo\". Escolha o tipo de processo correspondente na listagem, preencha o campo de especificação com uma síntese clara do assunto, defina o nível de acesso (Público, Restrito ou Sigiloso, indicando a hipótese legal caso restrito), informe os interessados e clique em \"Salvar\". O sistema gerará o Número Único de Protocolo (NUP).",
    "Cap. 2.1"
  ],
  [
    "Processos",
    "Posso excluir um processo?",
    "Apenas em situações estritas: quando o processo foi gerado por engano na sua unidade, ainda não recebeu nenhum documento anexado ou redigido além do inicial em branco e nunca foi tramitado (enviado) para outra unidade. Processos com documentos válidos ou que já tramitaram só podem ser concluídos ou cancelados formalmente conforme as regras do órgão. A exclusão é irreversível.",
    "Cap. 2.1"
  ],
  [
    "Processos",
    "Qual a diferença entre relacionar e anexar processos?",
    "Relacionar cria um vínculo recíproco de consulta e referência entre processos, mantendo cada um com sua tramitação, árvore e numeração independentes. Já anexar é uma junção definitiva e irreversível: o processo acessório é incorporado à árvore do processo principal e passa a tramitar obrigatoriamente junto dele.",
    "Cap. 2.2"
  ],
  [
    "Processos",
    "Como envio um processo para outra unidade?",
    "Selecione o processo na tela de Controle de Processos (ou dentro da visualização do processo), clique no ícone \"Enviar Processo\" (envelope com seta), escolha as unidades de destino desejadas, marque se o processo continuará aberto na sua unidade e clique no botão \"Enviar\".",
    "Cap. 2.3"
  ],
  [
    "Processos",
    "Para que serve o retorno programado?",
    "Serve para enviar o processo a outra unidade estipulando previamente uma data limite para que ele retorne automaticamente à lista de processos da sua unidade de origem. É recomendável combinar essa ação com uma Anotação (ícone de bloco amarelo) descrevendo a finalidade do envio para manter o controle dos prazos.",
    "Cap. 2.4"
  ],

  // --- Documentos (4 perguntas) ---
  [
    "Documentos",
    "Como crio e assino um documento?",
    "Com o processo aberto, clique no ícone \"Incluir Documento\" (folha com estrela amarela), selecione o tipo de documento desejado (como Despacho, Ofício ou Memorando), preencha o nível de acesso e redija o texto no editor do SEI. Após salvar, clique no ícone da caneta (\"Assinar Documento\"), confirme sua senha institucional (ou certificado digital) e declare seu cargo/função para autenticar o documento.",
    "Cap. 3.1 e 3.3"
  ],
  [
    "Documentos",
    "Posso editar um documento depois de assinado?",
    "Não. Uma vez assinado, o documento passa a ter validade jurídica formal e seu conteúdo é bloqueado para qualquer alteração, garantindo a integridade dos atos públicos. Caso seja necessária uma retificação, deve-se gerar um novo documento corretivo ou providenciar o cancelamento formal da peça. Enquanto o documento for apenas uma minuta não assinada, a edição é livre pela unidade geradora.",
    "Cap. 3.3"
  ],
  [
    "Documentos",
    "Qual a diferença entre excluir e cancelar um documento?",
    "Excluir aplica-se apenas a minutas (documentos que ainda não receberam assinatura); ao excluir, a minuta é eliminada definitivamente da árvore. Cancelar é a operação para documentos já formalmente assinados: o documento permanece na árvore com uma marcação vermelha de \"Cancelado\", acompanhado da justificativa formal registrada para fins de auditoria.",
    "Cap. 3.6"
  ],
  [
    "Documentos",
    "Como incluo um documento que veio em papel ou por e-mail?",
    "Clique no ícone \"Incluir Documento\" e escolha a opção de documento \"Externo\". Preencha os metadados (tipo, número, data de emissão e tipo de conferência, como cópia autenticada administrativamente ou original). Em seguida, anexe o arquivo no seu computador (de preferência em formato PDF com reconhecimento óptico de caracteres OCR) e defina o nível de acesso.",
    "Cap. 3.5"
  ],

  // --- Blocos (3 perguntas) ---
  [
    "Blocos",
    "Como colho a assinatura de outra unidade sem enviar o processo?",
    "Utilize um Bloco de Assinatura. No menu lateral, acesse \"Blocos\" > \"Assinatura\" > \"Novo\", defina uma descrição, indique as unidades que deverão assinar e inclua as minutas de documentos correspondentes. Em seguida, clique em \"Disponibilizar Bloco\". A outra unidade poderá ler e assinar os documentos no bloco sem que você precise transferir a posse do processo.",
    "Cap. 4.1"
  ],
  [
    "Blocos",
    "Para que serve o Bloco de Reunião?",
    "Serve para disponibilizar processos e minutas de documentos para outras unidades exclusivamente para visualização, leitura compartilhada e discussão de assuntos. As unidades destinatárias conseguem consultar todo o conteúdo disponibilizado, porém não têm permissão para editar minutas nem assinar documentos.",
    "Cap. 4.3"
  ],
  [
    "Blocos",
    "O que é um Bloco Interno?",
    "É uma pasta organizadora de acesso exclusivo da sua própria unidade. Funciona como um agrupador de processos por tema, projeto, ordem de prioridade ou servidor responsável, sendo excelente para manter o acompanhamento interno de processos, inclusive daqueles que já tramitaram para outros setores.",
    "Cap. 4.4"
  ],

  // --- Busca (4 perguntas) ---
  [
    "Busca",
    "Como acompanho um processo que já enviei?",
    "Abra o processo e clique no ícone \"Acompanhamento Especial\" (marcador de fita/estrela). Você pode categorizá-lo em um grupo e inserir uma observação. O processo ficará listado na tabela de acompanhamentos especiais da sua unidade, sinalizando visualmente qualquer nova tramitação ou juntada de documentos realizada por terceiros.",
    "Cap. 5.2"
  ],
  [
    "Busca",
    "Como vejo tudo o que aconteceu em um processo?",
    "Com o processo selecionado na árvore, clique no ícone \"Consultar Andamento\" ou \"Histórico do Processo\" na barra de ferramentas. Uma listagem cronológica completa será apresentada, exibindo cada ato praticado: inclusão e assinatura de documentos, despachos, tramitações, conclusões e os respectivos servidores e unidades responsáveis.",
    "Cap. 5.1"
  ],
  [
    "Busca",
    "Como reabro um processo concluído?",
    "Na tela inicial do SEI, acesse a aba \"Processos Concluídos\", localize o processo pelo número ou busca, marque a caixa de seleção do processo e clique no ícone \"Reabrir Processo\". Ele retornará imediatamente à lista de processos abertos da unidade para continuidade das diligências.",
    "Cap. 5.3"
  ],
  [
    "Busca",
    "Como gero um PDF do processo?",
    "Acesse o processo na árvore e clique no ícone \"Gerar Arquivo PDF do Processo\". O sistema abrirá uma tela permitindo selecionar se você deseja compilar o processo integral ou apenas um intervalo específico de documentos. O arquivo PDF resultante conterá índice navegável e termos de juntada para download, impressão ou envio.",
    "Cap. 5.4"
  ],

  // --- Usuários externos (2 perguntas) ---
  [
    "Usuários externos",
    "Como uma pessoa de fora do órgão se cadastra?",
    "O cidadão ou interessado externo deve acessar a página pública do Portal do Usuário Externo do SEI do órgão, clicar no link \"Clique aqui se ainda não está cadastrado\", preencher o formulário eletrônico com seus dados, anexar os documentos exigidos e aguardar a validação e homologação do cadastro pelo setor competente. O e-mail cadastrado passa a ser o seu login de acesso.",
    "Cap. 6.1"
  ],
  [
    "Usuários externos",
    "Como libero um processo para um usuário externo?",
    "No processo desejado, clique no ícone \"Gerenciar Disponibilizações de Acesso Externo\" (ou \"Gerenciar Assinaturas Externas\" quando a finalidade for colher assinatura em contratos ou termos). Informe o e-mail cadastrado do usuário externo, estipule a quantidade de dias de validade do acesso, selecione os documentos liberados para consulta e registre o motivo da concessão antes de confirmar.",
    "Cap. 6.2"
  ]
];
