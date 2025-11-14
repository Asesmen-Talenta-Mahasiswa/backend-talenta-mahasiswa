import { randomUUIDv7 } from "bun";
import Elysia, { t } from "elysia";
import { ResponseStatus } from "../../common/constant";
import { errorResponseModel, failResponseModel } from "../../common/model";
import { isProd } from "../../env";
import { csrf } from "../../middleware/csrf";
import { loginModel, loginSsoResponseModel } from "./model";
import { AuthService, authService } from "./service";

export const authEndpoint = new Elysia({
  prefix: "/auth",
  tags: ["Auth"],
})
  .use(
    csrf({
      cookie: {
        secure: isProd ? true : false,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        signed: true,
      },
      value: ({ headers }) => {
        return headers.get("csrf-token");
      },
    }),
  )
  .get("/csrfToken", async ({ csrfToken }) => ({ token: csrfToken() }))

  .use(authService)
  .post("/login", async ({ body }) => {}, { body: loginModel })
  .post(
    "/loginSSO",
    async ({ validToken, status, cookie: { sessionToken }, jwt, server }) => {
      const result = await AuthService.loginSSO(validToken);
      const token = await jwt.sign({
        studentId: result.id,
        userId: result.userId,
        iat: true,
        iss: server?.url.host ?? "backend",
        jti: randomUUIDv7(),
        exp: "24h",
      });

      sessionToken.set({
        value: token,
        secure: isProd ? true : false,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return status(201, {
        status: ResponseStatus.Success,
        data: result,
      });
    },
    {
      sso: true,
      response: {
        201: loginSsoResponseModel,
        401: failResponseModel,
        403: failResponseModel,
        422: failResponseModel,
        500: errorResponseModel,
        503: errorResponseModel,
      },
      detail: {
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      headers: t.Object({
        "csrf-token": t.String(),
      }),
    },
  );
