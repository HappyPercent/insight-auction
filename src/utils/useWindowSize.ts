import { useEffect, useState } from "react";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(() =>
    window
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth <= 768,
        }
      : {
          width: undefined,
          height: undefined,
          isMobile: undefined,
        }
  );

  useEffect(() => {
    function handleResize() {
      if (window) {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth <= 768,
        });
      }
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window?.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
