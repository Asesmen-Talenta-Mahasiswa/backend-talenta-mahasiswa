import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { usersTable } from "./schema";
import { serviceStatusSchema } from "../common/model";

export const newUserSchema = createInsertSchema(usersTable, {
  username: z
    .string()
    .min(3, "Nama pengguna harus memiliki minimal 3 karakter")
    .max(20, "Nama pengguna maksimal 20 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Nama pengguna hanya boleh berisi huruf, angka, dan garis bawah (_)"
    ),
  password: z
    .string()
    .min(8, "Kata sandi harus memiliki minimal 8 karakter")
    .max(128, "Kata sandi maksimal 128 karakter")
    .regex(/[a-z]/, "Kata sandi harus mengandung setidaknya 1 huruf kecil")
    .regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya 1 huruf besar")
    .regex(/[0-9]/, "Kata sandi harus mengandung setidaknya 1 angka")
    .regex(
      /[^a-zA-Z0-9]/,
      "Kata sandi harus mengandung setidaknya 1 simbol khusus"
    ),
});
export const userSchema = createSelectSchema(usersTable);
export const updateUserSchema = createUpdateSchema(usersTable);

export const databaseHealthSchema = z.object({
  status: serviceStatusSchema,
  uptime: z.string(),
  message: z.string(),
});

export type NewUserModel = z.infer<typeof newUserSchema>;
export type UserModel = z.infer<typeof userSchema>;
export type UpdateUserModel = z.infer<typeof updateUserSchema>;

export type DatabaseHealthModel = z.infer<typeof databaseHealthSchema>;
