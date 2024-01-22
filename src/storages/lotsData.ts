import { createStoreon } from "storeon";
import { createLot, deleteLot, getLots, placeBet } from "../utils/api";
import { authFetch, plainFetch } from "../utils/authFetch";
import createStoreHook from "../utils/createStoreHook";

const lotsStore = createStoreon<any, any>([
  (store) => {
    store.on("@init", () => ({ lots: null, token: null, ready: false }));
    store.on("lots/set", (state, lots) => ({ ...state, lots, ready: true }));
  },
]);

export const lotsStoreInterface = {
  get() {
    return lotsStore.get().lots;
  },
  subscribe(callback: any) {
    return lotsStore.on("@changed", (next, last) => {
      callback(next, last);
    });
  },
  checkDataIsReady() {
    return lotsStore.get().ready;
  },
  async fetch() {
    try {
      const res: any = await plainFetch({
        url: getLots,
        method: "GET",
      });
      lotsStore.dispatch("lots/set", res);
      return res;
    } catch {
      lotsStore.dispatch("lots/set", []);
    }
  },
  async bet(body: { user_id: number; lot_id: number; money: number }) {
    await authFetch({
      url: placeBet,
      method: "POST",
      body: { ...body, is_buy_now: false },
      raw: true,
    });
    await lotsStoreInterface.fetch();
  },
  async buy(body: { user_id: number; lot_id: number; money: number }) {
    await authFetch({
      url: placeBet,
      method: "POST",
      body: { ...body, is_buy_now: true },
      raw: true,
    });
    await lotsStoreInterface.fetch();
  },
  async create(body) {
    await authFetch({
      url: createLot,
      method: "POST",
      body,
      raw: true,
    });
    await lotsStoreInterface.fetch();
  },
  async delete(body) {
    await authFetch({
      url: deleteLot,
      method: "POST",
      body,
      raw: true,
    });
    await lotsStoreInterface.fetch();
  },
};

export const useLotsData = createStoreHook(lotsStoreInterface);
