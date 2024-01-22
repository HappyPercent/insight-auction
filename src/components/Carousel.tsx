import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import React from "react";
import useWindowSize from "src/utils/useWindowSize";
import arrow from "../assets/images/arrow.png";

export default function InsightCarousel({ children, modal = false }) {
  const { isMobile } = useWindowSize();
  return (
    <div>
      <Carousel
        showIndicators={false}
        showStatus={false}
        showThumbs={false}
        renderArrowPrev={(clickHandler, hasPrev) =>
          hasPrev && (
            <div
              onClick={clickHandler}
              style={{
                fontSize: "48px",
                position: "absolute",
                height: "26px",
                width: "26px",
                display: "flex",
                top: "50%",
                right: modal || isMobile ? "initial" : "100%",
                left: modal || isMobile ? "0" : "initial",
                cursor: "pointer",
                transform: "rotate(180deg)",
                zIndex: 10,
              }}
            >
              <img src={arrow} />
            </div>
          )
        }
        renderArrowNext={(clickHandler, hasNext) =>
          hasNext && (
            <div
              onClick={clickHandler}
              style={{
                fontSize: "48px",
                position: "absolute",
                top: "50%",
                height: "26px",
                display: "flex",
                width: "26px",
                right: modal || isMobile ? "0" : "initial",
                left: modal || isMobile ? "initial" : "100%",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <img src={arrow} />
            </div>
          )
        }
      >
        {children}
      </Carousel>
    </div>
  );
}
