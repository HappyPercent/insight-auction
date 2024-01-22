import React, { useMemo, useState } from "react";
import { Carousel, Container } from "react-bootstrap";
import { useAuctionsData } from "../storages/auctionsData";
import { useLotsData } from "../storages/lotsData";
import "../styles/auction-page.scss";
import bem from "../utils/bem";
import DarkButton from "./DarkButton";
import LotsTable from "./LotsTable";
import Name from "./Name";
import Ticker from "./Ticker";
import Countdown from "react-countdown";

const cn = bem("auction-page");

export default function Auction() {
  const [currentId, setCurrentId] = useState<null | number>(null);
  const [auctions] = useAuctionsData();
  const [lots] = useLotsData();
  const current = useMemo(() => {
    const current = currentId
      ? auctions?.find((a) => +a.id === +currentId) || null
      : null;
    return current
      ? current
      : auctions?.find(({ finish_timestamp, start_timestamp }) => {
          const now = Date.now();
          return (
            now < new Date(finish_timestamp).valueOf() &&
            now > new Date(start_timestamp).valueOf()
          );
        }) || auctions?.length
      ? auctions[auctions.length - 1]
      : null;
  }, [currentId, auctions]);
  const pastAuctions = useMemo(
    () => auctions?.filter((a) => a.id !== current.id),
    [current, auctions]
  );
  const currentLots = useMemo(
    () => lots?.filter(({ auction_id }) => auction_id === current.id),
    [current.id, lots]
  );

  return (
    <div className={cn()}>
      {!!current && <Ticker text={current.text_line_running} main />}
      {!!current && <SoloAuction reverse auction={current} />}
      {!!currentLots && (
        <Container className="mt-5">
          <LotsTable data={currentLots} />
        </Container>
      )}
      {!!pastAuctions?.length && (
        <>
          <Ticker text={"PAST AUCTIONS"} main />
          <PastAuctions data={pastAuctions} onChangeAuction={setCurrentId} />
        </>
      )}
    </div>
  );
}

function SoloAuction({ auction, reverse = false }) {
  const auctionComing = useMemo(() => {
    const now = Date.now();
    return now < new Date(auction.start_timestamp).valueOf();
  }, [auction.start_timestamp]);
  return (
    <div className={cn("solo-auction", { reverse })}>
      <div className={cn("solo-auction-info")}>
        <Name text={auction.name} />
        <div className={cn("solo-auction-descr")}>
          {auction.description}
          {!auctionComing && (
            <Countdown
              date={auction.finish_timestamp}
              renderer={(props) => {
                return props.total ? (
                  <div className={cn("countdown")}>
                    <span className={cn("countdown-timed")}>
                      <i className="bi bi-clock-fill me-2" />
                      Timed auction
                    </span>
                    <span className={cn("countdown-ends")}>
                      Ends in{" "}
                      <span className={cn("countdown-time")}>
                        {props.days}days {props.hours}hours {props.minutes}mins{" "}
                        {props.seconds}secs
                      </span>
                    </span>
                  </div>
                ) : null;
              }}
            />
          )}
        </div>
      </div>
      <img className={cn("solo-auction-image")} src={auction.image_link} />
    </div>
  );
}

function PastAuctions({ data, onChangeAuction }) {
  return (
    <Container style={{ marginTop: "16px" }}>
      <Carousel variant={"dark"} indicators={false}>
        {data.map((d) => (
          <Carousel.Item>
            <div className={cn("solo-auction", "carousel")}>
              <img className={cn("solo-auction-image")} src={d.image_link} />
              <div className={cn("solo-auction-info")}>
                <Name text={d.name} />
                <div className={cn("solo-auction-descr")}>{d.description}</div>
                <DarkButton
                  onClick={() => {
                    onChangeAuction(d.id);
                    window.scrollTo(0, 0);
                  }}
                >
                  LOTS
                </DarkButton>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
}
