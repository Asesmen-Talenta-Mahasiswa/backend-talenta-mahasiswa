import { InternalServerError } from "elysia";
import db from "../../db";
import { DatabaseService } from "../../db/service";
import { eq, asc, desc } from "drizzle-orm";
import type { NewUserModel, UpdateUserModel } from "./model";
import { user as userSchema } from "../../db/schema";
import { SystemService } from "../system/service";

export abstract class UserService {
  static async getUsers(page = 1, pageSize = 10, sort = "desc") {
    try {
      const users = await db
        .select()
        .from(userSchema)
        .orderBy(sort === "desc" ? desc(userSchema.id) : asc(userSchema.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalItems = await db.$count(userSchema);
      const totalPages =
        pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

      return {
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
        users,
      };
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async getUser(userId: string) {
    try {
      const user = await db.query.user.findFirst({
        where: (column, { eq }) => eq(column.id, userId),
      });

      const safeUser = user ? (({ password, ...rest }) => rest)(user) : null;

      return safeUser;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async createUser(newUser: NewUserModel) {
    try {
      const { password, ...rest } = newUser;
      const passwordHashed = await Bun.password.hash(password);
      const [created] = await db
        .insert(userSchema)
        .values({ ...rest, password: passwordHashed })
        .returning();

      if (!created) return null;

      const safeUser = (({ password, ...rest }) => rest)(created);

      return safeUser;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }

  static async updateUser(userId: string, user: UpdateUserModel) {
    try {
      const updatedData = {
        ...user,
        password: user.password
          ? await Bun.password.hash(user.password)
          : undefined,
      };

      const [updated] = await db
        .update(userSchema)
        .set(updatedData)
        .where(eq(userSchema.id, userId))
        .returning();

      if (!updated) return null;

      const { password, ...safeUser } = updated;

      return safeUser;
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}
