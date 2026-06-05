import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiDollarSign } from "react-icons/fi";
import * as empleadosApi from "../services/empleados.api.js";
import Spinner from "../components/Spinner.jsx";

export default function EmpleadoDetalle() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const r = await empleadosApi.getEmpleado(id);
        if (!cancel) setRow(r);
      } catch (e) {
        if (!cancel) setError(e.response?.data?.error || "No se pudo cargar");
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (error) return <p className="alert-error">{error}</p>;
  if (!row) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/app/empleados" className="inline-flex items-center gap-2 text-sm link-action">
        <FiArrowLeft /> Volver al listado
      </Link>

      <div className="card overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-teal-500 via-teal-600 to-accent-500" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-8">
            {row.fotoUrl ? (
              <img
                src={row.fotoUrl}
                alt=""
                className="h-44 w-44 rounded-xl object-cover border-4 border-teal-100 dark:border-teal-900 shadow-card"
              />
            ) : (
              <div className="h-44 w-44 rounded-xl bg-gradient-to-br from-teal-100 to-accent-100 dark:from-teal-900/30 dark:to-accent-900/20 flex items-center justify-center text-ink-faint font-display text-lg">
                Sin foto
              </div>
            )}
            <div className="flex-1">
              <span className="stat-badge">{row.estado}</span>
              <h1 className="mt-3 text-3xl font-display font-semibold">
                {row.nombres} {row.apellidos}
              </h1>
              <p className="text-ink-muted dark:text-stone-400 mt-1">
                {row.cargoNombre || "—"} · {row.areaNombre || "—"}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={FiMail} label="Correo" value={row.correo} />
                <InfoItem icon={FiPhone} label="Teléfono" value={row.telefono} />
                <InfoItem icon={FiMapPin} label="Dirección" value={row.direccion || "—"} />
                <InfoItem icon={FiDollarSign} label="Salario" value={`S/ ${Number(row.salario).toFixed(2)}`} />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted dark:text-stone-400">
                <span><strong className="text-ink dark:text-stone-200">DNI:</strong> {row.dni}</span>
                <span><strong className="text-ink dark:text-stone-200">Ingreso:</strong> {String(row.fechaIngreso).slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface-light dark:bg-surface-dark p-3">
      <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
        <Icon className="text-sm" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
