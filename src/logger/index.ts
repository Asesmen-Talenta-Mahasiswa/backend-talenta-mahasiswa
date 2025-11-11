import Elysia from "elysia";
import { version as ELYSIA_VERSION } from "elysia/package.json";
import { version as APP_VERSION } from "../../package.json";
import { env } from "../env";
import { serverStartTime } from "..";

type LoggerConfig = {
  showStartUpMessage?: false | "rich" | "simple";
};

function isJSON(value: unknown): boolean {
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function formatMessage(message: unknown): { text: string; isJSON: boolean } {
  if (isJSON(message)) {
    try {
      const parsed = JSON.parse(message as string);
      return {
        text: JSON.stringify(parsed, null, 2),
        isJSON: true,
      };
    } catch {
      return {
        text: String(message),
        isJSON: false,
      };
    }
  }
  if (typeof message === "object" && message !== null) {
    try {
      return {
        text: JSON.stringify(message, null, 2),
        isJSON: true,
      };
    } catch {
      return {
        text: String(message),
        isJSON: false,
      };
    }
  }
  return {
    text: String(message),
    isJSON: false,
  };
}

export abstract class MyLogger {
  static async debug(section: string, message: unknown) {
    const timestamp = new Date().toLocaleString();
    const { text, isJSON } = formatMessage(message);
    const separator = isJSON ? "\n" : " ";
    console.debug(`${timestamp} [${section.toUpperCase()}]${separator}${text}`);
  }

  static async error(section: string, message: unknown) {
    const timestamp = new Date().toLocaleString();
    const { text, isJSON } = formatMessage(message);
    const separator = isJSON ? "\n" : " ";
    console.error(`${timestamp} [${section.toUpperCase()}]${separator}${text}`);
  }

  static async warn(section: string, message: unknown) {
    const timestamp = new Date().toLocaleString();
    const { text, isJSON } = formatMessage(message);
    const separator = isJSON ? "\n" : " ";
    console.warn(`${timestamp} [${section.toUpperCase()}]${separator}${text}`);
  }

  static async info(section: string, message: unknown) {
    const timestamp = new Date().toLocaleString();
    const { text, isJSON } = formatMessage(message);
    const separator = isJSON ? "\n" : " ";
    console.info(`${timestamp} [${section.toUpperCase()}]${separator}${text}`);
  }
}

function formatDuration(ns: bigint | number): string {
  const value = typeof ns === "bigint" ? Number(ns) : ns;

  if (Number.isNaN(value) || !Number.isFinite(value)) return "NaN";
  if (value < 0) return `-${formatDuration(-value)}`;

  const NS_IN_US = 1_000;
  const NS_IN_MS = 1_000_000;
  const NS_IN_S = 1_000_000_000;

  let formatted: number;
  let unit: string;

  if (value < NS_IN_US) {
    formatted = value;
    unit = "ns";
  } else if (value < NS_IN_MS) {
    formatted = value / NS_IN_US;
    unit = "µs"; // microseconds
  } else if (value < NS_IN_S) {
    formatted = value / NS_IN_MS;
    unit = "ms";
  } else {
    formatted = value / NS_IN_S;
    unit = "s";
  }

  return `${formatted.toFixed(2)}${unit}`;
}

export function logger(config: LoggerConfig = {}) {
  const { showStartUpMessage = "simple" } = config;

  const log = new Elysia({
    name: "logger",
    seed: "customLogger",
  })
    .state("requestStartTime", process.hrtime.bigint())
    .state("isRedirected", false)

    .onStart(async ({ server }) => {
      if (!showStartUpMessage) return;

      const duration = (performance.now() - serverStartTime).toFixed(2);
      const url = server?.url.toString() ?? "unknown";

      if (showStartUpMessage === "simple") {
        console.info(
          `🦊 Elysia v${ELYSIA_VERSION} started in ${duration}ms at ${url}`,
        );
        return;
      }

      console.info(`Elysia v${ELYSIA_VERSION} started in ${duration}ms\n`);

      console.info(` ➜  Server   : ${url}`);
      console.info(` ➜  Database : ${env.DB_URL}`);
      console.info(` ➜  Version  : ${APP_VERSION}\n`);
    })

    .onRequest(async ({ store }) => {
      store.requestStartTime = process.hrtime.bigint();
    })

    .onError(async ({ store, request, path, set, code }) => {
      const duration = formatDuration(
        process.hrtime.bigint() - store.requestStartTime,
      );
      const method = request.method;
      const timestamp = new Date().toLocaleString();
      const statusCode =
        typeof code === "number" && code >= 500
          ? code
          : !set.status && typeof set.status === "number" && set.status >= 500
            ? set.status
            : 500;

      console.error(
        `${timestamp} | [ERROR] | ${statusCode} | ${method} | ${path} | ${duration} |`,
      );
    })

    .onAfterHandle(async ({ responseValue, request, path, store }) => {
      if (responseValue instanceof Response) {
        if (responseValue.status < 400 && responseValue.status > 300) return;
        if (!responseValue.headers.get("location")) return;

        store.isRedirected = true;

        const duration = formatDuration(
          process.hrtime.bigint() - store.requestStartTime,
        );
        const method = request.method;
        const timestamp = new Date().toLocaleString();
        const statusCode = responseValue.status;
        const redirectPath = responseValue.headers.get("location") ?? "unknown";

        console.info(
          `${timestamp} | [REDIRECTED] | ${statusCode} | ${method} | ${path} ➜ ${redirectPath} | ${duration} |`,
        );
        return;
      }
      store.isRedirected = false;
    })

    .onAfterResponse(async ({ store, request, path, set }) => {
      if (store.isRedirected) return;

      const statusCode =
        set.status && typeof set.status === "number" ? set.status : 200;

      if (statusCode >= 500) return;

      const duration = formatDuration(
        process.hrtime.bigint() - store.requestStartTime,
      );
      const method = request.method;
      const timestamp = new Date().toLocaleString();

      if (statusCode >= 400) {
        console.warn(
          `${timestamp} | [FAIL] | ${statusCode} | ${method} | ${path} | ${duration} |`,
        );
        return;
      }

      console.info(
        `${timestamp} | [SUCCESS] | ${statusCode} | ${method} | ${path} | ${duration} |`,
      );
    })
    .as("global");

  return log;
}
