import Elysia, { t } from "elysia";
import { systemModel } from "./model";
import { SystemService } from "./service";
import { DatabaseService } from "../../db/service";
import { ResponseStatus } from "../../common/constant";
import { env } from "../../env";
import { type FailResponseModel } from "../../common/model";

export const systemEndpoint = new Elysia({
  prefix: "/system",
  tags: ["System"],
})
  .use(systemModel)
  .get(
    "",
    ({ status }) => {
      const systemInfo = SystemService.getSystemInfo();

      return status(200, {
        status: ResponseStatus.Success,
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
        200: "system.info",
      },
    },
  )
  .get(
    "/echo",
    ({ status }) => {
      return status(200, "Healthy!");
    },
    {
      detail: {
        summary: "Echo",
        description: "A simple echo endpoint to test if the API is reachable.",
      },
      response: {
        200: "system.health",
      },
    },
  )
  .guard({
    headers: t.Object({
      "x-api-key": t.String({
        minLength: 1,
        error: "API key harus berupa text dan tidak boleh kosong",
        description: "API Key for authentication",
      }),
    }),
    beforeHandle({ headers, status }) {
      if (headers["x-api-key"] !== env.API_KEY) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "x-api-key",
              message: "API key tidak valid",
            },
          ],
        } satisfies FailResponseModel);
      }
    },
  })
  .post(
    "/seed-db",
    async () => {
      console.log("Seeding database...");
      const result = await DatabaseService.seedDatabase();
      return result;
    },
    {
      detail: {
        summary: "Seed Database",
      },
    },
  )
  .post(
    "/reset-db",
    async () => {
      const result = await DatabaseService.resetDatabase();
      return result;
    },
    {
      detail: {
        summary: "Reset Database",
      },
    },
  );
