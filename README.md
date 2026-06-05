# Meridian — Sistema de Gestión de Empleados y Planillas

Aplicación empresarial **full-stack** para gestión de personal, asistencia y planillas.

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Router |
| **Backend** | Node.js, Express, SQLite (better-sqlite3), JWT |
| **Base de datos** | SQLite con SQL explícito (sin ORM) |

## Características

- Autenticación JWT con roles: `ADMIN`, `RRHH`, `EMPLEADO`, `SECRETARIA`
- Dashboard con KPIs y gráficos interactivos
- CRUD de empleados con foto y reconocimiento facial
- Control de asistencia con cámara web y tardanzas automáticas
- Planillas mensuales con cálculo de neto y boleta PDF
- Reportes exportables en Excel y PDF
- Notificaciones in-app y modo oscuro

## Requisitos previos

- **Node.js 18+** — [Descargar Node.js](https://nodejs.org/)
- **npm** (incluido con Node.js)

## Cómo ejecutar el proyecto

El proyecto tiene dos partes independientes: **backend** (API) y **frontend** (interfaz). Debes ejecutar ambas en terminales separadas.

### Paso 1 — Configurar y arrancar el backend

```bash
cd backend
```

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

Luego instala dependencias, carga datos de demostración e inicia el servidor:

```bash
npm install
npm run seed
npm run dev
```

El backend quedará disponible en **http://localhost:4000**.

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run start` | Servidor de producción |
| `npm run seed` | Carga usuarios y datos de demostración |

### Paso 2 — Arrancar el frontend

Abre una **segunda terminal** y ejecuta:

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

El proxy de Vite reenvía automáticamente las peticiones `/api` y `/uploads` al backend en el puerto 4000.

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción |

### Resumen rápido

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run seed && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Luego abre: **http://localhost:5173**

## Usuarios de demostración

Tras ejecutar `npm run seed` en el backend:

| Rol | Email / Usuario | Contraseña |
|-----|-----------------|------------|
| ADMIN | admin@empresa.demo | Admin123! |
| RRHH | rrhh@empresa.demo | Rrhh123! |
| EMPLEADO | empleado@empresa.demo | Emp123! |
| SECRETARIA | secretaria@empresa.demo | Sec123! |

> Si ya registraste un usuario desde la UI, el seed no sobrescribe datos existentes. Para reiniciar, borra `backend/data/empresa.db` y vuelve a ejecutar `npm run seed`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto de la API | `4000` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | — |
| `DATABASE_PATH` | Ruta del archivo SQLite | `data/empresa.db` |
| `CORS_ORIGIN` | Origen permitido del frontend | `http://localhost:5173` |
| `UPLOAD_DIR` | Carpeta de fotos de empleados | `uploads` |
| `ATTENDANCE_EXPECTED_TIME` | Hora esperada de entrada (`HH:mm`) | `08:00` |
| `ATTENDANCE_GRACE_MINUTES` | Minutos de gracia antes de tardanza | `10` |
| `SMTP_*` | Configuración de correo (opcional) | — |

### Frontend (`frontend/.env`) — opcional

Solo necesario si no usas el proxy de Vite (por ejemplo, en producción):

```
VITE_API_URL=http://localhost:4000/api
```

## Estructura del proyecto

```
inteligent-master/
├── backend/
│   └── src/
│       ├── config/         # Variables de entorno
│       ├── controllers/    # Controladores REST
│       ├── db/             # Esquema y conexión SQLite
│       ├── middlewares/    # Auth, roles, uploads
│       ├── routes/         # Rutas de la API
│       ├── services/       # Lógica de negocio
│       └── app.js          # Punto de entrada
├── frontend/
│   └── src/
│       ├── components/     # Modal, Spinner, PaginationBar
│       ├── context/        # Auth y tema (dark mode)
│       ├── layouts/        # Layout del dashboard
│       ├── pages/          # 11 páginas de la aplicación
│       ├── routes/         # Rutas protegidas por rol
│       └── services/       # Cliente API (axios)
└── README.md
```

## Producción

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
# Servir la carpeta frontend/dist con tu servidor web preferido
```

Configura `CORS_ORIGIN` y `VITE_API_URL` según el dominio de despliegue.

## Notas técnicas

- Persistencia: **better-sqlite3** con esquema en `backend/src/db/schema.sql`
- PDF: `pdfkit` · Excel: `exceljs` · Contraseñas: `bcryptjs`
- El frontend usa `HashRouter` para compatibilidad con GitHub Pages
- Reconocimiento facial: requiere cámara web y foto facial registrada en el empleado
