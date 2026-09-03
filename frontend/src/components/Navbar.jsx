import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, Bug, AlertTriangle, BookOpen, FlaskConical, CloudSun, ScanLine, Mic, HelpCircle, Activity } from 'lucide-react';
import LanguageSelector from './LanguageSelector.jsx';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { to: '/', key: 'nav.home', icon: Sprout },
  { to: '/result', key: 'nav.detection', icon: Activity },
  { to: '/pest', key: 'nav.pest', icon: Bug },
  { to: '/alerts', key: 'nav.alerts', icon: AlertTriangle },
  { to: '/advisory', key: 'nav.advisory', icon: BookOpen },
  { to: '/fertilizer', key: 'nav.fertilizer', icon: FlaskConical },
  { to: '/weather', key: 'nav.weather', icon: CloudSun },
  { to: '/soil', key: 'nav.soil', icon: ScanLine },
  { to: '/voice', key: 'nav.voice', icon: Mic },
  { to: '/ask', key: 'nav.ask', icon: HelpCircle },
];

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-leaf-800 via-leaf-700 to-leaf-900 text-white shadow-lg border-b border-leaf-600/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-leaf-500/30 flex items-center justify-center border border-leaf-400/40 group-hover:scale-105 transition">
            <Sprout size={22} className="text-leaf-300" />
          </div>
          <div>
            <span className="font-heading bg-gradient-to-r from-white via-leaf-100 to-amber-200 bg-clip-text text-transparent font-extrabold">
              {t('appName')}
            </span>
            <span className="hidden sm:inline-block text-[10px] ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30 uppercase tracking-widest font-semibold">
              AI Agri
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium">
          {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-leaf-800 font-semibold shadow-sm'
                    : 'text-leaf-100 hover:bg-leaf-600/60 hover:text-white'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-leaf-600' : 'text-leaf-300'} />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Language Selector & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <LanguageSelector />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-leaf-700 hover:bg-leaf-600 transition text-leaf-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-leaf-900 border-t border-leaf-700/80 px-4 py-4 space-y-1 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-leaf-500 text-white font-bold'
                      : 'text-leaf-100 hover:bg-leaf-800'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-leaf-300'} />
                  <span className="truncate">{t(key)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
