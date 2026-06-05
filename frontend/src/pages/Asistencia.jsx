import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import * as asistenciaApi from "../services/asistencia.api.js";
import * as empleadosApi from "../services/empleados.api.js";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Asistencia() {
  const { user } = useAuth();
  const isStaff = user?.rol === "ADMIN" || user?.rol === "RRHH";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumen, setResumen] = useState(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [empId, setEmpId] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [ausOpen, setAusOpen] = useState(false);
  const [ausForm, setAusForm] = useState({ empleadoId: "", fecha: "", notas: "" });
  const [busy, setBusy] = useState(false);

  // Estados de cámara
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (empId && isStaff) params.empleadoId = empId;
      const data = await asistenciaApi.listAsistencia(params);
      setRows(data);
      if (isStaff) {
        try {
          const r = await asistenciaApi.resumenAsistencia();
          setResumen(r);
        } catch {
          setResumen(null);
        }
      }
    } catch (e) {
      setError(e.response?.data?.error || "Error al cargar asistencia");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, empId, isStaff]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isStaff) return;
    empleadosApi.listEmpleados({ limit: 200 }).then((r) => setEmpleados(r.data || []));
  }, [isStaff]);

  // Control de cámara
  useEffect(() => {
    const showCamera = (user?.rol === "EMPLEADO" || user?.rol === "RRHH") && !empId;
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } })
        .then((s) => {
          setStream(s);
        })
        .catch((err) => {
          console.error("Error al iniciar cámara:", err);
          setError("No se pudo acceder a la cámara web. Es obligatorio permitir la cámara para marcar entrada con reconocimiento facial.");
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [user, empId]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  function captureFrame() {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 300;
    const ctx = canvas.getContext("2d");
    // Dibujar reflejado horizontalmente porque la cámara se muestra como espejo
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  async function marcarEntrada() {
    const isSelf = (user?.rol === "EMPLEADO" || user?.rol === "RRHH") && !empId;
    let capturedImage = null;

    if (isSelf) {
      capturedImage = captureFrame();
      if (!capturedImage) {
        setError("La cámara no está activa. Espera a que cargue la cámara.");
        return;
      }
    }

    if (isStaff && !empId) {
      setError("Selecciona un empleado en el filtro para marcar entrada/salida.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await asistenciaApi.entrada(
        isStaff && empId 
          ? { empleadoId: empId } 
          : { capturedImage }
      );
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo registrar entrada");
    } finally {
      setBusy(false);
    }
  }

  async function marcarSalida() {
    const isSelf = (user?.rol === "EMPLEADO" || user?.rol === "RRHH") && !empId;
    let capturedImage = null;

    if (isSelf) {
      capturedImage = captureFrame();
      if (!capturedImage) {
        setError("La cámara no está activa. Espera a que cargue la cámara.");
        return;
      }
    }

    if (isStaff && !empId) {
      setError("Selecciona un empleado en el filtro para marcar entrada/salida.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await asistenciaApi.salida(
        isStaff && empId 
          ? { empleadoId: empId } 
          : { capturedImage }
      );
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo registrar salida");
    } finally {
      setBusy(false);
    }
  }

  async function guardarAusencia() {
    setBusy(true);
    setError("");
    try {
      await asistenciaApi.ausencia(ausForm);
      setAusOpen(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo registrar ausencia");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asistencia</h1>
          <p className="page-subtitle">Control de entradas, salidas y ausencias</p>
        </div>
        {!((user?.rol === "EMPLEADO" || user?.rol === "RRHH") && !empId) && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={marcarEntrada} className="btn-success">
              Marcar entrada
            </button>
            <button type="button" disabled={busy} onClick={marcarSalida} className="btn-secondary">
              Marcar salida
            </button>
            {isStaff ? (
              <button type="button" onClick={() => setAusOpen(true)} className="btn-secondary">
                Registrar ausencia
              </button>
            ) : null}
          </div>
        )}
      </div>

      {((user?.rol === "EMPLEADO" || user?.rol === "RRHH") && !empId) ? (
        <div className="max-w-md mx-auto card p-6 flex flex-col items-center space-y-4 border-t-4 border-t-teal-500">
          <h2 className="text-lg font-display font-semibold">Reconocimiento Facial Obligatorio</h2>
          <p className="text-xs text-ink-muted text-center">
            Ubica tu rostro frente a la cámara web para registrar tu asistencia.
          </p>
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-light border-2 border-teal-200 dark:bg-surface-dark dark:border-teal-800">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-ink-faint p-4 text-center">
                <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mb-2"></div>
                <p className="text-xs">Cargando cámara web...</p>
              </div>
            )}
            <div className="absolute inset-0 border-[3px] border-dashed border-teal-500/50 rounded-lg m-6 pointer-events-none animate-pulse"></div>
          </div>
          <div className="flex w-full gap-3">
            <button
              type="button"
              disabled={busy || !stream}
              onClick={marcarEntrada}
              className="btn-success flex-1 !py-3"
            >
              {busy ? "Verificando..." : "Marcar entrada"}
            </button>
            <button
              type="button"
              disabled={busy || !stream}
              onClick={marcarSalida}
              className="btn-secondary flex-1 !py-3"
            >
              {busy ? "Verificando..." : "Marcar salida"}
            </button>
          </div>
        </div>
      ) : null}

      {isStaff && resumen ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Asistencia hoy", value: `${resumen.porcentajeAsistencia}%`, variant: "teal" },
            { label: "Puntuales", value: resumen.puntualesHoy, variant: "emerald" },
            { label: "Tardíos", value: resumen.tardiosHoy, variant: "amber" },
            { label: "Presentes", value: resumen.presentesHoy, variant: "rose" },
          ].map((s) => (
            <div key={s.label} className={`kpi-card border-l-4 ${s.variant === "teal" ? "border-l-teal-500" : s.variant === "emerald" ? "border-l-emerald-500" : s.variant === "amber" ? "border-l-amber-500" : "border-l-accent-500"}`}>
              <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">{s.label}</p>
              <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input-field" />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input-field" />
        {isStaff ? (
          <select value={empId} onChange={(e) => setEmpId(e.target.value)} className="input-field">
            <option value="">Todos los empleados</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombres} {e.apellidos}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}
        <button type="button" onClick={load} className="btn-primary">
          Aplicar filtros
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
                  <th>Fecha</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                  <th>Tardanza</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-ink-muted">
                      Sin registros
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="table-row-hover">
                      <td className="whitespace-nowrap">{r.fecha}</td>
                      <td className="font-medium">{r.nombres} {r.apellidos}</td>
                      <td><span className="stat-badge !text-[10px]">{r.estado}</span></td>
                      <td className="tabular-nums">{r.minutosTardanza} min</td>
                      <td className="text-xs">{r.entradaAt ? new Date(r.entradaAt).toLocaleString() : "—"}</td>
                      <td className="text-xs">{r.salidaAt ? new Date(r.salidaAt).toLocaleString() : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={ausOpen}
        onClose={() => !busy && setAusOpen(false)}
        title="Registrar ausencia"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setAusOpen(false)} className="btn-secondary !py-2 !px-4 text-sm">
              Cancelar
            </button>
            <button type="button" disabled={busy} onClick={guardarAusencia} className="btn-primary !py-2 !px-4 text-sm">
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
              value={ausForm.empleadoId}
              onChange={(e) => setAusForm((f) => ({ ...f, empleadoId: e.target.value }))}
              className="input-field mt-1"
            >
              <option value="">Selecciona</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombres} {e.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Fecha</label>
            <input
              type="date"
              required
              value={ausForm.fecha}
              onChange={(e) => setAusForm((f) => ({ ...f, fecha: e.target.value }))}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="label-field">Notas</label>
            <textarea
              value={ausForm.notas}
              onChange={(e) => setAusForm((f) => ({ ...f, notas: e.target.value }))}
              className="input-field mt-1"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
