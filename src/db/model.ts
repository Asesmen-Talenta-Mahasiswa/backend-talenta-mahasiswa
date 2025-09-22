import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { usersTable } from "./schema";
import { serviceStatusSchema } from "../common/model";

export const newUserSchema = createInsertSchema(usersTable, {
  email: z.email(),
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
