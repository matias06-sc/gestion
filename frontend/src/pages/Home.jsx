import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiFileText,
  FiLock,
  FiUsers,
  FiZap,
} from "react-icons/fi";

function Feature({ icon: Icon, title, desc, accent }) {
  const accents = {
    teal: "from-teal-500/10 to-teal-600/5 text-teal-600 border-teal-200 dark:border-teal-800",
    rose: "from-accent-500/10 to-accent-600/5 text-accent-600 border-accent-200 dark:border-accent-800",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200 dark:border-amber-800",
  };
  return (
    <div className={`card p-6 border-t-4 ${accent === "rose" ? "border-t-accent-500" : accent === "amber" ? "border-t-amber-500" : "border-t-teal-500"} hover:shadow-glow transition-shadow`}>
      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${accents[accent] || accents.teal} flex items-center justify-center border`}>
        <Icon className="text-xl" />
      </div>
      <h3 className="mt-4 font-display font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted dark:text-stone-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full mesh-bg">
      <header className="sticky top-0 z-10 border-b border-ink/5 bg-surface-card/70 backdrop-blur-xl dark:border-stone-800 dark:bg-surface-card-dark/70">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-accent-500 flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-xl">M</span>
            </div>
            <div>
              <p className="font-display font-semibold text-lg">Meridian</p>
              <p className="text-[10px] uppercase tracking-widest text-ink-faint">Gestión de personal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register" className="btn-secondary hidden sm:inline-flex !py-2 !px-4 text-sm">
              Registrarse
            </Link>
            <Link to="/login" className="btn-primary !py-2 !px-4 text-sm">
              Iniciar sesión <FiArrowRight />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="stat-badge">
                <FiZap /> Plataforma empresarial
              </span>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-[1.1] tracking-tight">
                Tu equipo,{" "}
                <span className="bg-gradient-to-r from-teal-600 to-accent-600 bg-clip-text text-transparent">
                  bajo control
                </span>
              </h1>
              <p className="mt-6 text-lg text-ink-muted dark:text-stone-400 leading-relaxed max-w-lg">
                Asistencia con reconocimiento facial, planillas automatizadas y reportes
                exportables. Todo en una interfaz elegante y moderna.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/login" className="btn-primary !py-3 !px-6">
                  Comenzar ahora
                </Link>
                <Link to="/register" className="btn-secondary !py-3 !px-6">
                  Crear cuenta Admin/RRHH
                </Link>
              </div>
              <p className="mt-6 text-xs text-ink-faint max-w-md">
                Los usuarios de planilla se crean desde el módulo de Secretaría con usuario y fecha de vencimiento.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 to-accent-500/20 rounded-2xl blur-2xl" />
              <div className="relative card p-8">
                <div className="grid grid-cols-2 gap-4">
                  <MiniStat label="Empleados activos" value="—" color="teal" />
                  <MiniStat label="Asistencia hoy" value="—" color="rose" />
                  <MiniStat label="Planillas" value="—" color="amber" />
                  <MiniStat label="Alertas" value="—" color="teal" />
                </div>
                <div className="mt-6 rounded-xl bg-gradient-to-br from-teal-600 via-teal-700 to-accent-600 p-6 text-white">
                  <p className="font-display font-semibold text-lg">Panel ejecutivo</p>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed">
                    KPIs en tiempo real, gráficos interactivos y gestión completa de recursos humanos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-card/50 dark:bg-surface-card-dark/30 border-y border-ink/5 dark:border-stone-800 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-semibold">Módulos integrados</h2>
              <p className="mt-3 text-ink-muted dark:text-stone-400">
                Herramientas profesionales para la gestión completa de tu organización.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Feature icon={FiUsers} title="Gestión de empleados" desc="CRUD completo, foto de perfil, reconocimiento facial, filtros por área y paginación." accent="teal" />
              <Feature icon={FiCalendar} title="Control de asistencia" desc="Entrada/salida con cámara, tardanzas automáticas, ausencias e historial detallado." accent="rose" />
              <Feature icon={FiFileText} title="Planillas y boletas" desc="Cálculo de neto, horas extra, AFP, impuestos y boleta PDF descargable." accent="amber" />
              <Feature icon={FiBarChart2} title="Dashboard analítico" desc="KPIs y gráficos de asistencia y masa salarial por área con Recharts." accent="teal" />
              <Feature icon={FiLock} title="Seguridad por roles" desc="JWT, rutas protegidas y control granular: Admin, RRHH, Empleado y Secretaría." accent="rose" />
              <Feature icon={FiFileText} title="Reportes exportables" desc="Excel y PDF para auditoría: empleados, asistencia, planillas y salarios." accent="amber" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/5 dark:border-stone-800 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-faint">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-teal-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">M</span>
            </div>
            <span>Meridian — Gestión de Personal</span>
          </div>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  const colors = {
    teal: "text-teal-600 dark:text-teal-400",
    rose: "text-accent-600 dark:text-accent-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-lg border-2 border-ink/5 bg-surface-light p-4 dark:border-stone-800 dark:bg-surface-dark">
      <p className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">{label}</p>
      <p className={`mt-2 text-3xl font-display font-bold tabular-nums ${colors[color]}`}>{value}</p>
    </div>
  );
}
