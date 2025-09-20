import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";

const app = new Elysia()
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      path: "/docs",
    })
  )
  .get("/", () => "Hello world!")
  .listen(process.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
