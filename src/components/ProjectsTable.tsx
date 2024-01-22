import React, { useEffect, useRef, useState } from "react";
import "../styles/projects-table.scss";
import bem from "../utils/bem";
import random from "../utils/random";
import Crossfade from "./Crossfade";
import Table from "./Table";
import useWindowSize from "../utils/useWindowSize";

const cn = bem("projects-table");

export default function ProjectsTable({
  data,
  crossfade = true,
  onNavigate = (id) => {},
}) {
  const { isMobile } = useWindowSize();
  const [visible, setVisible] = useState(
    crossfade ? data.slice(0, isMobile ? 2 : 3).filter((v) => !!v) : data
  );
  const currentChanging = useRef(0);
  const timeout = useRef<any>(null);

  useEffect(() => {
    setVisible(
      crossfade ? data.slice(0, isMobile ? 2 : 3).filter((v) => !!v) : data
    );
  }, [data, crossfade, isMobile]);

  useEffect(() => {
    function change() {
      setVisible((state) => {
        const hidden = data.filter(({ id }) => !state.find((v) => v.id === id));
        if (hidden.length) {
          const visibleObject = state.reduce((curr, next, i) => {
            curr[i] = next;
            return curr;
          }, {});

          visibleObject[currentChanging.current] =
            hidden[random(0, hidden.length - 1)];
          currentChanging.current =
            currentChanging.current === (isMobile ? 1 : 2)
              ? 0
              : currentChanging.current + 1;
          return Object.values(visibleObject);
        } else {
          return state;
        }
      });
      timeout.current = setTimeout(change, random(5, 10) * 1000);
    }
    crossfade && change();

    return () => clearTimeout(timeout.current);
  }, []);

  return (
    <Table project small>
      {visible.map((v, i) => (
        <div className={cn("card")}>
          <Crossfade
            key={i}
            data={v}
            render={(data) => (
              <img
                className={cn("image")}
                onClick={() => onNavigate(data.id)}
                src={data.main_picture}
              />
            )}
          />
        </div>
      ))}
    </Table>
  );
}
