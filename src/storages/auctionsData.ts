import { createStoreon } from "storeon";
import { createAuction, deleteAuction, getAuctions } from "../utils/api";
import { authFetch, plainFetch } from "../utils/authFetch";
import createStoreHook from "../utils/createStoreHook";

const auctionsStore = createStoreon<any, any>([
  (store) => {
    store.on("@init", () => ({ lots: null, token: null, ready: false }));
    store.on("auctions/set", (state, auctions) => ({
      ...state,
      auctions,
      ready: true,
    }));
  },
]);

export const auctionsStoreInterface = {
  get() {
    return auctionsStore.get().auctions;
  },
  subscribe(callback: any) {
    return auctionsStore.on("@changed", (next, last) => {
      callback(next, last);
    });
  },
  checkDataIsReady() {
    return auctionsStore.get().ready;
  },
  async fetch() {
    try {
      const res: any = await plainFetch({
        url: getAuctions,
        method: "GET",
      });
      auctionsStore.dispatch("auctions/set", res);
    } catch {
      auctionsStore.dispatch("auctions/set", []);
    }
  },
  async create(body) {
    await authFetch({
      url: createAuction,
      method: "POST",
      body,
      raw: true,
    });
    await auctionsStoreInterface.fetch();
  },
  async delete(body) {
    await authFetch({
      url: deleteAuction,
      method: "POST",
      body,
      raw: true,
    });
    await auctionsStoreInterface.fetch();
  },
};

export const useAuctionsData = createStoreHook(auctionsStoreInterface);
