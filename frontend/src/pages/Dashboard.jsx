import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import * as dashboardApi from "../services/dashboard.api.js";
import * as asistenciaApi from "../services/asistencia.api.js";
import Spinner from "../components/Spinner.jsx";

function Kpi({ label, value, hint, variant }) {
  const borders = {
    teal: "border-l-teal-500",
    rose: "border-l-accent-500",
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-500",
  };
  return (
    <div className={`kpi-card border-l-4 ${borders[variant] || borders.teal}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-stone-400">{label}</p>
      <p className="mt-2 text-3xl font-display font-bold tabular-nums text-ink dark:text-stone-50">{value}</p>
      {hint ? <p className="text-xs text-ink-faint mt-1">{hint}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isStaff = user?.rol === "ADMIN" || user?.rol === "RRHH";
  const [data, setData] = useState(null);
  const [miAsistencia, setMiAsistencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (isStaff) {
          const d = await dashboardApi.getDashboard();
          if (!cancel) setData(d);
        } else {
          const rows = await asistenciaApi.listAsistencia({});
          if (!cancel) setMiAsistencia(rows.slice(0, 14));
        }
      } catch (e) {
        if (!cancel) setError(e.response?.data?.error || "No se pudo cargar el panel");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [isStaff]);

  if (loading) return <Spinner label="Cargando panel…" />;
  if (error) return <p className="alert-error">{error}</p>;

  if (!isStaff) {
    return (
      <div className="page-wrap max-w-5xl">
        <div>
          <h1 className="page-title">Mi espacio</h1>
          <p className="page-subtitle">Consulta tu historial reciente de asistencia</p>
        </div>
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Tardanza</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {miAsistencia.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-ink-muted">
                    Sin registros aún. Usa Asistencia para marcar entrada/salida.
                  </td>
                </tr>
              ) : (
                miAsistencia.map((r) => (
                  <tr key={r.id} className="table-row-hover">
                    <td>{r.fecha}</td>
                    <td>
                      <span className="stat-badge !text-[10px]">{r.estado}</span>
                    </td>
                    <td className="tabular-nums">{r.minutosTardanza} min</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const salarioData = (data.charts?.salarioPorArea || []).map((r) => ({
    name: r.area || "Sin área",
    total: Math.round(Number(r.total || 0)),
  }));

  const asistData = (data.charts?.asistenciaSemana || []).map((r) => ({
    fecha: r.fecha,
    presentes: r.presentes,
    tardios: r.tardios,
  }));

  return (
    <div className="page-wrap">
      <div>
        <h1 className="page-title">Dashboard ejecutivo</h1>
        <p className="page-subtitle">KPIs de personal, asistencia y planillas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Empleados totales" value={data.empleados.total} variant="teal" />
        <Kpi label="Activos" value={data.empleados.activos} variant="emerald" />
        <Kpi label="Ausentes hoy (estimado)" value={data.asistencia.ausentesHoy} hint="Activos sin marca de entrada" variant="amber" />
        <Kpi label="Planillas generadas" value={data.planillas.total} variant="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Masa salarial por área</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14b8a622" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-display font-semibold text-lg mb-4">Asistencia (7 días)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={asistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14b8a622" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="presentes" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488" }} />
                <Line type="monotone" dataKey="tardios" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/5 dark:border-stone-800 font-display font-semibold bg-teal-50/50 dark:bg-teal-900/10">
            Últimos empleados
          </div>
          <ul className="divide-y divide-ink/5 dark:divide-stone-800 text-sm">
            {(data.ultimosEmpleados || []).map((e) => (
              <li key={e.id} className="px-5 py-3.5 flex justify-between gap-2 table-row-hover">
                <span className="font-medium">{e.nombres} {e.apellidos}</span>
                <span className="stat-badge !text-[10px]">{e.estado}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/5 dark:border-stone-800 font-display font-semibold bg-accent-50/50 dark:bg-accent-900/10">
            Últimas planillas
          </div>
          <ul className="divide-y divide-ink/5 dark:divide-stone-800 text-sm">
            {(data.ultimosRegistros?.planillas || []).map((p) => (
              <li key={p.id} className="px-5 py-3.5 flex justify-between gap-2 table-row-hover">
                <span className="font-medium">{p.nombres} {p.apellidos}</span>
                <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">S/ {Number(p.neto).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
