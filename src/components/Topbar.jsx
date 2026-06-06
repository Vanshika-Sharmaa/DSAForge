import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { path: "/", label: "Visualizer", icon: "▶" },
  { path: "/sort", label: "Sort", icon: "⇅" },
  { path: "/search", label: "Search", icon: "⌕" },
  { path: "/graph", label: "Graph", icon: "⬡" },
  { path: "/complexity", label: "Complexity", icon: "∑" },
  { path: "/playground", label: "Playground", icon: "{ }" },
  { path: "/ai", label: "AI Analyzer", icon: "✦" },
];

export default function Topbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="brand-icon">⟨/⟩</span>
        <span className="brand-name">DSA<span className="brand-accent">Algo</span></span>
      </div>

      <nav className={`topbar-nav ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </Link>
        ))}
      </nav>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✕" : "☰"}
      </button>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 60px;
          background: #0d0d0d;
          border-bottom: 1px solid #1e1e1e;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 700;
          color: #e2e2e2;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .brand-icon { color: #00ff88; font-size: 1.1rem; }
        .brand-accent { color: #00ff88; }
        .topbar-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          color: #888;
          text-decoration: none;
          font-size: 0.78rem;
          font-weight: 500;
          transition: all 0.15s;
          letter-spacing: 0.3px;
        }
        .nav-link:hover { color: #e2e2e2; background: #1a1a1a; }
        .nav-link.active { color: #00ff88; background: rgba(0,255,136,0.08); }
        .nav-icon { font-size: 0.9rem; }
        .menu-toggle {
          display: none;
          background: none;
          border: 1px solid #333;
          color: #aaa;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        @media (max-width: 768px) {
          .menu-toggle { display: block; }
          .topbar-nav {
            display: none;
            position: absolute;
            top: 60px; left: 0; right: 0;
            flex-direction: column;
            background: #0d0d0d;
            border-bottom: 1px solid #1e1e1e;
            padding: 1rem;
            gap: 0.5rem;
          }
          .topbar-nav.open { display: flex; }
          .nav-link { width: 100%; padding: 0.6rem 1rem; }
        }
      `}</style>
    </header>
  );
}