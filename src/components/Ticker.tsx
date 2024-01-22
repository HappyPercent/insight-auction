import { useMemo, useRef } from "react";
import bem from "src/utils/bem";
import "../styles/ticker.scss";

const cn = bem("ticker");

export default function Ticker({ text, main }) {
  const tickerText = useMemo(() => (text + " ").repeat(50), [text]);
  const ref = useRef(null);

  return (
    <div className={cn(null, { main })}>
      <div ref={ref} className={cn("text")}>
        {tickerText}
      </div>
    </div>
  );
}
