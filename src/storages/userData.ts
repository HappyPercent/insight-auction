import { createStoreon } from "storeon";
import { banUser, login, me, register, unbanUser } from "../utils/api";
import { authFetch, plainFetch } from "../utils/authFetch";
import createStoreHook from "../utils/createStoreHook";

const userStore = createStoreon<any, any>([
  (store) => {
    store.on("@init", () => ({ user: null, token: null, ready: false }));
    store.on("user/set", (state, user) => ({ ...state, user, ready: true }));
    store.on("token/set", (state, token) => ({ ...state, token, ready: true }));
  },
]);

export const userStoreInterface = {
  get() {
    return userStore.get().user;
  },
  subscribe(callback: any) {
    return userStore.on("@changed", (next, last) => {
      callback(next, last);
    });
  },
  checkDataIsReady() {
    return userStore.get().ready;
  },
  token() {
    return userStore.get().token;
  },
  async fetch() {
    const storeToken = userStoreInterface.token();
    const storageToken = localStorage.getItem("token");
    if (storageToken) {
      userStore.dispatch("token/set", storageToken);
    } else if (storeToken) {
      localStorage.setItem("token", storeToken);
    }
    try {
      const res: any = await authFetch({
        url: me,
        method: "GET",
      });
      userStore.dispatch("user/set", res);
    } catch {
      userStore.dispatch("user/set", {});
    }
  },
  async setToken(token) {
    userStore.dispatch("token/set", token);
    localStorage.setItem("token", token);
    await userStoreInterface.fetch();
  },
  async login(body) {
    const res: any = await plainFetch({ url: login, method: "POST", body });
    await userStoreInterface.setToken(res.token);
    await userStoreInterface.fetch();
  },
  async register(body) {
    const res: any = await plainFetch({ url: register, method: "POST", body });
    await userStoreInterface.setToken(res.token);
    await userStoreInterface.fetch();
  },
  logout() {
    localStorage.removeItem("token");
    userStore.dispatch("token/remove");
    userStore.dispatch("user/set", {});
  },
  async ban(body) {
    await authFetch({
      url: banUser,
      method: "POST",
      body,
      raw: true,
    });
  },
  async unban(body) {
    await authFetch({
      url: unbanUser,
      method: "POST",
      body,
      raw: true,
    });
  },
};

export const useUserData = createStoreHook(userStoreInterface);
