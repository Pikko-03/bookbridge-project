import { useState } from "react";

const SHELVES = {
  want: "Want to Read",
  reading: "Currently Reading",
  read: "Read",
};

export default function ShelfSelector({
  book,
  getShelf,
  addToShelf,
  removeFromShelf,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const currentShelf = getShelf(book);

  const handleSelect = (shelf) => {
    addToShelf(shelf, book);
    setOpen(false);
  };

  const handleRemove = () => {
    removeFromShelf(book);
    setOpen(false);
  };

  return (
    <div className={`shelf-select ${compact ? "compact" : ""}`} onClick={(e) => e.stopPropagation()}>
      <button className="shelf-select-btn" onClick={() => setOpen((prev) => !prev)}>
        {currentShelf ? SHELVES[currentShelf] : "Want to Read"}
        <span>▾</span>
      </button>

      {open && (
        <div className="shelf-select-menu">
          {Object.entries(SHELVES).map(([key, label]) => (
            <button
              key={key}
              className={`shelf-select-item ${currentShelf === key ? "active" : ""}`}
              onClick={() => handleSelect(key)}
            >
              {currentShelf === key ? "✓ " : ""}
              {label}
            </button>
          ))}

          {currentShelf && (
            <>
              <div className="shelf-select-divider" />
              <button className="shelf-select-item danger" onClick={handleRemove}>
                Remove from shelf
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}