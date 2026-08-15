"use client";
import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";

export function MathSlide({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    renderMathInElement(ref.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
      strict: false,
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className="slide-content"
      style={{ marginTop: 8, padding: 16, background: "var(--surface2)", borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
