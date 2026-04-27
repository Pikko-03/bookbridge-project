export default function BookCover({ book, style = {} }) {
  const coverId = book?.cover_i || book?.covers?.[0];
  const src = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;

  return (
    <div className="book-cover" style={style}>
      {src ? (
        <img src={src} alt={book?.title} loading="lazy" />
      ) : (
        <div className="book-cover-placeholder">📚</div>
      )}
    </div>
  );
}
