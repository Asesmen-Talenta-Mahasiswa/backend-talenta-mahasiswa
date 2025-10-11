import Elysia, { NotFoundError } from "elysia";
import { ResponseStatus } from "../../common/enum";
import {
  getSystemEchoSchema,
  getSystemHealthSchema,
  getSystemInfoSchema,
} from "./model";
import { SystemService } from "./service";
import { DatabaseService } from "../../db/service";

export const systemEndpoint = new Elysia({
  prefix: "/system",
  tags: ["System"],
})
  .all(
    "/",
    () => {
      throw new NotFoundError();
    },
    {
      detail: {
        hide: true,
      },
    }
  )
  .get(
    "/",
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
    }
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
    }
  )
  .get(
    "/echo",
    ({}) => {
      // echo service to test the API
      return "Hello world!";
    },
    {
      detail: {
        summary: "Echo",
        description: "A simple echo endpoint to test if the API is reachable.",
      },
      response: {
        200: getSystemEchoSchema,
      },
    }
  )
  .post(
    "/seed-db",
    async () => {
      const result = await DatabaseService.seedDatabase();
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
    }
  )
  .post(
    "/reset-db",
    async () => {
      await DatabaseService.resetDatabase();
      return {
        status: ResponseStatus.Success,
        message: "Database has been reset",
      };
    },
    {
      detail: {
        summary: "Reset Database",
        description:
          "Resets the database by dropping and recreating all tables.",
      },
    }
  );
