# SEI Bahia · Capacitação de Servidores Municipais

Portal de capacitação e base de conhecimento para servidores e servidoras municipais no uso do **SEI Bahia** (Sistema Eletrônico de Informações).

O projeto foi estruturado de forma **modular, limpa e expansível**, separando claramente arquivos HTML por tela, folhas de estilo CSS e scripts JavaScript, sem dependência de frameworks ou compiladores.

---

## 📂 Estrutura de Arquivos

```text
siteSEI/
├── index.html          # Página de Início (Apresentação do Projeto, Trilhas e Recursos)
├── apostila.html       # Página da Apostila (6 Capítulos e Acesso ao PDF Oficial)
├── faq.html            # Página de Perguntas Frequentes (21 dúvidas, busca e acordeão)
├── guia-pratico-sei.pdf# Apostila Oficial em PDF (Guia Prático do SEI Bahia)
├── README.md           # Documentação completa do projeto
├── css/
│   ├── global.css      # Design System: variáveis de cores, card central, cabeçalho e folhagens
│   ├── inicio.css      # Estilos da página de Início (banner hero, sobre o projeto, módulos)
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
- **Seção Sobre o Projeto:** Apresentação institucional acolhedora sobre o material de apoio para capacitação de servidores municipais da Bahia, alinhamento à apostila "Guia Prático do SEI" e ao curso SEI! USAR (Escola Virtual Gov - EV.G), créditos da parceria (FAPESB, IFBA Campus Paulo Afonso e NCTI) e atalhos rápidos para o FAQ e download do PDF.
- **Trilhas de Aprendizagem (4 Módulos):**
  - Módulo 1: *Acesso e Ambientação*
  - Módulo 2: *Gestão de Processos*
  - Módulo 3: *Documentos & Assinatura*
  - Módulo 4: *Blocos de Trabalho*
- **Recursos Rápidos:** Links diretos para FAQ, Apostila, Download do PDF e Usuários Externos.
- **Painel de Indicadores:** Métricas de tramitação 100% eletrônica, transparência e agilidade.

### 2. Apostila (`apostila.html`)
- Apresentação dos **6 capítulos** estruturais do manual de capacitação municipal:
  1. *Introdução*
  2. *Operações com processos*
  3. *Operações com documentos*
  4. *Utilização de blocos*
  5. *Recuperação de informações*
  6. *Usuários externos*
- Botões de ação integrados: **"Abrir no navegador"** (abre o PDF oficial em nova aba) e **"Baixar PDF"** (download direto).
- Em cada capítulo: atalhos para abrir diretamente o PDF e consultar dúvidas no FAQ.

### 3. FAQ (`faq.html`)
- **Busca em tempo real:** Ignora acentos e maiúsculas, com destaque de termos encontrados via `<mark>`.
- **Filtros por tema (chips com contador):** *Todos (21)*, *Acesso (3)*, *Processos (5)*, *Documentos (4)*, *Blocos (3)*, *Busca (4)* e *Usuários externos (2)*.
- **Acordeão animado e acessível:** Estruturado com `grid-template-rows: 0fr → 1fr`, atributos ARIA (`aria-expanded`, `aria-controls`) e etiquetas de referência à apostila (`Apostila · Cap. X.Y`).
- **Hero visual:** Letras gigantes "FAQ" em mármore, ilustração vetorial SVG da servidora pública com a mão no queixo e crachá do SEI, e pontos de interrogação flutuantes animados.

---

