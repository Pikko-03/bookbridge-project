export default function StarRating({ value = 0, onChange, readOnly = false }) {
  return (
    <div className="stars stars-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? "filled" : ""}`}
          onClick={() => {
            if (!readOnly && onChange) onChange(star);
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}