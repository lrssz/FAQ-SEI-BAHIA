/**
 * SEI Bahia · Capacitação - Gerenciador de Tema Claro / Escuro
 * Persiste a escolha do usuário no localStorage e sincroniza com preferências do sistema.
 */

(function () {
  const THEME_KEY = 'seibahia-theme';

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    atualizarIconeTema(tema);
  }

  function atualizarIconeTema(tema) {
    const themeIcon = document.getElementById('themeIcon');
    const themeToggle = document.getElementById('themeToggle');
    if (!themeIcon || !themeToggle) return;

    if (tema === 'dark') {
      // Ícone do Sol (para voltar ao claro)
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      themeToggle.setAttribute('aria-label', 'Mudar para tema claro');
      themeToggle.setAttribute('title', 'Mudar para tema claro');
    } else {
      // Ícone da Lua (para ir ao escuro)
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      themeToggle.setAttribute('aria-label', 'Mudar para tema escuro');
      themeToggle.setAttribute('title', 'Mudar para tema escuro');
    }
  }

  function obterTemaAtual() {
    const salvo = localStorage.getItem(THEME_KEY);
    if (salvo) return salvo;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Inicialização
  const temaInicial = obterTemaAtual();
  aplicarTema(temaInicial);

  // Listener para o botão de alternância
  document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    atualizarIconeTema(obterTemaAtual());

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const atual = document.documentElement.getAttribute('data-theme') || obterTemaAtual();
        const novoTema = atual === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, novoTema);
        aplicarTema(novoTema);
      });
    }
  });

  // Reagir a mudanças nas preferências do sistema operacional
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      aplicarTema(e.matches ? 'dark' : 'light');
    }
  });
})();
