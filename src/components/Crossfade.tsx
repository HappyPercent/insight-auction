import React, { useEffect, useState } from "react";
import bem from "../utils/bem";
import "../styles/crossfade.scss";

const cn = bem("crossfade");

export default function Crossfade({ data, render }) {
  const [firstVisible, setFirstVisible] = useState(true);
  const [firstData, setFirstData] = useState(data);
  const [secondData, setSecondData] = useState(null);

  useEffect(() => {
    if (firstVisible) {
      setSecondData(data);
      setFirstVisible(false);
    } else {
      setFirstData(data);
      setFirstVisible(true);
    }
  }, [data]);

  return (
    <div className={cn()}>
      <div className={cn("static")}>
        {render(firstVisible ? firstData : secondData)}
      </div>
      <div
        className={cn("item")}
        style={{ opacity: firstVisible ? 1 : 0, zIndex: firstVisible ? 3 : 0 }}
      >
        {!!firstData && render(firstData)}
      </div>
      <div
        className={cn("item")}
        style={{ opacity: firstVisible ? 0 : 1, zIndex: firstVisible ? 0 : 3 }}
      >
        {!!secondData && render(secondData)}
      </div>
    </div>
  );
}
