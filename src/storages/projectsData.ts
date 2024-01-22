import { createStoreon } from "storeon";
import { createProject, deleteProject, getProjects } from "../utils/api";
import { authFetch, plainFetch } from "../utils/authFetch";
import createStoreHook from "../utils/createStoreHook";

const projectsStore = createStoreon<any, any>([
  (store) => {
    store.on("@init", () => ({ projects: null, token: null, ready: false }));
    store.on("projects/set", (state, projects) => ({
      ...state,
      projects,
      ready: true,
    }));
  },
]);

export const projectsStoreInterface = {
  get() {
    return projectsStore.get().projects;
  },
  subscribe(callback: any) {
    return projectsStore.on("@changed", (next, last) => {
      callback(next, last);
    });
  },
  checkDataIsReady() {
    return projectsStore.get().ready;
  },
  async fetch() {
    try {
      const res: any = await plainFetch({
        url: getProjects,
        method: "GET",
      });
      projectsStore.dispatch("projects/set", res);
    } catch {
      projectsStore.dispatch("projects/set", []);
    }
  },
  async create(body) {
    await authFetch({
      url: createProject,
      method: "POST",
      body,
      raw: true,
    });
    await projectsStoreInterface.fetch();
  },
  async delete(body) {
    await authFetch({
      url: deleteProject,
      method: "POST",
      body,
      raw: true,
    });
    await projectsStoreInterface.fetch();
  },
};

export const useProjectsData = createStoreHook(projectsStoreInterface);
