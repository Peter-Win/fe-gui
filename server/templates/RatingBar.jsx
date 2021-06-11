import * as React from "react";
import "./RatingBar.css";

export const RatingBar = ({value, setValue}) => <div className="rating-bar">
    {[1, 2, 3, 4, 5].map(i =>
        <span
            key={i}
            className={`rating-star${i <= value ? ' active' : ''}`}
            onClick={() => setValue(i)}
        >
        <svg width="100%" height="100%" viewBox="0 0 20 20">
            <path d="M10 1 L12.4 6.8 L18.6 7.2 L13.8 11.2 L15.3 17.3 L10 14 L4.7 17.3 L6.2 11.2 L1.4 7.2 L7.6 6.8 z"/>
        </svg>
    </span>)}
</div>;