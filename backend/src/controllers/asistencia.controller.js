import { get } from "../db/index.js";
import { HttpError } from "../utils/httpError.js";
import * as asistenciaService from "../services/asistencia.service.js";

async function verificarRostro(user, capturedImage) {
  if (user.rol === "EMPLEADO" || user.rol === "RRHH") {
    const empleadoId = user.empleadoId;
    if (!empleadoId) {
      throw new HttpError(400, "Tu usuario no está vinculado a un empleado.");
    }

    const emp = await get("SELECT facialFotoPath FROM empleados WHERE id = ?", [empleadoId]);
    if (!emp || !emp.facialFotoPath) {
      throw new HttpError(400, "No tienes una foto facial de referencia registrada. Solicita a un Administrador que registre tu rostro.");
    }

    if (!capturedImage) {
      throw new HttpError(400, "La foto de la cámara web es obligatoria para verificar tu identidad.");
    }

    try {
      const verifyRes = await fetch("http://localhost:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captured_image: capturedImage,
          reference_image_path: emp.facialFotoPath
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.match) {
        throw new HttpError(400, verifyData.error || "El reconocimiento facial falló. Tu rostro no coincide con la foto registrada.");
      }
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, `Error de conexión con el servicio facial: ${err.message}`);
    }
  }
}

export async function entrada(req, res) {
  await verificarRostro(req.user, req.body.capturedImage);
  const row = await asistenciaService.registrarEntrada(req.user, req.body);
  res.status(201).json(row);
}

export async function salida(req, res) {
  await verificarRostro(req.user, req.body.capturedImage);
  const row = await asistenciaService.registrarSalida(req.user, req.body);
  res.json(row);
}

export async function ausencia(req, res) {
  const row = await asistenciaService.marcarAusencia(req.user, req.body);
  res.status(201).json(row);
}

export async function list(req, res) {
  const rows = await asistenciaService.listAsistencias(req.query, req.user);
  res.json(rows);
}

export async function resumen(req, res) {
  const data = await asistenciaService.dashboardAsistenciaResumen(req.user);
  res.json(data);
}
