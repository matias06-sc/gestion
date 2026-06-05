export default function PaginationBar({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-ink-muted dark:text-stone-400">
        Página <span className="font-semibold text-teal-600 dark:text-teal-400">{meta.page}</span> de{" "}
        {meta.totalPages} · {meta.total} registros
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
          className="btn-secondary !py-1.5 !px-4 text-xs disabled:opacity-40"
        >
          ← Anterior
        </button>
        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
          className="btn-primary !py-1.5 !px-4 text-xs disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
