import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import * as empleadosApi from "../services/empleados.api.js";
import * as catalogosApi from "../services/catalogos.api.js";
import Modal from "../components/Modal.jsx";
import PaginationBar from "../components/PaginationBar.jsx";
import Spinner from "../components/Spinner.jsx";

const empty = {
  nombres: "",
  apellidos: "",
  dni: "",
  correo: "",
  telefono: "",
  direccion: "",
  cargoId: "",
  areaId: "",
  salario: "",
  fechaIngreso: "",
  estado: "ACTIVO",
};

export default function Empleados() {
  const { user } = useAuth();
  const canEdit = user?.rol === "ADMIN" || user?.rol === "RRHH";

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [areaId, setAreaId] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [foto, setFoto] = useState(null);
  const [facialFoto, setFacialFoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await empleadosApi.listEmpleados({
        q: dq || undefined,
        areaId: areaId || undefined,
        page,
        limit: 10,
      });
      setData(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.response?.data?.error || "Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  }, [dq, areaId, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    catalogosApi.getAreas().then(setAreas);
  }, []);

  useEffect(() => {
    catalogosApi.getCargos(form.areaId || undefined).then(setCargos);
  }, [form.areaId, modal]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setFoto(null);
    setFacialFoto(null);
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      nombres: row.nombres,
      apellidos: row.apellidos,
      dni: row.dni,
      correo: row.correo,
      telefono: row.telefono,
      direccion: row.direccion || "",
      cargoId: row.cargoId || "",
      areaId: row.areaId || "",
      salario: String(row.salario),
      fechaIngreso: String(row.fechaIngreso).slice(0, 10),
      estado: row.estado,
    });
    setFoto(null);
    setFacialFoto(null);
    setModal(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, salario: form.salario, cargoId: form.cargoId || null, areaId: form.areaId || null };
      if (editing) {
        await empleadosApi.updateEmpleado(editing.id, payload, foto || undefined, facialFoto || undefined);
      } else {
        await empleadosApi.createEmpleado(payload, foto || undefined, facialFoto || undefined);
      }
      setModal(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!delTarget) return;
    setSaving(true);
    setError("");
    try {
      await empleadosApi.deleteEmpleado(delTarget.id);
      setDelTarget(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Empleados</h1>
          <p className="page-subtitle">Directorio y expedientes</p>
        </div>
        {canEdit ? (
          <button type="button" onClick={openCreate} className="btn-primary">
            Nuevo empleado
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Buscar…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="input-field"
        />
        <select
          value={areaId}
          onChange={(e) => {
            setPage(1);
            setAreaId(e.target.value);
          }}
          className="input-field"
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
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
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Área</th>
                  <th>Cargo</th>
                  <th>Salario</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-ink-muted">
                      Sin resultados
                    </td>
                  </tr>
                ) : (
                  data.map((e) => (
                    <tr key={e.id} className="table-row-hover">
                      <td className="font-medium">
                        <Link to={`/app/empleados/${e.id}`} className="link-action">
                          {e.nombres} {e.apellidos}
                        </Link>
                      </td>
                      <td>{e.dni}</td>
                      <td>{e.areaNombre || "—"}</td>
                      <td>{e.cargoNombre || "—"}</td>
                      <td className="tabular-nums font-medium">S/ {Number(e.salario).toFixed(2)}</td>
                      <td><span className="stat-badge !text-[10px]">{e.estado}</span></td>
                      <td className="text-right space-x-2 whitespace-nowrap">
                        <Link to={`/app/empleados/${e.id}`} className="link-action">
                          Ver
                        </Link>
                        {canEdit ? (
                          <>
                            <button type="button" className="link-action" onClick={() => openEdit(e)}>
                              Editar
                            </button>
                            <button type="button" className="link-danger" onClick={() => setDelTarget(e)}>
                              Eliminar
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-ink/5 dark:border-stone-800">
          <PaginationBar meta={meta} onChange={setPage} />
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => !saving && setModal(false)}
        title={editing ? "Editar empleado" : "Nuevo empleado"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => setModal(false)} className="btn-secondary !py-2 !px-4 text-sm">
              Cancelar
            </button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary !py-2 !px-4 text-sm">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {[
            ["nombres", "Nombres"],
            ["apellidos", "Apellidos"],
            ["dni", "DNI"],
            ["correo", "Correo"],
            ["telefono", "Teléfono"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="label-field">{label}</label>
              <input
                className="input-field mt-1"
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                required
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="label-field">Dirección</label>
            <input
              className="input-field mt-1"
              value={form.direccion}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
            />
          </div>
          <div>
            <label className="label-field">Área</label>
            <select
              className="input-field mt-1"
              value={form.areaId}
              onChange={(e) => setForm((f) => ({ ...f, areaId: e.target.value, cargoId: "" }))}
            >
              <option value="">—</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Cargo</label>
            <select
              className="input-field mt-1"
              value={form.cargoId}
              onChange={(e) => setForm((f) => ({ ...f, cargoId: e.target.value }))}
            >
              <option value="">—</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Salario</label>
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={form.salario}
              onChange={(e) => setForm((f) => ({ ...f, salario: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label-field">Fecha ingreso</label>
            <input
              type="date"
              className="input-field mt-1"
              value={form.fechaIngreso}
              onChange={(e) => setForm((f) => ({ ...f, fechaIngreso: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label-field">Estado</label>
            <select
              className="input-field mt-1"
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
            >
              {["ACTIVO", "INACTIVO", "SUSPENDIDO"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Foto de Perfil (JPG/PNG)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-sm"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field text-teal-600 dark:text-teal-400">Foto de Reconocimiento Facial (Rostro claro, de frente)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-sm font-medium text-teal-600 dark:text-teal-400"
              onChange={(e) => setFacialFoto(e.target.files?.[0] || null)}
            />
            {editing?.facialFotoUrl && (
              <p className="text-xs text-ink-faint mt-1">
                Ya tiene rostro registrado. Sube otra foto para cambiarlo o actualizarlo.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(delTarget)}
        onClose={() => !saving && setDelTarget(null)}
        title="Eliminar empleado"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => setDelTarget(null)} className="btn-secondary !py-2 !px-4 text-sm">
              Cancelar
            </button>
            <button type="button" disabled={saving} onClick={confirmDelete} className="btn-danger !py-2 !px-4 text-sm">
              Eliminar
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted dark:text-stone-300">
          ¿Eliminar a {delTarget?.nombres} {delTarget?.apellidos}? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
