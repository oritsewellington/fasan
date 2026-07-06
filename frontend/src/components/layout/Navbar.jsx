import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Crown, Menu, X, LogOut, LayoutDashboard, Trophy } from "lucide-react";
import {
  selectIsAuth,
  selectUserRole,
  selectCurrentUser,
  logout,
} from "../../store/slices/authSlice.js";
import { apiSlice } from "../../store/api/apiSlice.js";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Vote Now" },
  { to: "/polls", label: "Results" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectUserRole);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Lock background scroll while the mobile menu is open — otherwise the
  // page behind it scrolls along with a finger swipe meant for the menu,
  // which reads as another "unresponsive nav" bug even though it's really
  // a scroll issue.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    setOpen(false);
    navigate("/");
  };

  return (
    // Always-opaque header. No transparent/hero-blend variant — this is
    // the fix for both the invisible-white-text issue (no contrast
    // guesswork against a photo) and the unclickable-mobile-links issue
    // (no separate absolute background layer competing for stacking
    // order with the dropdown beneath it).
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gold-400/40 blur-lg rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold ring-1 ring-gold-200/50 group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform duration-300">
              <div className="absolute inset-[3px] rounded-[9px] border border-white/25" />
              <Crown
                size={18}
                className="text-white relative z-10"
                strokeWidth={2.25}
              />
            </div>
          </div>

          <div className="leading-none">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight text-gray-900">
                FASA
              </span>
              <span className="font-display font-medium text-lg tracking-tight text-gray-400">
                Awards
              </span>
            </div>
            <span className="inline-flex items-center mt-1 px-1.5 py-[1px] rounded-full text-[9px] font-bold tracking-widest bg-gold-50 text-gold-700 border border-gold-200">
              2026 EDITION
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isResults = to === "/polls";
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gold-600 bg-gold-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {isResults && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuth ? (
            <>
              <Link
                to={role === "admin" ? "/admin" : "/organizer"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
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
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu — rendered as a fixed overlay below the header, not
          an in-flow block, so it can never get trapped behind another
          positioned layer regardless of header height changes. */}
      {open && (
        <>
          {/* Backdrop: dims the page and lets a tap outside the menu
              close it, same pattern as most native mobile nav drawers. */}
          <div
            className="md:hidden fixed inset-0 top-16 z-40 bg-black/30 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-t border-gray-100 shadow-lg animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="page-container py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => {
                const isResults = to === "/polls";
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-gold-50 text-gold-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isResults && (
                      <Trophy size={15} className="text-gold-500" />
                    )}
                    {label}
                    {isResults && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-auto" />
                    )}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 pt-2 mt-2">
                {isAuth ? (
                  <>
                    <Link
                      to={role === "admin" ? "/admin" : "/organizer"}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm font-semibold text-gold-600 hover:bg-gold-50 rounded-xl"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
