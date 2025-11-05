import { ElysiaCustomStatusResponse, InternalServerError } from "elysia";
import { version as apiVersion, author } from "../../../package.json";
import { DatabaseService } from "../../db/service";
import { type SystemInfoModel } from "./model";

export abstract class SystemService {
  static getSystemInfo() {
    const now = new Date().toISOString();
    const uptimeSeconds = Math.floor(process.uptime?.() ?? 0);

    return {
      name: "CCED UNILA Assessment Backend API",
      version: apiVersion,
      author: author,
      description:
        "Backend API for the Center for Character and Ethics Development (CCED) University of Lampung assessment system.",
      environment: Bun.env.NODE_ENV ?? "development",
      docs: {
        ui: "/docs",
        json: "/docs/json",
      },
      runtime: {
        bun: Bun.version,
        platform: process.platform,
        isBun: process.isBun,
      },
      serverTime: now,
      uptimeSeconds,
    } satisfies SystemInfoModel;
  }

  static async getHealth() {
    // health check for each component/service.
    // e.g. db connection, redis, etc.
    const dbResult = await DatabaseService.checkConnection();

    return {
      database: dbResult,
    };
  }

  static errorHandle(error: unknown) {
    DatabaseService.errorHandle(error);
    if (error instanceof ElysiaCustomStatusResponse) {
      throw error;
    }
    throw new InternalServerError();
  }
}
