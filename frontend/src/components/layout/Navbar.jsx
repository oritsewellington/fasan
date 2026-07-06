﻿import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectUserRole);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-gradient-to-b from-black/60 via-black/30 to-transparent"
        }`}
      />
      <nav className="relative page-container flex items-center justify-between h-16">
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
              <span
                className={`font-display font-extrabold text-lg tracking-tight transition-colors ${
                  !scrolled && isHome ? "text-white" : "text-gray-900"
                }`}
              >
                FASA
              </span>
              <span
                className={`font-display font-medium text-lg tracking-tight transition-colors ${
                  !scrolled && isHome ? "text-white/70" : "text-gray-400"
                }`}
              >
                Awards
              </span>
            </div>
            <span
              className={`inline-flex items-center mt-1 px-1.5 py-[1px] rounded-full text-[9px] font-bold tracking-widest ${
                !scrolled && isHome
                  ? "bg-white/15 text-gold-300"
                  : "bg-gold-50 text-gold-700 border border-gold-200"
              }`}
            >
              2026 EDITION
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isResults = to === "/polls";
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "text-gold-600 bg-gold-50"
                    : !scrolled && isHome
                      ? "text-white/80 hover:text-white hover:bg-white/10"
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !scrolled && isHome
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
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
          className={`md:hidden p-2 rounded-lg transition-colors ${!scrolled && isHome ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="page-container py-4 space-y-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isResults = to === "/polls";
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === to ? "bg-gold-50 text-gold-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {isResults ? (
                    <Trophy size={15} className="text-gold-500" />
                  ) : null}
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
      )}
    </header>
  );
}
