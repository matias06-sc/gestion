import { useEffect, useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import * as notificacionesApi from "../services/notificaciones.api.js";
import Spinner from "../components/Spinner.jsx";

export default function Notificaciones() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await notificacionesApi.listNotificaciones({});
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function leer(id) {
    await notificacionesApi.marcarLeida(id);
    await load();
  }

  if (loading) return <Spinner />;

  return (
    <div className="page-wrap max-w-3xl">
      <div>
        <h1 className="page-title">Alertas y notificaciones</h1>
        <p className="page-subtitle">Tardanzas, planillas y avisos del sistema</p>
      </div>

      <ul className="space-y-4">
        {rows.length === 0 ? (
          <li className="card p-12 text-center">
            <FiBell className="mx-auto text-4xl text-ink-faint mb-3" />
            <p className="text-ink-muted text-sm">No hay notificaciones pendientes.</p>
          </li>
        ) : (
          rows.map((n) => (
            <li
              key={n.id}
              className={`card p-5 flex justify-between gap-4 transition-all ${
                n.leida
                  ? "opacity-60 border-l-4 border-l-ink/10"
                  : "border-l-4 border-l-accent-500 shadow-glow-accent"
              }`}
            >
              <div className="flex gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  n.leida ? "bg-ink/5 dark:bg-stone-800" : "bg-accent-100 dark:bg-accent-900/30 text-accent-600"
                }`}>
                  <FiBell />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-ink-faint">{n.tipo}</p>
                  <p className="font-display font-semibold mt-0.5">{n.titulo}</p>
                  <p className="text-sm text-ink-muted dark:text-stone-300 mt-1 leading-relaxed">{n.mensaje}</p>
                  <p className="text-xs text-ink-faint mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!n.leida ? (
                <button
                  type="button"
                  onClick={() => leer(n.id)}
                  className="btn-ghost self-start !text-xs shrink-0"
                >
                  <FiCheck /> Marcar leída
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
