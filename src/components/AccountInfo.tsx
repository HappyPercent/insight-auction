import React, { useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { useUserData } from "src/storages/userData";
import useWindowSize from "src/utils/useWindowSize";
import "../styles/account-info.scss";
import bem from "../utils/bem";
import { AuthContext } from "./Auth";

const cn = bem("account-info");

export default function AccountInfo() {
  const [user, userInterface] = useUserData();
  const { openAuth } = useContext(AuthContext);
  const { isMobile } = useWindowSize();

  function handleLogout() {
    userInterface.logout();
  }

  return (
    <div className={cn("")}>
      {user?.email && user?.is_mail_verify ? (
        <Dropdown align={"end"}>
          <Dropdown.Toggle as={CustomToggle} variant={"light"}>
            {isMobile ? (
              <i className="bi bi-person-circle" />
            ) : (
              <div className={cn("email")}>{user.email}</div>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout} className={cn("item")}>
              Log out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <div className={cn("email")} onClick={() => openAuth()}>
          Log In
        </div>
      )}
    </div>
  );
}

const CustomToggle = React.forwardRef<any, any>(
  ({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </div>
  )
);
