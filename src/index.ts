import { env, isProd } from "./env";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { version as apiVersion, author } from "../package.json";

import { studentEndpoint } from "./endpoint/student";
import { systemEndpoint } from "./endpoint/system";
import { ResponseStatus } from "./common/enum";
import { testEndpoint } from "./endpoint/test";
import { logger } from "./logger";
import { resultEndpoint } from "./endpoint/result";
import { userEndpoint } from "./endpoint/user";
import { filterEndpoint } from "./endpoint/filter";
import { errorHandleMiddleware } from "./middleware/errorHandle";
import cors from "@elysiajs/cors";

new Elysia({
  prefix: "/api/v1",
})
  // Documentation
  .use(
    openapi({
      path: "/docs",
      documentation: {
        openapi: "3.0.3",
        info: {
          title: "CCED UNILA Assessment Backend API",
          version: apiVersion,
          description:
            "Backend API for the Center for Character and Ethics Development (CCED) University of Lampung assessment system.",
          contact: {
            name: author.name,
            email: author.email,
          },
        },
        tags: [
          {
            name: "System",
            description: "System related endpoints",
          },
        ],
      },
    }),
  )

  .use(
    cors({
      origin: [env.ORIGIN, "http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )

  .use(
    logger({
      showStartUpMessage: isProd ? "simple" : "rich",
    }),
  )

  .use(errorHandleMiddleware)

  .onError(({ error, code, status }) => {
    // TODO: Start throw status() if it either fail or error, only return status() when it was success
    if (code === "VALIDATION") {
      const errMsg =
        error.customError ?? error.valueError?.message ?? "Request tidak valid";
      return status("Unprocessable Content", {
        status: ResponseStatus.Fail,
        message: errMsg,
      });
    }

    if (code === "PARSE") {
      return status("Bad Request", {
        status: ResponseStatus.Fail,
        message: "Request tidak valid",
      });
    }

    if (code === "UNKNOWN" || code === "INTERNAL_SERVER_ERROR") {
      return status("Internal Server Error", {
        status: ResponseStatus.Error,
        message: "Terjadi sebuah kesalahan",
      });
    }

    if (code === "INVALID_COOKIE_SIGNATURE") {
      return status("Unauthorized", {
        status: ResponseStatus.Fail,
        message: "Tanda tangan cookie tidak valid",
      });
    }

    if (code === "INVALID_FILE_TYPE") {
      return status("Unsupported Media Type", {
        status: ResponseStatus.Fail,
        message: "Tipe file tidak didukung",
      });
    }

    if (code === "NOT_FOUND") {
      return status("Not Found", {
        status: ResponseStatus.Fail,
        message: "Resource tidak ditemukan",
      });
    }
  })

  .use(systemEndpoint)
  .use(filterEndpoint)
  .use(studentEndpoint)
  .use(testEndpoint)
  .use(resultEndpoint)
  .use(userEndpoint)

  .listen(Bun.env.PORT ?? 3000); // for fallback
