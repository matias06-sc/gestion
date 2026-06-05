import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const loc = useLocation();

  let defaultDest = "/app";
  if (user && (user.rol === "EMPLEADO" || user.rol === "RRHH")) {
    defaultDest = "/app/asistencia";
  }

  let from = loc.state?.from?.pathname || defaultDest;
  if (from === "/app" || from === "/") {
    from = defaultDest;
  }

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(usuario.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex mesh-bg">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-accent-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-8">
            <span className="font-display font-bold text-3xl">M</span>
          </div>
          <h2 className="text-4xl font-display font-semibold leading-tight">
            Bienvenido a Meridian
          </h2>
          <p className="mt-4 text-lg text-white/80 leading-relaxed max-w-md">
            Accede a tu panel de gestión de personal, asistencia y planillas.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-teal-600 mb-8 transition-colors">
            <FiArrowLeft /> Volver al inicio
          </Link>

          <div className="card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <FiLock />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold">Iniciar sesión</h1>
                <p className="text-sm text-ink-muted dark:text-stone-400">Ingresa tus credenciales</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label-field">Usuario o correo</label>
                <input
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="input-field mt-1.5"
                  placeholder="admin@empresa.demo"
                />
              </div>
              <div>
                <label className="label-field">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1.5"
                  placeholder="••••••••"
                />
              </div>
              {error ? <p className="alert-error">{error}</p> : null}
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? "Entrando…" : "Entrar al sistema"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink-muted dark:text-stone-400">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
