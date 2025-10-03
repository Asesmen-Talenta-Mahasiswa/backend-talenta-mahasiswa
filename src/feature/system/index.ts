import Elysia from "elysia";
import { ResponseStatus } from "../../common/enum";
import z from "zod";
import {
  getSystemEchoSchema,
  getSystemHealthSchema,
  getSystemInfoSchema,
} from "./model";
import { SystemService } from "./service";

export const systemEndpoint = new Elysia()
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
        tags: ["System"],
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
        tags: ["System"],
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
        tags: ["System"],
        summary: "Echo",
        description: "A simple echo endpoint to test if the API is reachable.",
      },
      response: {
        200: getSystemEchoSchema,
      },
    }
  );
