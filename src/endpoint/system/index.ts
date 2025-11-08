import Elysia, { NotFoundError, t } from "elysia";
import { ResponseStatus } from "../../common/enum";
import {
  getSystemEchoSchema,
  getSystemHealthSchema,
  getSystemInfoSchema,
  seedDatabaseSchema,
} from "./model";
import { SystemService } from "./service";
import { DatabaseService } from "../../db/service";

export const systemEndpoint = new Elysia({
  prefix: "/system",
  tags: ["System"],
})
  .get(
    "",
    ({ status }) => {
      const systemInfo = SystemService.getSystemInfo();

      return status(200, {
        status: ResponseStatus.Success,
        message: "Service metadata retrieved",
        data: systemInfo,
      });
    },
    {
      detail: {
        summary: "Get API Metadata",
        description:
          "Returns metadata and runtime information about this backend service, including version, environment, documentation endpoints, and uptime.",
      },
      response: {
        200: getSystemInfoSchema,
      },
    },
  )
  .get(
    "/health",
    async () => {
      const result = await SystemService.getHealth();

      return {
        status: ResponseStatus.Success,
        message: "Health check successful",
        data: result,
      };
    },
    {
      detail: {
        summary: "Service Health Check",
        description:
          "Returns the health status of each service used by this app.",
      },
      response: {
        200: getSystemHealthSchema,
      },
    },
  )
  .get(
    "/echo",
    ({ status }) => {
      // echo service to test the API
      return status(200, "Hello world!");
    },
    {
      detail: {
        summary: "Echo",
        description: "A simple echo endpoint to test if the API is reachable.",
      },
      response: {
        200: getSystemEchoSchema,
      },
    },
  )
  .post(
    "/seed-db",
    async ({ query }) => {
      const result = await DatabaseService.seedDatabase(query);
      return {
        status: ResponseStatus.Success,
        message: "Database has been seeded",
        data: result,
      };
    },
    {
      detail: {
        summary: "Seed Database with Sample Data",
        description:
          "Seeds the database with sample student data for testing purposes.",
      },
      query: seedDatabaseSchema,
    },
  )
  .post(
    "/reset-db",
    async ({ query }) => {
      if (query.areYouSure) await DatabaseService.resetDatabase();
      return {
        status: ResponseStatus.Success,
        message: query.areYouSure
          ? "Database has been reset"
          : "Database reset cancelled",
      };
    },
    {
      detail: {
        summary: "Reset Database",
        description:
          "Resets the database by dropping and recreating all tables.",
      },
      query: t.Object(
        {
          areYouSure: t.Optional(
            t.Boolean({ default: false, error: "Invalid flags" }),
          ),
        },
        {
          error: "Invalid request",
        },
      ),
    },
  );
