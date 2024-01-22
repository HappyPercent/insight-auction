import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/logo.scss";

export default function Logo() {
  return (
    <div className="d-flex justify-content-center pt-5 pb-5">
      <Link to={"/"} className="logo">
        <img alt="Insight" src={logo} />
      </Link>
    </div>
  );
}
