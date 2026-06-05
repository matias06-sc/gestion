import { useState } from "react";
import { FiDownload, FiFileText, FiCalendar } from "react-icons/fi";
import * as reportesApi from "../services/reportes.api.js";
import { downloadBlob } from "../utils/download.js";

async function grab(url, name) {
  const blob = await reportesApi.downloadReport(url);
  downloadBlob(blob, name);
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function run(label, fn) {
    setErr("");
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      setErr(e.response?.data?.error || "Error al generar reporte");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="page-wrap max-w-4xl">
      <div>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Exportaciones PDF / Excel para auditoría y RRHH</p>
      </div>

      {err ? <p className="alert-error">{err}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ReportCard
          title="Empleados activos"
          description="Listado completo en Excel o PDF resumido."
          icon={FiFileText}
          accent="teal"
          busy={busy}
          onExcel={() =>
            run("emp-xlsx", () => grab("/reportes/empleados-activos?format=xlsx", "empleados-activos.xlsx"))
          }
          onPdf={() =>
            run("emp-pdf", () => grab("/reportes/empleados-activos?format=pdf", "empleados-activos.pdf"))
          }
        />
        <div className="card p-6 space-y-4 border-t-4 border-t-accent-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600">
              <FiCalendar />
            </div>
            <div>
              <h2 className="font-display font-semibold">Asistencia mensual</h2>
              <p className="text-sm text-ink-muted dark:text-stone-400">Excel detallado por día.</p>
            </div>
          </div>
          <input
            placeholder="YYYY-MM"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="input-field"
          />
          <button
            type="button"
            disabled={!periodo || busy}
            onClick={() =>
              run("asist", () =>
                grab(`/reportes/asistencia-mensual?periodo=${periodo}&format=xlsx`, `asistencia-${periodo}.xlsx`)
              )
            }
            className="btn-primary w-full"
          >
            <FiDownload /> Descargar Excel
          </button>
        </div>
        <ReportCard
          title="Planillas"
          description="Exporta todas las planillas o filtra por periodo en la URL del backend."
          icon={FiFileText}
          accent="amber"
          busy={busy}
          onExcel={() => run("plan", () => grab("/reportes/planillas?format=xlsx", "planillas.xlsx"))}
        />
        <ReportCard
          title="Salarios"
          description="Masa salarial por empleado activo."
          icon={FiFileText}
          accent="teal"
          busy={busy}
          onExcel={() => run("sal", () => grab("/reportes/salarios?format=xlsx", "salarios.xlsx"))}
        />
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon: Icon, accent, onExcel, onPdf, busy }) {
  const accents = {
    teal: "border-t-teal-500 bg-teal-100 dark:bg-teal-900/30 text-teal-600",
    amber: "border-t-amber-500 bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    rose: "border-t-accent-500 bg-accent-100 dark:bg-accent-900/30 text-accent-600",
  };
  return (
    <div className={`card p-6 space-y-4 border-t-4 ${accent === "amber" ? "border-t-amber-500" : accent === "rose" ? "border-t-accent-500" : "border-t-teal-500"}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accents[accent] || accents.teal}`}>
          <Icon />
        </div>
        <div>
          <h2 className="font-display font-semibold">{title}</h2>
          <p className="text-sm text-ink-muted dark:text-stone-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {onExcel ? (
          <button type="button" disabled={Boolean(busy)} onClick={onExcel} className="btn-success !py-2 !px-4 text-sm">
            <FiDownload /> Excel
          </button>
        ) : null}
        {onPdf ? (
          <button type="button" disabled={Boolean(busy)} onClick={onPdf} className="btn-secondary !py-2 !px-4 text-sm">
            <FiDownload /> PDF
          </button>
        ) : null}
      </div>
    </div>
  );
}
