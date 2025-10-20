import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { usersTable } from "../../db/schema";
import { t } from "elysia";

export const userSchema = createSelectSchema(usersTable);

export const newUserSchema = createInsertSchema(usersTable, {
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

export const updateUserSchema = createUpdateSchema(usersTable, {
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

export type UserModel = typeof userSchema.static;
export type NewUserModel = typeof newUserSchema.static;
export type UpdateUserModel = typeof updateUserSchema.static;
