export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-ink/10 bg-surface-card shadow-2xl dark:border-stone-700 dark:bg-surface-card-dark animate-in">
        <div className="flex items-center justify-between border-b-2 border-teal-500/20 bg-gradient-to-r from-teal-50 to-accent-50 px-6 py-4 dark:from-teal-900/20 dark:to-accent-900/10">
          <h2 className="text-lg font-display font-semibold text-ink dark:text-stone-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-white/80 hover:text-rose-600 transition-colors dark:hover:bg-stone-800"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-ink/5 bg-surface-light px-6 py-4 dark:border-stone-800 dark:bg-surface-dark">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
