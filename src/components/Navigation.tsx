import { Nav } from "react-bootstrap";
import bem from "../utils/bem";
import { useHistory, Link } from "react-router-dom";
import "../styles/navigation.scss";
import React, { useEffect, useState } from "react";
import { useUserData } from "../storages/userData";
import ROUTES from "../utils/routes";
import { useProjectsData } from "src/storages/projectsData";
import { useAuctionsData } from "src/storages/auctionsData";

const cn = bem("navigation");

export default function Navigation() {
  const history = useHistory();
  const [, rerender] = useState({});
  const [user] = useUserData();
  const [projects] = useProjectsData();
  const [auctions] = useAuctionsData();

  useEffect(() => history.listen(() => rerender({})), [history]);

  return (
    <Nav className={cn()}>
      <Link
        className={cn("link", { active: history.location.pathname === "/" })}
        to={"/"}
      >
        Home
      </Link>
      {!!auctions?.length && (
        <Link
          className={cn("link", {
            active: history.location.pathname.includes(ROUTES.ROUTE_AUCTION),
          })}
          to={ROUTES.ROUTE_AUCTION}
        >
          Auction
        </Link>
      )}
      {!!projects?.length && (
        <Link
          className={cn("link", {
            active: history.location.pathname.includes(ROUTES.ROUTE_PROJECT),
          })}
          to={ROUTES.ROUTE_PROJECT}
        >
          Projects
        </Link>
      )}
      {user?.is_admin && (
        <Link
          className={cn("link", {
            active: history.location.pathname.includes(ROUTES.ROUTE_ADMIN),
          })}
          to={ROUTES.ROUTE_ADMIN}
        >
          Админка
        </Link>
      )}
    </Nav>
  );
}
