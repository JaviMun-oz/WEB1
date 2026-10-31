export default function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="Pokédex home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span>FIELD<span className="brand-light">NOTES</span></span>
      </a>
      <div className="edition"><span className="edition-dot" /> NATIONAL FIELD GUIDE <span className="edition-year">№ 001</span></div>
    </header>
  );
}
