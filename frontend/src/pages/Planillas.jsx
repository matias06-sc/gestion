import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import * as planillasApi from "../services/planillas.api.js";
import * as empleadosApi from "../services/empleados.api.js";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";
import { downloadBlob } from "../utils/download.js";

function calcPreview(f) {
  const base = Number(f.salarioBase) || 0;
  const he = Number(f.horasExtras) || 0;
  const th = Number(f.tarifaHoraExtra) || 0;
  const bon = Number(f.bonos) || 0;
  const des = Number(f.descuentos) || 0;
  const afp = Number(f.afp) || 0;
  const imp = Number(f.impuestos) || 0;
  const bruto = base + bon + he * th;
  const neto = Math.round((bruto - des - afp - imp) * 100) / 100;
  return { bruto: Math.round(bruto * 100) / 100, neto };
}

export default function Planillas() {
  const { user } = useAuth();
  const canCreate = user?.rol === "ADMIN" || user?.rol === "RRHH";
  const [rows, setRows] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    empleadoId: "",
    periodo: "",
    salarioBase: "",
    horasExtras: "0",
    tarifaHoraExtra: "0",
    bonos: "0",
    descuentos: "0",
    afp: "0",
    impuestos: "0",
  });

  const preview = useMemo(() => calcPreview(form), [form]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, e] = await Promise.all([
        planillasApi.listPlanillas({}),
        empleadosApi.listEmpleados({ limit: 500, estado: "ACTIVO" }).catch(() => ({ data: [] })),
      ]);
      setRows(p);
      setEmpleados(e.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Error al cargar planillas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onPickEmp(id) {
    const emp = empleados.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      empleadoId: id,
      salarioBase: emp ? String(emp.salario) : "",
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await planillasApi.createPlanilla({
        empleadoId: form.empleadoId,
        periodo: form.periodo,
        salarioBase: Number(form.salarioBase),
        horasExtras: Number(form.horasExtras),
        tarifaHoraExtra: Number(form.tarifaHoraExtra),
        bonos: Number(form.bonos),
        descuentos: Number(form.descuentos),
        afp: Number(form.afp),
        impuestos: Number(form.impuestos),
      });
      setModal(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo crear la planilla");
    } finally {
      setSaving(false);
    }
  }

  async function descargar(id) {
    const blob = await planillasApi.downloadBoleta(id);
    downloadBlob(blob, `boleta-${id}.pdf`);
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Planillas</h1>
          <p className="page-subtitle">Cálculo de neto con horas extras, AFP e impuestos</p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => {
              setForm({
                empleadoId: "",
                periodo: "",
                salarioBase: "",
                horasExtras: "0",
                tarifaHoraExtra: "0",
                bonos: "0",
                descuentos: "0",
                afp: "0",
                impuestos: "0",
              });
              setModal(true);
            }}
            className="btn-primary"
          >
            Nueva planilla
          </button>
        ) : null}
      </div>

      {error ? <p className="alert-error">{error}</p> : null}

      <div className="table-wrap">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th>Periodo</th>
                  <th>Empleado</th>
                  <th>Base</th>
                  <th>Neto</th>
                  <th className="text-right">Boleta</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                      Sin planillas
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="table-row-hover">
                      <td className="font-mono font-medium">{r.periodo}</td>
                      <td className="font-medium">{r.nombres} {r.apellidos}</td>
                      <td className="tabular-nums">S/ {Number(r.salarioBase).toFixed(2)}</td>
                      <td className="tabular-nums font-semibold text-teal-600 dark:text-teal-400">
                        S/ {Number(r.neto).toFixed(2)}
                      </td>
                      <td className="text-right">
                        <button type="button" onClick={() => descargar(r.id)} className="link-action">
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => !saving && setModal(false)}
        title="Nueva planilla mensual"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => setModal(false)} className="btn-secondary !py-2 !px-4 text-sm">
              Cancelar
            </button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary !py-2 !px-4 text-sm">
              Guardar
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label-field">Empleado</label>
            <select
              required
              className="input-field mt-1"
              value={form.empleadoId}
              onChange={(e) => onPickEmp(e.target.value)}
            >
              <option value="">Selecciona</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombres} {e.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Periodo (YYYY-MM)</label>
              <input
                required
                placeholder="2025-05"
                className="input-field mt-1"
                value={form.periodo}
                onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Salario base</label>
              <input
                type="number"
                step="0.01"
                required
                className="input-field mt-1"
                value={form.salarioBase}
                onChange={(e) => setForm((f) => ({ ...f, salarioBase: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Horas extras</label>
              <input
                type="number"
                step="0.25"
                className="input-field mt-1"
                value={form.horasExtras}
                onChange={(e) => setForm((f) => ({ ...f, horasExtras: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Tarifa hora extra</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={form.tarifaHoraExtra}
                onChange={(e) => setForm((f) => ({ ...f, tarifaHoraExtra: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Bonos</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={form.bonos}
                onChange={(e) => setForm((f) => ({ ...f, bonos: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Descuentos</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={form.descuentos}
                onChange={(e) => setForm((f) => ({ ...f, descuentos: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">AFP (monto)</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={form.afp}
                onChange={(e) => setForm((f) => ({ ...f, afp: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-field">Impuestos (monto)</label>
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={form.impuestos}
                onChange={(e) => setForm((f) => ({ ...f, impuestos: e.target.value }))}
              />
            </div>
          </div>
          <div className="rounded-lg border-2 border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20 p-4 text-sm">
            <p className="text-ink-muted dark:text-stone-300">
              Bruto estimado: <span className="font-semibold">S/ {preview.bruto.toFixed(2)}</span>
            </p>
            <p className="text-teal-700 dark:text-teal-300 mt-1 text-xl font-display font-bold">
              Neto a pagar: S/ {preview.neto.toFixed(2)}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
