import bem from "src/utils/bem";
import "../styles/home-page.scss";
import Ticker from "./Ticker";
import InsightCarousel from "./Carousel";
import { Container } from "react-bootstrap";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import ProjectsTable from "./ProjectsTable";
import random from "../utils/random";
import { useUserData } from "../storages/userData";
import { AuthContext } from "./Auth";
import Crossfade from "./Crossfade";
import { useLotsData } from "../storages/lotsData";
import { useProjectsData } from "../storages/projectsData";
import Name from "./Name";
import DarkButton from "./DarkButton";
import { useAuctionsData } from "../storages/auctionsData";
import LotsTable from "./LotsTable";
import { BetPlacementContext } from "./BetPlacement";
import useWindowSize from "src/utils/useWindowSize";
import ROUTES from "src/utils/routes";
import { ImageModalContext } from "./ImageModal";

const cn = bem("home-page");

export default function Home() {
  const [lots] = useLotsData();
  const [projects] = useProjectsData();
  const [auctions] = useAuctionsData();
  const history = useHistory();
  const currentAuction = useMemo(
    () =>
      auctions?.find(({ finish_timestamp, start_timestamp }) => {
        const now = Date.now();
        return (
          now < new Date(finish_timestamp).valueOf() &&
          now > new Date(start_timestamp).valueOf()
        );
      }) || auctions?.length
        ? auctions[auctions.length - 1]
        : null,
    [auctions]
  );
  const currentLots = useMemo(
    () =>
      currentAuction
        ? lots?.filter(({ auction_id }) => auction_id === currentAuction.id) ||
          []
        : [],
    [lots, currentAuction]
  );
  const { isMobile } = useWindowSize();

  return (
    <div className={cn("")}>
      {!!currentAuction && (
        <img
          onClick={() => history.push(ROUTES.ROUTE_AUCTION)}
          className={cn("image", "main")}
          alt="Аукцион на подходе"
          src={currentAuction.image_link}
        />
      )}
      <Ticker
        text={"INSIGHT - концептуальный аукцион и серия pop-up проектов"}
        main
      />
      {!!currentLots?.length && (
        <Container className="mb-5">
          <InsightCarousel>
            {currentLots
              .reduce((curr, next, index) => {
                const i = Math.floor(index / (isMobile ? 2 : 3));
                if (!curr[i]) {
                  curr.push([next]);
                } else {
                  curr[i].push(next);
                }
                return curr;
              }, [])
              .map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "nowrap",
                    width: "100%",
                  }}
                >
                  <LotsTable data={d} />
                </div>
              ))}
          </InsightCarousel>
        </Container>
      )}
      {!!projects?.length && (
        <Ticker
          text={
            "Комфортная среда для погружения в искусство     Междисциплинарные выставочные проекты на независимых площадках"
          }
          main
        />
      )}
      {!!projects?.length && <ProjectsTable data={projects} />}
      {!!lots?.length && (
        <Ticker
          text={
            "Новое поколение художников     Узнаваемый стиль     Индивидуальная эстетика"
          }
          main
        />
      )}
      {!!lots?.length && (
        <div className={cn("lot-solo")}>
          <LotSolo lots={lots} />
        </div>
      )}
    </div>
  );
}

function LotSolo({ lots }) {
  const [currentLot, setCurrentLot] = useState(
    lots[random(0, lots.length - 1)]
  );
  const [auctions] = useAuctionsData();
  const [user] = useUserData();
  const { openAuth } = useContext(AuthContext);
  const { openBetModal } = useContext(BetPlacementContext);
  const timeoutRef = useRef<any>(null);
  const { openImageModal } = useContext(ImageModalContext);
  const auctionPassed = useMemo(() => {
    const parent = auctions.find(({ id }) => id === currentLot.auction_id);
    const now = Date.now();
    return !parent || now > new Date(parent.finish_timestamp).valueOf();
  }, [currentLot.auction_id, auctions]);
  const auctionComing = useMemo(() => {
    const parent = auctions.find(({ id }) => id === currentLot.auction_id);
    const now = Date.now();
    return !parent || now < new Date(parent.start_timestamp).valueOf();
  }, [currentLot.auction_id, auctions]);

  function handlePriceClick(data) {
    if (!data.is_sold) {
      if (user?.is_mail_verify && !user?.is_ban) {
        openBetModal(data.id);
      } else {
        openAuth();
      }
    }
  }

  useEffect(() => {
    function change() {
      setCurrentLot(lots[random(0, lots.length - 1)]);
      timeoutRef.current = setTimeout(change, 15e3);
    }
    timeoutRef.current = setTimeout(change, 15e3);

    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <Crossfade
      data={currentLot}
      render={(data) => (
        <div className={cn("lot")}>
          <img
            className={cn("lot-image")}
            onClick={() => openImageModal(data.image_link[0])}
            src={data.image_link[0]}
            alt="Картина"
          />
          <div className={cn("lot-data")}>
            <Name text={data.author} />
            <DarkButton
              disabled={data.is_sold || auctionPassed || auctionComing}
              onClick={() => handlePriceClick(data)}
            >
              {auctionPassed
                ? "ENDED"
                : data.is_sold
                ? "SOLD"
                : auctionComing
                ? "SOON"
                : `${data.price}р.`}
            </DarkButton>
          </div>
        </div>
      )}
    />
  );
}
