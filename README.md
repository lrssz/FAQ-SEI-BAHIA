# SEI Bahia · Capacitação de Servidores Municipais

Portal de capacitação e base de conhecimento para servidores e servidoras municipais no uso do **SEI Bahia** (Sistema Eletrônico de Informações).

O projeto foi estruturado de forma **modular, limpa e expansível**, separando claramente arquivos HTML por tela, folhas de estilo CSS e scripts JavaScript, sem dependência de frameworks ou compiladores.

---

## 📂 Estrutura de Arquivos

```text
siteSEI/
├── index.html          # Página de Início (Portal de Capacitação, Trilhas e Recursos)
├── faq.html            # Página de Perguntas Frequentes (21 dúvidas, busca e acordeão)
├── sobre.html          # Página Sobre o Projeto (Modernização e Pilares)
├── apostila.html       # Página da Apostila (Capítulos do Guia Prático do SEI)
├── README.md           # Documentação completa do projeto
├── css/
│   ├── global.css      # Design System: variáveis de cores, card central, cabeçalho e folhagens
│   ├── inicio.css      # Estilos da página de Início (banner hero, módulos e estatísticas)
│   └── faq.css         # Estilos da página de FAQ (busca, chips, acordeão e hero FAQ)
└── js/
    ├── theme.js        # Gerenciador global de Dark Mode (persiste no localStorage)
    ├── faq-data.js     # Banco de dados das 21 perguntas e respostas (fácil de editar)
    └── faq.js          # Lógica da busca, filtros por chips, acordeão e acessibilidade
```

---

## 🖥️ Telas do Portal

### 1. Início (`index.html`)
- **Banner de Boas-vindas:** Apresentação da capacitação com chamada direta para o FAQ e para a Apostila.
- **Trilhas de Aprendizagem (4 Módulos):**
  - Módulo 1: *Acesso e Ambientação*
  - Módulo 2: *Gestão de Processos*
  - Módulo 3: *Documentos & Assinatura*
  - Módulo 4: *Blocos de Trabalho*
- **Recursos Rápidos:** Links diretos para FAQ, Apostila, Sobre e Usuários Externos.
- **Painel de Indicadores:** Métricas de tramitação 100% eletrônica, transparência e agilidade.

### 2. FAQ (`faq.html`)
- **Busca em tempo real:** Ignora acentos e maiúsculas, com destaque de termos encontrados via `<mark>`.
- **Filtros por tema (chips com contador):** *Todos (21)*, *Acesso (3)*, *Processos (5)*, *Documentos (4)*, *Blocos (3)*, *Busca (4)* e *Usuários externos (2)*.
- **Acordeão animado e acessível:** Estruturado com `grid-template-rows: 0fr → 1fr`, atributos ARIA (`aria-expanded`, `aria-controls`) e etiquetas de referência à apostila (`Apostila · Cap. X.Y`).
- **Hero visual:** Letras gigantes "FAQ" em mármore, ilustração vetorial SVG da servidora pública com a mão no queixo e crachá do SEI, e pontos de interrogação flutuantes animados.

### 3. Sobre (`sobre.html`)
- Visão geral sobre o programa de capacitação, destacando **celeridade processual**, **segurança e integridade** e **transparência pública**.

### 4. Apostila (`apostila.html`)
- Relação dos 6 capítulos do *Guia Prático do SEI Bahia*, com referências cruzadas que levam diretamente às perguntas do FAQ.
