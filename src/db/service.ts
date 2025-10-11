import {
  DrizzleError,
  DrizzleQueryError,
  TransactionRollbackError,
  sql,
} from "drizzle-orm";
import db from ".";
import { DatabaseHealthModel } from "./model";
import { ServiceStatus } from "../common/enum";
import { reset } from "drizzle-seed";
import { schema } from "./schema";
import { seedResult, seedStudent, seedTest, seedUser } from "./seed";

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
      let message = "";
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
      message = message || "Database error occurred";
      return message;
    }

    console.error("Full error:", error);
    return "Unknown database error";
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
      } satisfies DatabaseHealthModel;
    } catch (err) {
      const message = this.logDatabaseError(err);

      return {
        status: ServiceStatus.Bad,
        uptime: "00:00:00",
        message,
      } satisfies DatabaseHealthModel;
    }
  }

  static async seedDatabase() {
    const studentResult = await seedStudent();
    const userResult = await seedUser();
    const testResult = await seedTest();
    const resultResult = await seedResult();
    return {
      studentResult,
      userResult,
      testResult,
      resultResult,
    };
  }

  static async resetDatabase() {
    await reset(db, schema);
  }
}
