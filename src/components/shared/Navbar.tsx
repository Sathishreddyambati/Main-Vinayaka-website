import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Flame } from 'lucide-react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/updates', label: 'Updates' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-charcoal/80 backdrop-blur-md border-b border-copper/10">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Flame size={18} className="text-saffron group-hover:animate-flicker" />
          <span className="font-display text-sm sm:text-base tracking-wide text-ivory">
            MMR YOUTH FORCE
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors ${
                  isActive ? 'text-saffron' : 'text-ivory/70 hover:text-ivory'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/#support"
            className="text-sm px-4 py-2 rounded-full border border-copper/40 text-copper-light hover:border-saffron hover:text-saffron transition-colors"
          >
            Donate
          </Link>
        </div>

        <button
          className="md:hidden text-ivory"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-copper/10 px-5 py-4 flex flex-col gap-4 bg-charcoal">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-ivory/80 text-sm" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/#support" className="text-saffron text-sm" onClick={() => setOpen(false)}>
            Donate
          </Link>
        </div>
      )}
    </header>
  );
}
