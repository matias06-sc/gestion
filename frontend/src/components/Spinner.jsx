export default function Spinner({ label = "Cargando…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 border-r-accent-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-ink-muted dark:text-stone-400">{label}</p>
    </div>
  );
}
