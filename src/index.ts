import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import * as z from "zod";
import { version as apiVersion, author } from "../package.json";

import { dummyEndpoint } from "./feature/dummy";
import { studentEndpoint } from "./feature/student";
import { systemEndpoint } from "./feature/system";

const app = new Elysia()
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
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
  .use(dummyEndpoint)
  .use(systemEndpoint)
  .use(studentEndpoint)
  .listen(Bun.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
