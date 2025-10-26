import Elysia, { ElysiaCustomStatusResponse } from "elysia";
import pino from "pino";
import PinoPretty, { PrettyOptions } from "pino-pretty";
import { version as ELYSIA_VERSION } from "elysia/package.json";
import { version as APP_VERSION } from "../../package.json";
import picocolors from "picocolors";
import {
  formatColorStatusCode,
  formatDuration,
  formatMethod,
  formatPath,
  formatStatusCode,
  formatSymbol,
  formatTimestamp,
} from "./formatter";
import { isDev } from "../common";

const serverStartTime = performance.now();

const prettyOption: PrettyOptions = {
  ignore: undefined,
  minimumLevel: isDev ? "trace" : "info",
  customPrettifiers: {},
  messageFormat: "{levelLabel} - {if pid}{pid} - {end}url:{req.url}",
};

type LoggerConfig = {
  showStartUpMessage?: false | "rich" | "simple";
};

const pretty = isDev ? PinoPretty(prettyOption) : undefined;

const pinoLogger = pino(
  {
    level: isDev ? "trace" : "info",
    formatters: {
      level(label, _) {
        return { level: label.toUpperCase() };
      },
    },
  }
  // pretty
);

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

      const duration = performance.now() - serverStartTime;

      if (showStartUpMessage === "simple") {
        console.log(`🦊 Elysia v${ELYSIA_VERSION} started in ${duration.toFixed(0)} ms`);
        return;
      }

      const host = Bun.env.DB_HOST;
      const port = parseInt(Bun.env.DB_PORT);
      const user = "*****";
      const password = "*****";
      const dbName = Bun.env.DB_NAME;
      const database = "postgresql";

      await Bun.write(
        Bun.stdout,
        `🦊 ${picocolors.green(
          `${picocolors.bold("Elysia")} v${ELYSIA_VERSION}`
        )} ${picocolors.gray("started in")} ${picocolors.bold(
          duration.toFixed(0)
        )} ms\n\n`
      );
      await Bun.write(
        Bun.stdout,
        `${picocolors.green(" ➜ ")} ${picocolors.bold(
          "Name"
        )}:     ${picocolors.whiteBright("RESTful API Asesmen Talenta Mahsiswa")}\n`
      );
      await Bun.write(
        Bun.stdout,
        `${picocolors.green(" ➜ ")} ${picocolors.bold("Server")}:   ${picocolors.blue(
          server?.url.toString() ?? "unknown"
        )}\n`
      );
      await Bun.write(
        Bun.stdout,
        `${picocolors.green(" ➜ ")} ${picocolors.bold("Database")}: ${picocolors.blue(
          `${database}://${user}:${password}@${host}:${port}/${dbName}`
        )}\n`
      );
      await Bun.write(
        Bun.stdout,
        `${picocolors.green(" ➜ ")} ${picocolors.bold("Version")}:  ${picocolors.green(
          APP_VERSION
        )}\n\n`
      );
    })

    .onRequest(async ({ store }) => {
      store.requestStartTime = process.hrtime.bigint();
    })

    .onError({ as: "global" }, async ({ store, request, path, set, code }) => {
      const duration = formatDuration(process.hrtime.bigint() - store.requestStartTime);
      const method = formatMethod(request.method);
      const timestamp = formatTimestamp(new Date());
      const _path = formatPath(path);
      let status = formatStatusCode(set.status, 500);
      if (typeof code === "number") status = code;
      const symbol = formatSymbol(status);
      const _status = formatColorStatusCode(status);
      const logMsg = `${symbol} ${timestamp} ${method} ${_path} ${_status} ${duration}\n`;
      await Bun.write(Bun.stderr, logMsg);
      // pinoLogger.error({ duration, method, path, status, symbol });
    })

    .onAfterHandle({ as: "global" }, async ({ responseValue, request, path, store }) => {
      if (responseValue instanceof Response) {
        if (responseValue.status < 300 && responseValue.status > 300) return;
        if (!responseValue.headers.get("location")) return;

        store.isRedirected = true;

        const symbol = formatSymbol(responseValue.status);
        const timestamp = formatTimestamp(new Date());
        const method = formatMethod(request.method);
        const _path = formatPath(path);
        const status = formatColorStatusCode(responseValue.status);
        const redirectPath = formatPath(
          responseValue.headers.get("location") ?? "unknown"
        );
        const duration = formatDuration(process.hrtime.bigint() - store.requestStartTime);
        const logMsg = `${symbol} ${timestamp} ${method} ${_path} ${symbol} ${redirectPath} ${status} ${duration}\n`;
        await Bun.write(Bun.stdout, logMsg);
        return;
      }
      store.isRedirected = false;
    })

    .onAfterResponse({ as: "global" }, async ({ store, request, path, set }) => {
      const duration = formatDuration(process.hrtime.bigint() - store.requestStartTime);
      const method = formatMethod(request.method);
      const timestamp = formatTimestamp(new Date());
      const status = formatStatusCode(set.status, 200);
      const _path = formatPath(path);
      const symbol = formatSymbol(status);
      const _status = formatColorStatusCode(status);

      if (status >= 500) return;
      if (store.isRedirected) return;

      const logMsg = `${symbol} ${timestamp} ${method} ${_path} ${_status} ${duration}\n`;

      if (status >= 400) {
        // pinoLogger.warn({ duration, method, path, status, symbol });
        await Bun.write(Bun.stdout, logMsg);
        return;
      }

      await Bun.write(Bun.stdout, logMsg);
      // pinoLogger.info({ duration, method, path, status, symbol });
    });

  // Testing only
  // .all("/logger/testing", () => "Hi!")

  // .get("/logger/success", ({ status }) => status(204, "Success Status"))
  // .get("/logger/fail", ({ status }) => status(404, "Fail Status"))
  // .get("/logger/error", ({ status }) => {
  //   throw status(502, "Error Status");
  // })

  // .get("/logger/redirect-point", (c) => c.status("Accepted", "Redirected!"))
  // .post("/logger/redirect-test", ({ redirect }) =>
  //   redirect("/logger/redirect-point", 303)
  // );

  return log;
}
