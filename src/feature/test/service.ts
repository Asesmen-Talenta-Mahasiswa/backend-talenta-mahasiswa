import db from "../../db";
import { DatabaseService } from "../../db/service";

export abstract class TestService {
  static async getAllTest(page = 1, pageSize = 20) {
    try {
      const tests = await db.query.testsTable.findMany({
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      return tests;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      return null;
    }
  }
}
