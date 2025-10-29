import Elysia, { t } from "elysia";
import { UserService } from "./service";
import { ResponseStatus } from "../../common/enum";
import { commonResponseSchema } from "../../common/model";
import {
  newUserSchema,
  updateUserSchema,
  userParamsSchema,
  UpdateUserModel,
  userQuerySchema,
  userSchema,
} from "./model";
import { hasAnyValue } from "../../utils";

export const userEndpoint = new Elysia({ prefix: "/users", tags: ["User"] })
  .get(
    "",
    async ({ query, status }) => {
      const users = await UserService.getUsers(query.page, query.pageSize, query.sort);
      const sanitized = users.map(({ password, ...rest }) => rest);

      return status(200, {
        status: ResponseStatus.Success,
        message: "Data pengguna berhasil diambil",
        data: sanitized,
      });
    },
    {
      query: userQuerySchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: t.Array(userSchema),
        }),
        500: commonResponseSchema("error"),
      },
    }
  )
  .get(
    "/:userId",
    async ({ params, status }) => {
      const user = await UserService.getUser(params.userId);
      if (!user) {
        return status(404, {
          status: ResponseStatus.Fail,
          message: "Pengguna tidak ditemukan",
        });
      }

      const { password, ...rest } = user;
      return status(200, {
        status: ResponseStatus.Success,
        message: "Pengguna ditemukan",
        data: rest,
      });
    },
    {
      params: userParamsSchema,
      response: {
        200: t.Object({
          ...commonResponseSchema("success").properties,
          data: userSchema,
        }),
        404: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .post(
    "",
    async ({ body, status }) => {
      const created = await UserService.createUser(body);
      if (!created) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Pengguna gagal ditambahkan",
        });
      }

      const { password, ...rest } = created;
      return status(201, {
        status: ResponseStatus.Success,
        message: "Pengguna berhasil ditambahkan",
        data: rest,
      });
    },
    {
      body: newUserSchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: userSchema,
        }),
        422: commonResponseSchema("fail"),
        500: commonResponseSchema("error"),
      },
    }
  )
  .patch(
    "/:userId",
    async ({ params, body, status }) => {
      const isEmpty = hasAnyValue<UpdateUserModel>(body);
      if (!isEmpty) {
        return status(400, {
          status: ResponseStatus.Fail,
          message: "Tidak ada data yang bisa diperbarui karena request body kosong",
        });
      }

      const updated = await UserService.updateUser(params.userId, body);
      if (!updated) {
        return status(422, {
          status: ResponseStatus.Fail,
          message: "Pengguna gagal diperbarui",
        });
      }

      const { password, ...rest } = updated;
      return status(201, {
        status: ResponseStatus.Success,
        message: "Pengguna berhasil diperbarui",
        data: rest,
      });
    },
    {
      params: userParamsSchema,
      body: updateUserSchema,
      response: {
        201: t.Object({
          ...commonResponseSchema("success").properties,
          data: userSchema,
        }),
        400: commonResponseSchema("fail"),
        422: commonResponseSchema("fail"),
      },
    }
  );
