// src/components/Pagination.jsx
import "./Pagination.css";

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const createPages = () => {
    const pages = [];

    const addPage = (p) => {
      pages.push({
        type: "page",
        number: p,
        isCurrent: p === page,
      });
    };

    const addDots = (key) => {
      pages.push({ type: "dots", key });
    };

    const delta = 1; // сколько страниц слева/справа от текущей

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    addPage(1);

    if (left > 2) {
      addDots("left");
    }

    for (let p = left; p <= right; p += 1) {
      addPage(p);
    }

    if (right < totalPages - 1) {
      addDots("right");
    }

    if (totalPages > 1) {
      addPage(totalPages);
    }

    return pages;
  };

  const pages = createPages();

  const handlePrev = () => {
    if (page > 1) onChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onChange(page + 1);
  };

  return (
    <div className="Pagination">
      <button
        type="button"
        onClick={handlePrev}
        disabled={page === 1}
        className="Pagination__arrow"
      >
        ‹
      </button>

      {pages.map((item) =>
        item.type === "dots" ? (
          <span key={item.key} className="Pagination__dots">
            …
          </span>
        ) : (
          <button
            key={item.number}
            type="button"
            className={
              "Pagination__page" +
              (item.isCurrent ? " Pagination__page--current" : "")
            }
            onClick={() => onChange(item.number)}
            disabled={item.isCurrent}
          >
            {item.number}
          </button>
        )
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={page === totalPages}
        className="Pagination__arrow"
      >
        ›
      </button>
    </div>
  );
}

export default Pagination;
