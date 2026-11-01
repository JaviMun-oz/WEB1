export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="Pokédex home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span>FIELD<span className="brand-light">NOTES</span></span>
      </a>
      <div className="header-tools">
        <div className="edition"><span className="edition-dot" /> NATIONAL FIELD GUIDE <span className="edition-year">№ 001</span></div>
        <button
          className="theme-toggle"
          type="button"
          aria-pressed={theme === 'ultra'}
          aria-label={`Switch to ${theme === 'ultra' ? 'Poké Ball day' : 'Ultra Ball night'} theme`}
          onClick={onToggleTheme}
        >
          <span className="theme-toggle-mark" aria-hidden="true" />
          <span>{theme === 'ultra' ? 'ULTRA BALL · NIGHT' : 'POKÉ BALL · DAY'}</span>
          <kbd>N</kbd>
        </button>
      </div>
    </header>
  );
}
