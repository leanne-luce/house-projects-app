import React from "react";
import { Eyebrow } from "./Eyebrow.jsx";
import { TextLink } from "./TextLink.jsx";

export function PlanCard({ tag, title, description, image, href = "#", style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ textDecoration: "none", color: "inherit", display: "block", ...style }}>
      <div style={{ overflow: "hidden", marginBottom: "1.375rem" }}>
        <div style={{ width: "100%", aspectRatio: "4/3", background: image ? `url(${image}) center/cover` : "linear-gradient(145deg,#CDA87E 0%,#B8956A 60%,#A68055 100%)", transform: hover ? "scale(1.04)" : "none", transition: "transform 0.55s ease" }} />
      </div>
      {tag ? <Eyebrow style={{ marginBottom: "0.5rem", letterSpacing: "0.1em" }}>{tag}</Eyebrow> : null}
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.01em", color: hover ? "var(--terracotta)" : "var(--brown)", marginBottom: "0.625rem", transition: "color 0.2s ease" }}>{title}</h3>
      <p style={{ fontSize: "0.9375rem", color: "var(--brown-mid)", lineHeight: 1.7, marginBottom: "1.125rem" }}>{description}</p>
      <TextLink>View plan &rarr;</TextLink>
    </a>
  );
}
