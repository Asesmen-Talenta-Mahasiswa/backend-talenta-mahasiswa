import { t } from "elysia";
import { dbModel } from "../../db/model";
import { SortDirection } from "../../common/constant";

const selectUser = dbModel.select.user;
const { id, createdAt, updatedAt, ...insertUser } = dbModel.insert.user;

export const userModel = t.Object(selectUser);

export const newUserModel = t.Object(
  {
    ...insertUser,
  },
  {
    error: "Request body untuk pengguna baru tidak valid",
  },
);

export const updateUserModel = t.Partial(
  t.Object(
    {
      ...insertUser,
    },
    {
      minProperties: 1,
      error: "Request body untuk mengubah pengguna tidak valid",
    },
  ),
);

export const userParamsSchema = t.Object({
  userId: t.String({
    format: "uuid",
    error: "ID user harus berupa UUID",
    examples: ["019a2689-d51c-70fc-8a84-d6423ee19c04"],
  }),
});

export const userQuerySchema = t.Object({
  page: t.Optional(
    t.Number({
      minimum: 1,
      error:
        "Halaman pengguna harus berupa angka dan tidak boleh negatif atau nol",
    }),
  ),
  pageSize: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      error:
        "Ukuran halaman pengguna harus berupa angka dan bernilai antara 1 - 100",
      examples: [1, 5, 10, 50, 100],
    }),
  ),
  sortDirection: t.Optional(
    t.Enum(SortDirection, {
      error: "Opsi pengurutan pengguna hanya bisa ascending atau descending",
      examples: [SortDirection.DESC, SortDirection.ASC],
    }),
  ),
});

export type UserModel = typeof userModel.static;
export type NewUserModel = typeof newUserModel.static;
export type UpdateUserModel = typeof updateUserModel.static;
