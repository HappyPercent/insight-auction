import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "../styles/image-modal.scss";

export const ImageModalContext = React.createContext<any>(null);

export default function ImageModalProvider({ children }) {
  const [show, setShow] = useState(false);
  const [src, setSrc] = useState();

  function openImageModal(src) {
    setSrc(src);
    setShow(true);
  }

  return (
    <ImageModalContext.Provider value={{ openImageModal }}>
      <Modal
        dialogClassName={"image-modal"}
        centered={true}
        show={show}
        onHide={() => setShow(false)}
      >
        <img style={{ maxWidth: "100%" }} src={src} alt="Картинка" />
      </Modal>
      {children}
    </ImageModalContext.Provider>
  );
}
