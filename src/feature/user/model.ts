import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { usersTable } from "../../db/schema";
import { t } from "elysia";

const _userSchema = createSelectSchema(usersTable);
export const userSchema = t.Omit(_userSchema, ["password"]);

const _newUserSchema = createInsertSchema(usersTable, {
  username: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      maxLength: 32,
      pattern: "^[A-Za-z0-9_]+$",
      error:
        "Nama pengguna harus diisi, maksimal 32 karakter, dan hanya boleh mengandung huruf, angka, dan garis bawah (_)",
      examples: ["user_123", "johnDoe", "alice_01"],
    }),
  password: (schema) =>
    t.String({
      ...schema,
      minLength: 6,
      pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$",
      error:
        "Password minimal 6 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan simbol",
      examples: ["P@ssw0rd", "Admin#123", "User!2024"],
    }),
});
export const newUserSchema = t.Omit(_newUserSchema, ["id", "createdAt", "updatedAt"]);

const _updateUserSchema = createUpdateSchema(usersTable, {
  username: (schema) =>
    t.String({
      ...schema,
      minLength: 1,
      maxLength: 32,
      pattern: "^[A-Za-z0-9_]+$",
      error:
        "Nama pengguna harus diisi, maksimal 32 karakter, dan hanya boleh mengandung huruf, angka, dan garis bawah (_)",
      examples: ["user_123", "johnDoe", "alice_01"],
    }),
  password: (schema) =>
    t.String({
      ...schema,
      minLength: 6,
      pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$",
      error:
        "Password minimal 6 karakter dan harus mengandung huruf besar, huruf kecil, angka, dan simbol",
      examples: ["P@ssw0rd", "Admin#123", "User!2024"],
    }),
});

export const updateUserSchema = t.Omit(_updateUserSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const userParamsSchema = t.Object({
  userId: t.String({
    format: "uuid",
    error: "User id harus berupa uuid",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export const userQuerySchema = t.Object({
  page: t.Optional(t.Number({ default: 1 })),
  pageSize: t.Optional(t.Number({ default: 10 })),
  sort: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")], { default: "desc" })),
});

export type UserModel = typeof userSchema.static;
export type NewUserModel = typeof newUserSchema.static;
export type UpdateUserModel = typeof updateUserSchema.static;
