import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLotsData } from "../storages/lotsData";
import { Modal } from "react-bootstrap";
import DarkButton from "./DarkButton";
import { useAuctionsData } from "../storages/auctionsData";
import { useUserData } from "../storages/userData";
import bem from "../utils/bem";
import "../styles/bet-placement.scss";
import InsightCarousel from "./Carousel";
import Name from "./Name";
import { ImageModalContext } from "./ImageModal";
import { authFetch } from "src/utils/authFetch";
import { betHistory as betHistoryUrl } from "src/utils/api";

const cn = bem("bet-placement");

export const BetPlacementContext = React.createContext<any>(null);

export default function BetPlacementProvider({ children }) {
  const [lots, lotsInterface] = useLotsData();
  const [selected, setSelected] = useState<any>(null);
  const [betHistory, setBetHistory] = useState<any>(null);

  useEffect(() => {
    refreshBetHitstory();
  }, []);

  async function refreshBetHitstory() {
    const res: any = await authFetch({ url: betHistoryUrl, method: "GET" });
    setBetHistory(res);
  }

  function openBetModal(id: number) {
    const lot = lots.find((l) => l.id === id);
    setSelected(lot);
  }

  useEffect(() => {
    if (selected) {
      const lot = lots.find((l) => l.id === selected.id);
      setSelected(lot);
    }
  }, [lots]);

  return (
    <BetPlacementContext.Provider value={{ openBetModal }}>
      <BetPlacementModal
        lotsInterface={lotsInterface}
        show={!!selected}
        onClose={() => setSelected(null)}
        lot={selected}
        betHistory={betHistory}
        refreshBetHitstory={refreshBetHitstory}
      />
      {children}
    </BetPlacementContext.Provider>
  );
}

function BetPlacementModal({
  show,
  onClose,
  lot,
  lotsInterface,
  betHistory,
  refreshBetHitstory,
}) {
  const [auctions] = useAuctionsData();
  const [user] = useUserData();

  const currentUserBet = useMemo(() => {
    return (
      !!lot &&
      betHistory?.find(
        (bet) => bet.lot_id === lot.id && bet.money === lot.price
      )?.user_id === user.id
    );
  }, [betHistory, user.id, lot]);

  const priceSteps = useMemo(
    () =>
      !!lot &&
      JSON.parse(auctions.find((a) => a.id === lot.auction_id).price_steps),
    [lot, auctions]
  );
  const currentStep = lot?.step ?? 0;
  const nextPrice = useMemo(
    () =>
      (!!lot &&
        +lot.price +
          (priceSteps[currentStep] || priceSteps[currentStep] === 0
            ? +priceSteps[currentStep]
            : +priceSteps[Object.values(priceSteps).length - 1])) ||
      0,
    [lot, priceSteps, currentStep]
  );
  const [info, setInfo] = useState("");
  const { openImageModal } = useContext(ImageModalContext);

  useEffect(() => {
    lotsInterface.fetch();
    refreshBetHitstory();
  }, []);

  async function handleBuy() {
    try {
      await lotsInterface.buy({
        user_id: user.id,
        lot_id: lot.id,
        money: nextPrice * 2,
      });
      await refreshBetHitstory();
      setInfo("Ваша заявка на выкуп принята!");
    } catch (e) {
      setInfo("Что-то пошло не так.");
      throw e;
    }
  }

  async function handleBet() {
    try {
      await lotsInterface.bet({
        user_id: user.id,
        lot_id: lot.id,
        money: nextPrice,
      });
      await refreshBetHitstory();
      setInfo("Ваша ставка принята!");
    } catch (e) {
      setInfo("Что-то пошло не так.");
      throw e;
    }
  }

  useEffect(() => {
    if (!show) {
      setInfo("");
    }
  }, [show]);

  return (
    <Modal centered={true} show={show} onHide={onClose}>
      {!!lot && (
        <Modal.Body className={cn()}>
          <InsightCarousel modal={true}>
            {lot.image_link.map((i) => (
              <img
                onClick={() => openImageModal(i)}
                className={cn("image")}
                src={i}
                alt={lot.name}
              />
            ))}
          </InsightCarousel>
          {!lot.is_sold && (
            <div className="d-flex justify-content-between ps-4 pe-4">
              <div className="d-flex flex-column">
                <Name
                  size={28}
                  margin={4}
                  text={"Текущая цена"}
                  align={"left"}
                />
                <span className={cn("price")}>{lot.price} р.</span>
              </div>
              <div className="d-flex flex-column me-2">
                <Name
                  size={28}
                  margin={4}
                  text={"Сделать ставку"}
                  align={"left"}
                />
                <DarkButton disabled={currentUserBet} onClick={handleBet}>
                  {currentUserBet ? "YOUR BID" : `${nextPrice}р.`}
                </DarkButton>
                <Name size={28} margin={4} text={"Выкупить"} align={"left"} />
                <DarkButton className={"mb-3"} onClick={handleBuy}>
                  {nextPrice * 2} р.
                </DarkButton>
              </div>
            </div>
          )}
          <div className={cn("lot-author")}>{lot.author}</div>
          <div className={cn("lot-info")}>
            {lot.name}, {lot.year}
          </div>
          <div className={cn("lot-info")}>{lot.size}</div>
          <div className={cn("lot-info")}>{lot.type}</div>
          {!!info && <div className={cn("info")}>{info}</div>}
        </Modal.Body>
      )}
    </Modal>
  );
}
