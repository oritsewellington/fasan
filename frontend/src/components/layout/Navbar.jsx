import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Crown, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { selectIsAuth, selectUserRole, selectCurrentUser, logout } from '../../store/slices/authSlice.js';
import { apiSlice } from '../../store/api/apiSlice.js';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectUserRole);
  const user   = useSelector(selectCurrentUser);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled || !isHome
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
        : 'bg-transparent'
    }`}>
      <nav className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
            <Crown size={18} className="text-white" />
          </div>
          <div className="leading-none">
            <span className={`font-display font-bold text-lg transition-colors ${!scrolled && isHome ? 'text-white' : 'text-gray-900'}`}>
              FASA Awards
            </span>
            <span className={`block text-2xs font-medium tracking-wider transition-colors ${!scrolled && isHome ? 'text-gold-300' : 'text-gold-600'}`}>
              2026
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/events', label: 'Vote Now' },
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-gold-600 bg-gold-50'
                  : !scrolled && isHome
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuth ? (
            <>
              <Link
                to={role === 'admin' ? '/admin' : '/organizer'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !scrolled && isHome ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-lg transition-colors ${!scrolled && isHome ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="page-container py-4 space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/events', label: 'Vote Now' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className={`block px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === to ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {isAuth ? (
                <>
                  <Link to={role === 'admin' ? '/admin' : '/organizer'} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 text-sm font-semibold text-gold-600 hover:bg-gold-50 rounded-xl">Login â†’</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
