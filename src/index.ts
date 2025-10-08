import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { version as apiVersion, author } from "../package.json";

import { dummyEndpoint } from "./feature/dummy";
import { studentEndpoint } from "./feature/student";
import { systemEndpoint } from "./feature/system";
import { ResponseStatus } from "./common/enum";

const app = new Elysia()
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
  .onError(({ error, code, status }) => {
    console.log(`[Student] Error ${code}:`, error);

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
        message: "Request body tidak valid",
      });
    }

    if (code === "UNKNOWN" || code === "INTERNAL_SERVER_ERROR") {
      return status("Internal Server Error", {
        status: ResponseStatus.Error,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (code === "NOT_FOUND") {
      return status("Not Found", {
        status: ResponseStatus.Fail,
        message: "Resource tidak ditemukan",
      });
    }
  })
  .use(dummyEndpoint)
  .use(systemEndpoint)
  .use(studentEndpoint)
  .listen(Bun.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
