import { ElysiaCustomStatusResponse, InternalServerError } from "elysia";
import { version as apiVersion, author } from "../../../package.json";
import { DatabaseService } from "../../db/service";
import { isProd } from "../../env";

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
      environment: isProd ? "production" : "development",
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
    };
  }

  static errorHandle(error: unknown): never {
    DatabaseService.errorHandle(error);
    if (error instanceof ElysiaCustomStatusResponse) {
      throw error;
    }
    throw new InternalServerError();
  }
}
