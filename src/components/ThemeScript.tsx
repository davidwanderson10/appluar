// Aplica o tema salvo antes da primeira pintura, evitando o "flash" de tema errado.
const THEME_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem('luar-theme');
    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
