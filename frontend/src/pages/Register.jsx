import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const dest = user && (user.rol === "EMPLEADO" || user.rol === "RRHH") ? "/app/asistencia" : "/app";
    return <Navigate to={dest} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex mesh-bg">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-teal-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-8">
            <span className="font-display font-bold text-3xl">M</span>
          </div>
          <h2 className="text-4xl font-display font-semibold leading-tight">
            Únete a Meridian
          </h2>
          <p className="mt-4 text-lg text-white/80 leading-relaxed max-w-md">
            Crea tu cuenta de administrador o RRHH y comienza a gestionar tu equipo.
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
              <div className="h-10 w-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
                <FiUserPlus />
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold">Crear cuenta</h1>
                <p className="text-sm text-ink-muted dark:text-stone-400">
                  Primer usuario: <span className="font-semibold text-teal-600">ADMIN</span> · Siguientes:{" "}
                  <span className="font-semibold text-accent-600">RRHH</span>
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label-field">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field mt-1.5"
                  placeholder="tu@empresa.com"
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
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="label-field">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="input-field mt-1.5"
                  placeholder="Repite tu contraseña"
                />
              </div>
              {error ? <p className="alert-error">{error}</p> : null}
              <button type="submit" disabled={loading} className="btn-accent w-full !py-3">
                {loading ? "Creando…" : "Crear mi cuenta"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink-muted dark:text-stone-400">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
