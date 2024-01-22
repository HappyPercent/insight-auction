import React from "react";
import useWindowSize from "src/utils/useWindowSize";

export default function Name({
  text,
  size,
  margin = 32,
  align = "center",
}: any) {
  const { isMobile } = useWindowSize();
  return (
    <div
      style={{
        fontFamily: "pacifica-w00-condensed, fantasy",
        margin: `${margin}px 0`,
        fontSize: `${size || isMobile ? "30" : "55"}px`,
        lineHeight: "normal",
        letterSpacing: "normal",
        textShadow: "#ffffff 3px 3px 0px, rgba(0, 0, 0, 0.2) 6px 6px 0px",
        textAlign: align,
      }}
    >
      {text}
    </div>
  );
}
