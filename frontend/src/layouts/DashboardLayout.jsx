import { NavLink, Outlet } from "react-router-dom";
import {
  FiBell,
  FiBriefcase,
  FiHome,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isStaff = user?.rol === "ADMIN" || user?.rol === "RRHH";
  const isSecretaria = user?.rol === "SECRETARIA";
  const isRrhh = user?.rol === "RRHH";

  const nav = [
    { to: "/app", label: "Inicio", icon: FiHome, show: true },
    { to: "/app/empleados", label: "Empleados", icon: FiUsers, show: isStaff },
    { to: "/app/asistencia", label: "Asistencia", icon: FiCalendar, show: true },
    { to: "/app/planillas", label: "Planillas", icon: FiBriefcase, show: true },
    { to: "/app/reportes", label: "Reportes", icon: FiFileText, show: isStaff },
    { to: "/app/notificaciones", label: "Alertas", icon: FiBell, show: true },
    { to: "/app/secretaria/usuarios-planilla", label: "Usuarios planilla", icon: FiUsers, show: isSecretaria },
    { to: "/app/rrhh/usuarios-empleados", label: "Usuarios empleados", icon: FiUsers, show: isRrhh },
  ].filter((n) => n.show);

  return (
    <div className="min-h-full flex flex-col mesh-bg">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-surface-card/80 backdrop-blur-xl dark:border-stone-800 dark:bg-surface-card-dark/80">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-semibold text-ink dark:text-stone-100 leading-tight">Meridian</p>
                <p className="text-[10px] uppercase tracking-widest text-ink-faint">Gestión de personal</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/app"}
                  className={({ isActive }) =>
                    `nav-pill ${isActive ? "nav-pill-active" : "nav-pill-inactive"}`
                  }
                >
                  <n.icon className="text-base" />
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="stat-badge">{user?.rol}</span>
                <span className="text-xs text-ink-muted dark:text-stone-500 max-w-[140px] truncate">
                  {user?.email}
                </span>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="rounded-lg border-2 border-ink/10 p-2 text-ink-muted hover:border-teal-500/30 hover:text-teal-600 transition-colors dark:border-stone-700 dark:hover:border-teal-500/30 dark:hover:text-teal-400"
                title="Cambiar tema"
              >
                {dark ? <FiSun /> : <FiMoon />}
              </button>
              <button
                type="button"
                onClick={logout}
                className="hidden sm:flex items-center gap-2 rounded-lg border-2 border-ink/10 px-3 py-2 text-sm font-medium text-ink-muted hover:border-rose-300 hover:text-rose-600 transition-colors dark:border-stone-700 dark:hover:border-rose-800 dark:hover:text-rose-400"
              >
                <FiLogOut /> <span className="hidden md:inline">Salir</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden rounded-lg border-2 border-ink/10 p-2 text-ink-muted dark:border-stone-700"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen ? (
          <div className="lg:hidden border-t border-ink/5 dark:border-stone-800 px-4 py-3 space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/app"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "text-ink-muted hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  }`
                }
              >
                <n.icon />
                {n.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <FiLogOut /> Cerrar sesión
            </button>
          </div>
        ) : null}
      </header>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-ink/5 dark:border-stone-800 py-4 text-center text-xs text-ink-faint">
        Meridian © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
