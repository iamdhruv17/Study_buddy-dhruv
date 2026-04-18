import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const BellIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const Navbar = ({ pageTitle = '' }) => {
  const { state } = useContext(AppContext);
  const { auth }  = state;

  const initials = auth.user?.name
    ? auth.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SB';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-6 border-b bg-surface-900/80 border-white/8 backdrop-blur-md"
      style={{ paddingLeft: 'calc(var(--sidebar-w) + 1.5rem)' }}
    >
      {/* Left — Page title */}
      <div className="flex flex-col">
        <span className="text-lg font-semibold font-display text-white">{pageTitle}</span>
        <span className="text-2xs text-white/40 font-body -mt-0.5 hidden sm:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 text-white/50 hover:text-white hover:bg-white/8">
          <BellIcon />
        </button>
        <div className="w-px h-5 mx-1 bg-white/10" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white font-display shadow-glow-brand">
            {initials}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium font-body leading-none text-white/90">
              {auth.user?.name || 'Student'}
            </span>
            <span className="text-2xs text-white/40 font-body mt-0.5">{auth.user?.email || ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;