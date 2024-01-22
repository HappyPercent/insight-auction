import React from "react";
import bem from "../utils/bem";
import "../styles/footer.scss";
import useWindowSize from "src/utils/useWindowSize";

const cn = bem("footer");

export default function Footer() {
  const { isMobile } = useWindowSize();
  return (
    <footer className={cn()}>
      <div className={cn("contacts", { mobile: isMobile })}>
        <div>
          <i className="bi bi-instagram" />
          <a
            href={"https://www.instagram.com/insight.auction"}
            className={cn("contact")}
          >
            Instagram
          </a>
        </div>
        <div>
          <i className="bi bi-envelope-fill" />
          <a href={"mailto:info@insightauction.ru"} className={cn("contact")}>
            info@insightauction.ru
          </a>
        </div>
        <div>
          <i className="bi bi-telephone-fill" />
          <a href={"tel:+79629154800"} className={cn("contact")}>
            +79629154800
          </a>
        </div>
      </div>
    </footer>
  );
}
