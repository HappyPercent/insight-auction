import "./App.scss";
import Navigation from "./components/Navigation";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import ROUTES from "./utils/routes";
import Home from "./components/Home";
import Auction from "./components/Auction";
import Project from "./components/Project";
import Logo from "./components/Logo";
import { Container } from "react-bootstrap";
import AccountInfo from "./components/AccountInfo";
import AuthProvider from "./components/Auth";
import React from "react";
import Footer from "./components/Footer";
import BetPlacementProvider from "./components/BetPlacement";
import Admin from "./components/admin/Admin";
import ImageModalProvider from "./components/ImageModal";

function App() {
  return (
    <React.Suspense fallback={null}>
      <ImageModalProvider>
        <AuthProvider>
          <BetPlacementProvider>
            <BrowserRouter>
              <div>
                <header>
                  <Container
                    fluid
                    className="d-flex justify-content-between pt-3 pb-3 ps-4 pe-4"
                  >
                    <Navigation />
                    <AccountInfo />
                  </Container>
                </header>
                <Logo />
              </div>
              <Switch>
                <Route path={ROUTES.ROUTE_AUCTION + "/:id?"}>
                  <Auction />
                </Route>
                <Route path={ROUTES.ROUTE_PROJECT + "/:id?"}>
                  <Project />
                </Route>
                <Route path={ROUTES.ROUTE_ADMIN}>
                  <Admin />
                </Route>
                <Route path={ROUTES.ROUTE_HOME}>
                  <Home />
                </Route>
              </Switch>
              <Footer />
            </BrowserRouter>
          </BetPlacementProvider>
        </AuthProvider>
      </ImageModalProvider>
    </React.Suspense>
  );
}

export default App;
