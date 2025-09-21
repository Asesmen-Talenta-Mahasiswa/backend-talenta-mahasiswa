import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";
import db from "./db";

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
  .get("/health", async () => {
    try {
      // Test database connection by running a simple query
      await db.execute("SELECT 1");
      
      return {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      return {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  })
  .listen(process.env.PORT ?? 3000); // for fallback

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
