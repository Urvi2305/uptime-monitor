function Pagination({ page, totalPages, onPageChange, isLoading }) {
  return (
    <div className="pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
      >
        ← Previous
      </button>
      <span className="pagination-status">
        Page {page} of {totalPages}
        {isLoading && <span className="pagination-spinner" aria-hidden="true" />}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isLoading}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
