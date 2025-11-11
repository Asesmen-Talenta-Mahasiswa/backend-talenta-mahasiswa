import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { version as apiVersion, author } from "../package.json";
import { env, isProd } from "./env";
import cors from "@elysiajs/cors";
import { filterEndpoint } from "./endpoint/filter";
import { resultEndpoint } from "./endpoint/result";
import { studentEndpoint } from "./endpoint/student";
import { systemEndpoint } from "./endpoint/system";
import { testEndpoint } from "./endpoint/test";
import { userEndpoint } from "./endpoint/user";
import { logger } from "./logger";
import { errorHandleMiddleware } from "./middleware/errorHandle";

export const serverStartTime = performance.now();

new Elysia()
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
      },
    }),
  )

  .use(
    cors({
      origin: [env.ORIGIN, "http://localhost:3002"],
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

  .use(systemEndpoint)
  .use(filterEndpoint)
  .use(studentEndpoint)
  .use(testEndpoint)
  .use(resultEndpoint)
  .use(userEndpoint)

  .listen(env.PORT ?? 3002); // for fallback
