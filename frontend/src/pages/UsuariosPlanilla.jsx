import { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";
import api from "../services/api.js";
import * as empleadosApi from "../services/empleados.api.js";
import * as catalogosApi from "../services/catalogos.api.js";
import { useAuth } from "../context/AuthContext.jsx";

function isoFromLocal(dtLocal) {
  // dtLocal: yyyy-MM-ddTHH:mm
  const d = new Date(dtLocal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function UsuariosPlanilla() {
  const { user } = useAuth();
  const isRrhh = user?.rol === "RRHH";
  const roleOptions = isRrhh
    ? [{ value: "EMPLEADO", label: "EMPLEADO" }]
    : [
        { value: "ADMIN", label: "ADMIN" },
        { value: "RRHH", label: "RRHH" },
        { value: "SECRETARIA", label: "SECRETARIA" },
      ];

  const [rows, setRows] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    rol: isRrhh ? "EMPLEADO" : "RRHH",
    empleadoId: "",
    untilLocal: "",
    ownerAdminId: "",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/secretaria/usuarios-planilla");
      setRows(data);
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    empleadosApi
      .listEmpleados({ limit: 500 })
      .then((r) => setEmpleados(r.data || []))
      .catch(() => setEmpleados([]));
  }, []);

  useEffect(() => {
    if (isRrhh) return;
    catalogosApi
      .getAdmins()
      .then((data) => setAdmins(data || []))
      .catch(() => setAdmins([]));
  }, [isRrhh]);

  async function save() {
    let untilIso = null;
    if (form.rol === "EMPLEADO") {
      if (!form.empleadoId) {
        setError("Selecciona el empleado a vincular");
        return;
      }
      untilIso = isoFromLocal(form.untilLocal);
      if (!untilIso) {
        setError("Fecha/hora de vencimiento inválida");
        return;
      }
    }
    if (user?.rol === "SECRETARIA" && form.rol === "RRHH" && !form.ownerAdminId) {
      setError("Selecciona el admin al que quedará vinculado RRHH");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/secretaria/usuarios-planilla/${editing.id}`, {
          rol: form.rol,
          empleadoId: form.rol === "EMPLEADO" ? form.empleadoId : null,
          password: form.password || undefined,
          planillaAccessUntil: untilIso,
          ownerAdminId: form.rol === "RRHH" ? form.ownerAdminId || null : null,
        });
      } else {
        await api.post("/secretaria/usuarios-planilla", {
          username: form.username.trim(),
          password: form.password,
          rol: form.rol,
          empleadoId: form.rol === "EMPLEADO" ? form.empleadoId : null,
          planillaAccessUntil: untilIso,
          ownerAdminId: form.rol === "RRHH" ? form.ownerAdminId || null : null,
        });
      }
      setOpen(false);
      setEditing(null);
      setForm({
        username: "",
        password: "",
        rol: isRrhh ? "EMPLEADO" : "RRHH",
        empleadoId: "",
        untilLocal: "",
        ownerAdminId: "",
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo guardar usuario");
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      username: "",
      password: "",
      rol: isRrhh ? "EMPLEADO" : "RRHH",
      empleadoId: "",
      untilLocal: "",
      ownerAdminId: "",
    });
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      username: row.username || "",
      password: "",
      rol: row.rol || "EMPLEADO",
      empleadoId: row.empleadoId || "",
      ownerAdminId: row.ownerAdminId || "",
      untilLocal: row.planillaAccessUntil
        ? new Date(new Date(row.planillaAccessUntil).getTime() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : "",
    });
    setOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setError("");
    try {
      await api.delete(`/secretaria/usuarios-planilla/${deleting.id}`);
      setDeleting(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo eliminar usuario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-wrap max-w-5xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isRrhh ? "Usuarios empleados" : "Usuarios internos"}
          </h1>
          <p className="page-subtitle">
            Crea usuarios por <span className="font-semibold text-teal-600">username</span> (sin correo) y elige su rol.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          Nuevo usuario
        </button>
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
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Admin vinculado</th>
                  <th>Vence</th>
                  <th>Creado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-ink-muted">
                      No hay usuarios creados aún.
                    </td>
                  </tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <td className="font-mono font-medium">{u.username}</td>
                      <td><span className="stat-badge !text-[10px]">{u.rol}</span></td>
                      <td>
                        {u.ownerAdminId
                          ? admins.find((a) => a.id === u.ownerAdminId)?.email ||
                            admins.find((a) => a.id === u.ownerAdminId)?.username ||
                            "Admin"
                          : "—"}
                      </td>
                      <td>
                        {u.planillaAccessUntil ? new Date(u.planillaAccessUntil).toLocaleString() : "—"}
                      </td>
                      <td className="text-xs text-ink-faint">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td className="text-right space-x-2">
                        <button type="button" onClick={() => openEdit(u)} className="link-action">
                          Editar
                        </button>
                        <button type="button" onClick={() => setDeleting(u)} className="link-danger">
                          Eliminar
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
        open={open}
        onClose={() => !saving && setOpen(false)}
        title={editing ? "Editar usuario" : "Crear usuario"}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Cancelar
            </button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary !py-2 !px-4 text-sm">
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label-field">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              disabled={Boolean(editing)}
              className="input-field mt-1"
              placeholder="ej: planilla01"
            />
          </div>
          <div>
            <label className="label-field">
              Contraseña {editing ? "(opcional para cambiar)" : ""}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field mt-1"
              placeholder={editing ? "dejar vacío para mantener" : "mínimo 6 caracteres"}
            />
          </div>
          <div>
            <label className="label-field">Rol</label>
            <select
              value={form.rol}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rol: e.target.value,
                  empleadoId: e.target.value === "EMPLEADO" ? f.empleadoId : "",
                }))
              }
              className="input-field mt-1"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {form.rol === "EMPLEADO" ? (
            <div>
              <label className="label-field">Empleado vinculado</label>
              <select
                value={form.empleadoId}
                onChange={(e) => setForm((f) => ({ ...f, empleadoId: e.target.value }))}
                className="input-field mt-1"
              >
                <option value="">Selecciona empleado</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombres} {e.apellidos}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {user?.rol === "SECRETARIA" && form.rol === "RRHH" ? (
            <div>
              <label className="label-field">Admin vinculado</label>
              <select
                value={form.ownerAdminId}
                onChange={(e) => setForm((f) => ({ ...f, ownerAdminId: e.target.value }))}
                className="input-field mt-1"
              >
                <option value="">Selecciona admin</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.email || a.username || a.id}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="label-field">Vencimiento (fecha y hora)</label>
            <input
              type="datetime-local"
              value={form.untilLocal}
              onChange={(e) => setForm((f) => ({ ...f, untilLocal: e.target.value }))}
              disabled={form.rol !== "EMPLEADO"}
              className="input-field mt-1"
            />
            <p className="mt-1 text-xs text-ink-faint">
              Solo aplica para rol <span className="font-semibold">EMPLEADO</span>; en otros roles se ignora.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => !saving && setDeleting(null)}
        title="Eliminar usuario"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => setDeleting(null)} className="btn-secondary !py-2 !px-4 text-sm">
              Cancelar
            </button>
            <button type="button" disabled={saving} onClick={confirmDelete} className="btn-danger !py-2 !px-4 text-sm">
              Eliminar
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted dark:text-stone-300">
          ¿Eliminar al usuario <span className="font-semibold">{deleting?.username}</span>?
        </p>
      </Modal>
    </div>
  );
}

