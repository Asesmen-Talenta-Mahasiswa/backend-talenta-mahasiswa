import Elysia, { t } from "elysia";
import { UserService } from "./service";
import {
  userParamsSchema,
  userQuerySchema,
  userModel,
  newUserModel,
  updateUserModel,
} from "./model";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import { ResponseStatus } from "../../common/constant";

export const userEndpoint = new Elysia({ prefix: "/users", tags: ["User"] })
  .get(
    "",
    async ({ query, status }) => {
      const { pagination, users } = await UserService.getUsers(
        query.page,
        query.pageSize,
        query.sortDirection,
      );

      return status(200, {
        status: ResponseStatus.Success,
        data: users,
        pagination,
      });
    },
    {
      query: userQuerySchema,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: t.Array(userModel),
          pagination: t.Object({
            page: t.Number(),
            pageSize: t.Number(),
            totalItems: t.Number(),
            totalPages: t.Number(),
          }),
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .get(
    "/:userId",
    async ({ params, status }) => {
      const user = await UserService.getUser(params.userId);
      if (!user) {
        return status(404, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "userId",
              message: "Pengguna tidak ditemukan",
            },
          ],
        });
      }

      return status(200, {
        status: ResponseStatus.Success,
        data: user,
      });
    },
    {
      params: userParamsSchema,
      response: {
        200: t.Object({
          status: successResponseModel,
          data: userModel,
        }),
        404: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .post(
    "",
    async ({ body, status }) => {
      const created = await UserService.createUser(body);
      if (!created) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Pengguna gagal dibuat",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: created,
      });
    },
    {
      body: newUserModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: userModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  )
  .patch(
    "/:userId",
    async ({ params, body, status }) => {
      const updated = await UserService.updateUser(params.userId, body);
      if (!updated) {
        return status(422, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "",
              message: "Pengguna gagal diperbarui",
            },
          ],
        });
      }

      return status(201, {
        status: ResponseStatus.Success,
        data: updated,
      });
    },
    {
      params: userParamsSchema,
      body: updateUserModel,
      response: {
        201: t.Object({
          status: successResponseModel,
          data: userModel,
        }),
        422: failResponseModel,
        500: errorResponseModel,
      },
    },
  );
