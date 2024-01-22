import React from "react";
import bem from "../utils/bem";
import "../styles/table.scss";

const cn = bem("table");

export default function Table({ children, small = false, project = false }) {
  return <div className={cn(null, { small, project })}>{children}</div>;
}
