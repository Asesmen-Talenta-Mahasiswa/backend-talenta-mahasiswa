import { createInsertSchema } from "drizzle-typebox";
import { usersTable } from "../../db/schema";
import { t } from "elysia";

export const newUserSchema = createInsertSchema(usersTable, {
  username: t.String({
    maxLength: 32,
    pattern: "^[A-Za-z0-9_]+$",
    error:
      "Nama pengguna maksimal terdiri dari 32 karakter dan hanya boleh mengandung underscore, huruf besar/kecil, dan angka",
  }),
});
export type NewUserModel = typeof newUserSchema.static;
