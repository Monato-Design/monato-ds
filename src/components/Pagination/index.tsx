export interface PaginationProps {
  /** Página actual, 0-indexed (misma convención que el prototipo de origen). */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Paginación numerada centrada, extraída tal cual del patrón probado
 * en CrossBorder/Accounts (lista de cuentas registradas).
 *
 * Nota: los colores de borde/texto (#f0f4f8, #334e68, #f8fafc) son parte
 * del mismatch conocido entre valores de Figma y tokens.css (ver
 * tokens.css header). Se dejan como venían para no introducir un cambio
 * visual fuera del alcance de esta extracción. Los dos casos con match
 * exacto (gray-100, gray-700) sí quedan mapeados a token.
 */
export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`ds-pagination flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label="Página anterior"
        className="size-10 flex items-center justify-center rounded-lg border border-[#f0f4f8] bg-white disabled:opacity-40 hover:bg-[#f8fafc] transition"
      >
        <span className="text-[#334e68] text-lg leading-none">←</span>
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          type="button"
          key={i}
          onClick={() => onPageChange(i)}
          aria-current={i === page ? 'page' : undefined}
          className={`size-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
            i === page
              ? 'bg-[var(--primitive-gray-100)] text-[var(--primitive-gray-700)]'
              : 'bg-white text-[#334e68] hover:bg-[#f8fafc]'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        aria-label="Página siguiente"
        className="size-10 flex items-center justify-center rounded-lg border border-[#f0f4f8] bg-white disabled:opacity-40 hover:bg-[#f8fafc] transition"
      >
        <span className="text-[#334e68] text-lg leading-none">→</span>
      </button>
    </div>
  );
}

export default Pagination;
