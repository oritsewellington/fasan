import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Receipt,
  Tag,
  LogOut,
  Crown,
} from "lucide-react";
import { logout, selectCurrentUser } from "../store/slices/authSlice.js";
import { apiSlice } from "../store/api/apiSlice.js";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/staff", label: "Staff", icon: Users },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
];

export default function AdminLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-gray-950 text-gray-300 fixed h-screen">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
            <Crown size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm leading-none">
              FASA Admin
            </p>
            <p className="text-gold-400 text-2xs mt-0.5">2026</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-500/10 text-gold-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-gray-800 flex justify-around py-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-2xs font-medium ${isActive ? "text-gold-400" : "text-gray-500"}`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
