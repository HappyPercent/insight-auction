import { Button } from "react-bootstrap";
import React from "react";

export default function ({ children, ...pass }) {
  return (
    <Button
      style={{
        borderRadius: 0,
        padding: "0 4px",
        whiteSpace: "nowrap",
        fontSize: "30px",
        lineHeight: "1.4em",
        fontWeight: 700,
        background: "#000",
      }}
      variant="dark"
      {...pass}
    >
      {children}
    </Button>
  );
}
