import { sleep } from "./sleep";
import { userStoreInterface } from "../storages/userData";

export type RequestInfo = {
  method: string;
  url: string;
  raw?: boolean;
  query?: {
    [param: string]: (string | number | boolean) | (string | number)[];
  };
  body?: { [param: string]: any } | Blob | FormData;
  headers?: string[][];
};

export class RequestError extends Error {
  data: null | object;
  code: number;

  constructor(code: number, data: any) {
    super();

    this.data = data;
    this.code = code;
  }
}

type RequestBody =
  | string
  | URLSearchParams
  | Blob
  | ArrayBufferView
  | ArrayBuffer
  | FormData
  | ReadableStream<Uint8Array>
  | null
  | undefined;

type Headers = string[][];

function prepareRequestInfo(request, headers): Request {
  const requestUrl = new URL(request.url, window.location.origin);
  if (request.query) {
    Object.keys(request.query).forEach((key) => {
      if (request.query[key]) {
        if (Array.isArray(request.query[key])) {
          for (let i = 0; i < request.query[key].length; i++) {
            requestUrl.searchParams.append(
              key,
              request.query[key][i].toString()
            );
          }
        } else {
          requestUrl.searchParams.append(key, request.query[key].toString());
        }
      }
    });
  }
  const contentTypeHeaders: any = [];

  let body: RequestBody;
  if (request.method !== "GET") {
    if (!request.body) {
      body = "{}";
    }
    if (request.body instanceof Blob) {
      body = request.body;
    } else if (request.body instanceof FormData) {
      body = request.body;
    } else {
      contentTypeHeaders.push(["content-type", "application/json"]);
      body = JSON.stringify(request.body);
    }
  }

  return new Request(requestUrl.toString(), {
    body,
    mode: "cors",
    method: request.method,
    headers: [...contentTypeHeaders, ...(request.headers || []), ...headers],
  });
}

function createRequest(request: RequestInfo, headers: Headers = []) {
  return () => prepareRequestInfo(request, headers);
}

export async function authFetch<K>(request: RequestInfo): Promise<K> {
  const authHeader = await userStoreInterface.token();
  request.headers = [["Authorization", `${authHeader}`]];
  if (!authHeader) throw new Error("Unauthorized");

  const req = createRequest(request);

  return doFetch<K>(req, request.raw);
}

export async function plainFetch<K>(request: RequestInfo): Promise<K> {
  const req = createRequest(request);

  return doFetch<K>(req, request.raw);
}

const STATUS_CODES = {
  OK: [200, 204],
  RETRY: [500, 503, 429, 522, 524],
  CLIENT_ERROR: [400, 401, 402, 404, 403, 409, 412, 413, 425],
};

function isRetryable(request: Request): boolean {
  return request.method !== "POST";
}

async function doFetch<K>(
  requestCreator: () => Request,
  raw = false
): Promise<K> {
  const initialRetries = 3;
  let retries = initialRetries;

  while (retries) {
    const request = requestCreator();

    retries -= 1;
    const response: any = await fetch(request);

    switch (true) {
      case STATUS_CODES.OK.includes(response.status):
        if (raw) {
          return response;
        } else {
          const text = await response.text();
          return JSON.parse(text);
        }

      case STATUS_CODES.CLIENT_ERROR.includes(response.status):
        const res = await response.json();
        throw new RequestError(response.status, res);
      case STATUS_CODES.RETRY.includes(response.status) || isRetryable(request):
        await sleep(150);
        continue;
      default:
        throw new Error("Unexpected exception");
    }
  }

  const req = await requestCreator();
  throw new Error(`Request failed after ${initialRetries} for ${req.url}`);
}
