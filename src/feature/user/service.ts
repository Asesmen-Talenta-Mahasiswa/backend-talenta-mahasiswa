import { InternalServerError } from "elysia";
import db from "../../db";
import { DatabaseService } from "../../db/service";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { NewUserModel, UpdateUserModel } from "./model";

export abstract class UserService {
  static async getUsers(page = 1, pageSize = 10, sort = "desc") {
    try {
      const result = await db.query.usersTable.findMany({
        orderBy: (column, { desc, asc }) => [
          sort === "desc" ? desc(column.id) : asc(column.id),
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      return result;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getUser(userId: string) {
    try {
      const user = await db.query.usersTable.findFirst({
        where: (column, { eq }) => eq(column.id, userId),
      });
      return user;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createUser(newUser: NewUserModel) {
    try {
      const hashed = await Bun.password.hash(newUser.password);
      const [created] = await db
        .insert(usersTable)
        .values({ ...newUser, password: hashed })
        .returning();

      if (!created) return null;
      return created;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async updateUser(userId: string, user: UpdateUserModel) {
    try {
      const payload: Partial<UpdateUserModel> = { ...user };

      if (payload.password) {
        payload.password = await Bun.password.hash(payload.password);
      } else {
        // Ensure we don't accidentally set password to null/undefined in DB
        delete (payload as any).password;
      }

      const [updated] = await db
        .update(usersTable)
        .set(payload)
        .where(eq(usersTable.id, userId))
        .returning();

      if (!updated) return null;
      return updated;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }
}
