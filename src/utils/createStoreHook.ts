import { useEffect, useRef, useState } from "react";

export default function createStoreHook(storeInterface) {
  const getData = getDedupedDataFetcher(storeInterface);

  function useStore(getData, ...query: any): any[] {
    let actualQuery: any = query;

    if (query.length === 1 && typeof query[0] === "function") {
      try {
        actualQuery = query[0]();
      } catch (e) {
        actualQuery = false;
      }
    }

    const shouldRun = !!actualQuery;
    const storeDataRef = useRef(null);
    const [, rerender] = useState({});

    if (shouldRun) {
      storeDataRef.current = getData(...actualQuery);
    }

    useEffect(() => {
      if (shouldRun) {
        return storeInterface.subscribe(() => rerender({}));
      }
    }, [shouldRun]);

    return [storeDataRef.current, storeInterface];
  }

  const useStoreOrSuspend: any = useStore.bind(null, getData);
  return useStoreOrSuspend;
}

export function getDedupedDataFetcher({
  name = "?",
  get,
  fetch,
  checkDataIsReady = null,
}: any) {
  const currentFetchPromises = {};
  const fetchErrors = {};

  function getDataOrPromise(...query) {
    const [data, ready] = getDataAndCheckReady({
      get: get.bind(null, ...query),
      checkDataIsReady: checkDataIsReady?.bind(null, ...query),
    });

    if (!ready) {
      console.debug(name, "Data is not ready", query);
      const dedupKey = JSON.stringify(query);
      const currentPromise = currentFetchPromises[dedupKey];
      const currentError = fetchErrors[dedupKey];

      if (currentPromise) {
        console.debug(name, "Data is already fetching", query);

        return currentPromise;
      }

      if (currentError) {
        console.debug(name, "Request previously ended with error", query);
        throw currentError;
      }

      console.debug(name, "Requesting", query);
      const fetchPromise = fetch(...query)
        .catch((e) => {
          console.log(name, "Request ended with error", query);
          fetchErrors[dedupKey] = e;
          return Promise.reject(e);
        })
        .finally(() => {
          delete currentFetchPromises[dedupKey];
        });

      currentFetchPromises[dedupKey] = fetchPromise;
      return fetchPromise;
    }
    console.debug(name, "Data is ready for", query);
    return data;
  }

  function getDataOrSuspend(...query) {
    const dataOrPromise = getDataOrPromise(...query);

    if (dataOrPromise instanceof Promise) {
      console.debug(name, "Suspending", query);
      throw dataOrPromise;
    }

    return dataOrPromise;
  }

  return getDataOrSuspend;
}

function getDataAndCheckReady({ get, checkDataIsReady }) {
  if (checkDataIsReady) {
    return [get(), checkDataIsReady()];
  }

  const data = get();
  return [data, data !== null];
}
