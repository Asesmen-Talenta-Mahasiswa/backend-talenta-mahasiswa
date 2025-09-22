import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";
import { DatabaseService } from "./db/service";
import { responseSchema, responseStatusSchema } from "./common/model";
import { databaseHealthSchema } from "./db/model";
import { ResponseStatus } from "./common/enum";

const app = new Elysia()
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      path: "/docs",
    })
  )
  .get("/", () => {
    // root endpoint
    // TODO: add metadata about this API and where to find the docs
  })
  .get(
    "/health",
    async () => {
      // health check for each component/service.
      // e.g. db connection, redis, etc.
      const dbResult = await DatabaseService.checkConnection();

      return {
        status: ResponseStatus.Success,
        message: "Health check successful",
        data: {
          database: dbResult,
        },
      };
    },
    {
      response: {
        200: z.object({
          ...responseSchema.shape,
          data: z.object({
            database: databaseHealthSchema,
          }),
        }),
      },
    }
  )
  .get("/echo", ({ status }) => {
    // echo service to test the API
    return status(200, "Hello world!");
  })
  .listen(Bun.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
