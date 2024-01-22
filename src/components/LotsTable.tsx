import React, { useContext, useMemo } from "react";
import { useUserData } from "src/storages/userData";
import bem from "src/utils/bem";
import "../styles/lots-table.scss";
import { AuthContext } from "./Auth";
import DarkButton from "./DarkButton";
import Table from "./Table";
import { BetPlacementContext } from "./BetPlacement";
import { ImageModalContext } from "./ImageModal";
import { useAuctionsData } from "src/storages/auctionsData";

const cn = bem("lots-table");

type LotType = {
  auction_id: number;
  image_link: string[];
  name: string;
  year: number;
  author: string;
  type: string;
  size: string;
  fiction_start_price: number;
  fiction_end_price: number;
  price: number;
  id: number;
  is_sold: boolean;
};

type Props = {
  data: LotType[];
};

export default function LotsTable({ data }: Props) {
  return (
    <Table>
      {data.map((d) => (
        <Lot data={d} modal={false} />
      ))}
    </Table>
  );
}

export function Lot({ data }: { data: LotType; modal: boolean }) {
  const [user] = useUserData();
  const [auctions] = useAuctionsData();
  const { openAuth } = useContext(AuthContext);
  const { openBetModal } = useContext(BetPlacementContext);
  const { openImageModal } = useContext(ImageModalContext);
  const auctionPassed = useMemo(() => {
    const parent = auctions.find(({ id }) => id === data.auction_id);
    const now = Date.now();
    return !parent || now > new Date(parent.finish_timestamp).valueOf();
  }, [data.auction_id, auctions]);
  const auctionComing = useMemo(() => {
    const parent = auctions.find(({ id }) => id === data.auction_id);
    const now = Date.now();
    return !parent || now < new Date(parent.start_timestamp).valueOf();
  }, [data.auction_id, auctions]);
  function handlePriceClick() {
    if (!data.is_sold) {
      if (user?.is_mail_verify && !user?.is_ban) {
        openBetModal(data.id);
      } else {
        openAuth();
      }
    }
  }

  return (
    <div className={cn("item")}>
      <img
        onClick={() => openImageModal(data.image_link[0])}
        className={cn("image")}
        src={data.image_link[0]}
        alt={data.name}
      />
      <div className={cn("author")}>{data.author}</div>
      <div className={cn("info")}>
        {data.name} {data.year}
      </div>
      <div className={cn("info")}>{data.type}</div>
      <div className={cn("info")}>{data.size}</div>
      <div className={cn("info", "price")}>
        {data.fiction_start_price}-{data.fiction_end_price}р.
      </div>
      <DarkButton
        disabled={data.is_sold || auctionPassed || auctionComing}
        onClick={handlePriceClick}
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
  );
}
