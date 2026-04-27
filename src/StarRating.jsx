import { useState } from "react";

export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={`stars ${readOnly ? "stars-display" : ""}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${s <= (hover || value) ? "filled" : ""} ${s <= hover ? "hover" : ""}`}
          onClick={() => !readOnly && onChange && onChange(s)}
          onMouseEnter={() => !readOnly && setHover(s)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
