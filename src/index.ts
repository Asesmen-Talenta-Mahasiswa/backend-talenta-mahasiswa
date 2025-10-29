import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { version as apiVersion, author } from "../package.json";

import { studentEndpoint } from "./feature/student";
import { systemEndpoint } from "./feature/system";
import { ResponseStatus } from "./common/enum";
import { testEndpoint } from "./feature/test";
import { logger } from "./logger";
import { isDev } from "./common";
import { resultEndpoint } from "./feature/result";

const app = new Elysia()
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
    })
  )

  .use(
    logger({
      showStartUpMessage: isDev ? "rich" : "simple",
    })
  )

  .onError(({ error, code, status }) => {
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
  .use(studentEndpoint)
  .use(testEndpoint)
  .use(resultEndpoint)

  .listen(Bun.env.PORT ?? 3000); // for fallback
