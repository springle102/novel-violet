"use client";

import type { PaginationProps } from "@/app/types";

// ===========================
// SVG Icons
// ===========================

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronsRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  );
}

// ===========================
// Helper: generate visible page numbers
// ===========================

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  // Always show last page
  pages.push(total);

  return pages;
}

// ===========================
// Pagination Component
// ===========================

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const baseBtn =
    "flex h-9 min-w-[36px] items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200";

  const activeBtn =
    "border-primary bg-primary text-white shadow-sm";

  const inactiveBtn =
    "border-primary/30 bg-white text-primary hover:border-primary hover:bg-primary-surface";

  const disabledBtn =
    "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed";

  const navBtn =
    "border-primary/30 bg-white text-primary hover:border-primary hover:bg-primary-surface";

  return (
    <nav
      id="pagination"
      aria-label="Phân trang"
      className="flex items-center justify-center gap-1.5 py-8"
    >
      {/* ── Next Page ── */}
      <button
        id="page-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${baseBtn} px-2 ${currentPage >= totalPages ? disabledBtn : navBtn}`}
        aria-label="Trang sau"
      >
        <span className="mr-1 hidden sm:inline">Sau</span>
        <ChevronRightIcon />
      </button>

      {/* ── Page Numbers ── */}
      {visiblePages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 min-w-[36px] items-center justify-center text-sm text-text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            id={`page-${page}`}
            onClick={() => onPageChange(page)}
            className={`${baseBtn} ${page === currentPage ? activeBtn : inactiveBtn}`}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Trang ${page}`}
          >
            {page}
          </button>
        )
      )}

      {/* ── Last Page ── */}
      <button
        id="page-last"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        className={`${baseBtn} px-2 ${currentPage >= totalPages ? disabledBtn : navBtn}`}
        aria-label="Trang cuối"
      >
        <span className="mr-1 hidden sm:inline">Trang Cuối</span>
        <ChevronsRightIcon />
      </button>
    </nav>
  );
}
