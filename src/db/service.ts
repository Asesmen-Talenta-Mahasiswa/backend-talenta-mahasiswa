import {
  DrizzleError,
  DrizzleQueryError,
  TransactionRollbackError,
  sql,
} from "drizzle-orm";
import db from ".";
import { ServiceStatus } from "../common/enum";
// import { reset } from "drizzle-seed";
// import { schema } from "./schema";
// import { seedResult, seedStudent, seedTest, seedUser } from "./seed";
import type { SeedDatabaseModel } from "../endpoint/system/model";
import { MyLogger } from "../logger";
import { InternalServerError, status } from "elysia";

export abstract class DatabaseService {
  static logDatabaseError(error: any) {
    if (!error.cause) {
      console.error("Drizzle error:", error.message);
      if (error instanceof DrizzleQueryError) {
        return "Database query error";
      }

      if (error instanceof TransactionRollbackError) {
        return "Database transaction error";
      }

      if (error instanceof DrizzleError) {
        return "Database error";
      }
    }

    if ("code" in error.cause) {
      let message;
      switch (error.cause.code) {
        case "ECONNREFUSED":
          console.error("Database connection refused:", error.cause.message);
          message = "Database connection refused";
          break;
        case "ENOTFOUND":
          console.error("Database host not found:", error.cause.message);
          message = "Database host not found";
          break;
        case "ETIMEDOUT":
          console.error("Database connection timed out:", error.cause.message);
          message = "Database connection timed out";
          break;
        case "EHOSTUNREACH":
          console.error("Database host unreachable:", error.cause.message);
          message = "Database host unreachable";
          break;
        default:
          console.error("Database error:", error.cause.message);
      }
      message = message ?? "Database error occurred";
      return message;
    }

    console.error("Full error:", error);
    return "Unknown database error";
  }

  static errorHandle(error: unknown) {
    if (
      error instanceof DrizzleQueryError ||
      error instanceof TransactionRollbackError ||
      error instanceof DrizzleError
    ) {
      if (
        typeof error.cause === "object" &&
        error.cause !== null &&
        "code" in error.cause
      ) {
        switch (error.cause.code) {
          case "ECONNREFUSED":
            MyLogger.error("database", (error.cause as any).message);
          case "ENOTFOUND":
            MyLogger.error("database", (error.cause as any).message);
          case "ETIMEDOUT":
            MyLogger.error("database", (error.cause as any).message);
          case "EHOSTUNREACH":
            MyLogger.error("database", (error.cause as any).message);
            throw status(
              503,
              "Saat ini beberapa layanan sedang tidak tersedia, coba beberapa saat lagi",
            );
          default:
            MyLogger.error("database", (error.cause as any).message);
            throw new InternalServerError();
        }
      }
    }
  }

  static async checkConnection() {
    try {
      const checkUptimeStatement = sql`SELECT
        floor(extract(epoch from now() - pg_postmaster_start_time()) / 3600) || ':' ||
        to_char(to_timestamp(extract(epoch from now() - pg_postmaster_start_time())),'MI:SS')
        AS server_uptime;`;
      const result = await db.execute(checkUptimeStatement);

      return {
        status: ServiceStatus.Healthy,
        uptime: result[0].server_uptime as string,
        message: "Database connection is healthy",
      };
    } catch (err) {
      const message = this.logDatabaseError(err);

      return {
        status: ServiceStatus.Bad,
        uptime: "00:00:00",
        message,
      };
    }
  }

  static async seedDatabase(config: SeedDatabaseModel) {
    // const studentResult = config.student ? await seedStudent() : false;
    // const userResult = config.user ? await seedUser() : false;
    // const testResult = config.test ? await seedTest() : false;
    // const resultResult = config.result ? await seedResult() : false;
    // return {
    //   student: studentResult,
    //   user: userResult,
    //   testResult: testResult,
    //   resultResult: resultResult,
    // };
  }

  static async resetDatabase() {
    // await reset(db, schema);
  }
}
