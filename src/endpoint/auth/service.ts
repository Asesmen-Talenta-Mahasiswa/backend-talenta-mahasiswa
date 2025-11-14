import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import Elysia, { env, status } from "elysia";
import { ResponseStatus, UserRole } from "../../common/constant";
import { type FailResponseModel } from "../../common/model";
import db, { Transaction } from "../../db";
import { StudentService } from "../student/service";
import { SystemService } from "../system/service";
import type {
  JwtSsoClaimModel,
  LoginOneDataModel,
  LoginOneDataResponseModel,
  StudentDetailOneDataResponseModel,
} from "./model";
import { jwtClaimModel, sessionTokenModel } from "./model";
import { institution, user as userTable } from "../../db/schema";
import { createHmac, timingSafeEqual } from "crypto";
import { MyLogger } from "../../middleware/logger";
import { toProperCase } from "../../utils";
import { inArray, eq } from "drizzle-orm";
import { UserService } from "../user/service";

export abstract class AuthService {
  // private static verifyOneDataJwtToken(token: string) {
  //   try {
  //     const parts = token.split(".");
  //     if (parts.length !== 3) return false;

  //     const payload = parts[1];
  //     const json = Buffer.from(payload, "base64").toString("utf8");
  //     const decodedPayload = JSON.parse(json);

  //     const tokenExpireTime = decodedPayload.token_kadarluwasa ?? 0;
  //     const currentTime = Math.floor(Date.now() / 1000);
  //     const tokenExpired = currentTime >= tokenExpireTime;

  //     return !tokenExpired;
  //   } catch {
  //     return false;
  //   }
  // }
  private static async checkTokenOneDataAPI(token: string) {
    try {
      const url = `${env.ONEDATA_URL}/auth/cek_token`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_bearer: token,
        }),
      });

      if (!res.ok) {
        throw res;
      }

      const data = (await res.json()) as LoginOneDataResponseModel;

      if (data.data.token_status === "Aktif") {
        return true;
      }
      return false;
    } catch (error) {
      MyLogger.error("one data", error);
      return false;
    }
  }

  private static async loginOneDataAPI() {
    try {
      const url = `${env.ONEDATA_URL}/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_aplikasi: env.APP_ID,
          username: env.APP_USERNAME,
          password: env.APP_PASSWORD,
        } satisfies LoginOneDataModel),
      });

      if (!res.ok) {
        throw res;
      }

      const data = (await res.json()) as LoginOneDataResponseModel;

      return data.data.token_bearer;
    } catch (error) {
      MyLogger.error("one data", error);
      return null;
    }
  }

  private static async getStudentDetailOneDataAPI(token: string, id: string) {
    try {
      const url = `${env.ONEDATA_URL}/mahasiswa/detail?id_peserta_didik=${id}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: token },
      });

      if (!res.ok) {
        throw res;
      }

      const data = (await res.json()) as StudentDetailOneDataResponseModel;

      return data.data[0];
    } catch (error) {
      MyLogger.error("one data", error);
      return null;
    }
  }

  private static oneDataTokenCache: {
    token: string | null;
    expiresAt: number;
  } = {
    token: null,
    expiresAt: 0,
  };

  private static async getOrRefreshOneDataToken(): Promise<string | null> {
    const now = Date.now();

    // Return cached token if still valid
    if (
      this.oneDataTokenCache.token &&
      now < this.oneDataTokenCache.expiresAt
    ) {
      return this.oneDataTokenCache.token;
    }

    // Token expired or doesn't exist - get new one
    const token = await this.loginOneDataAPI();

    if (token) {
      // Cache for 50 minutes (1h token lifetime)
      this.oneDataTokenCache = {
        token,
        expiresAt: now + 50 * 60 * 1000,
      };
    }

    return token;
  }

  static async loginSSO(token: JwtSsoClaimModel) {
    try {
      // Early return if student already exists
      const student = await StudentService.getStudent(token.username);
      if (student) {
        return student;
      }

      // Helper function to create or get user account
      const getOrCreateUser = async (npm: string, tx: Transaction) => {
        // Check if user exists
        const existingUser = await db.query.user.findFirst({
          where: eq(userTable.username, npm),
        });

        if (existingUser) {
          return existingUser;
        }

        // Create new user with NPM as username and a default password
        const hashedPassword = await Bun.password.hash(npm); // Use NPM as default password
        const [newUser] = await tx
          .insert(userTable)
          .values({
            username: npm,
            password: hashedPassword,
            role: UserRole.Student,
          })
          .returning();

        return newUser;
      };

      // Helper function to create empty student with defaults
      const createDefaultStudent = async () => {
        const firstTwoNPM = token.username.slice(0, 2);
        return await db.transaction(async (tx) => {
          const user = await getOrCreateUser(token.username, tx);

          return await StudentService.createEmptyStudent(
            {
              npm: token.username,
              name: token.nm_pengguna
                ? toProperCase(token.nm_pengguna)
                : "unknown",
              degree: "unknown",
              gender: "unknown",
              email: token.email,
              enrollmentYear: "20" + firstTwoNPM,
              userId: user.id,
              departmentId: 1,
              facultyId: 1,
              majorId: 1,
            },
            tx,
          );
        });
      };

      // Attempt to get OneData token - removed redundant null check
      const oneDataToken = await this.getOrRefreshOneDataToken();

      // If OneData API is down, create default student
      if (!oneDataToken) {
        return await createDefaultStudent();
      }

      // Fetch student details from OneData API
      const studentDetailOneData = await this.getStudentDetailOneDataAPI(
        oneDataToken,
        token.id_pd_pengguna ?? "",
      );

      // If student detail is unavailable, create default student
      if (!studentDetailOneData) {
        return await createDefaultStudent();
      }

      const targetId = studentDetailOneData.id_sms;

      // Optimized: Single query to get institution data and referenced institutions
      // Get the main institution row first to extract reference IDs
      const mainInstitution = await db.query.institution.findFirst({
        where: (col, { eq }) => eq(col.id_sms, targetId),
        columns: {
          id_fak_unila: true,
          id_jur_unila: true,
        },
      });

      if (!mainInstitution) {
        return await createDefaultStudent();
      }

      // Single optimized query: fetch all relevant institutions in one go
      const institutionIds = [
        targetId,
        mainInstitution.id_fak_unila,
        mainInstitution.id_jur_unila,
      ].filter((id): id is string => id !== null && id !== undefined);

      const result = await db
        .select({
          id_sms: institution.id_sms,
          id_jns_sms: institution.id_jns_sms,
          nm_lemb: institution.nm_lemb,
          nm_jenj_didik: institution.nm_jenj_didik,
        })
        .from(institution)
        .where(inArray(institution.id_sms, institutionIds));

      // Sort and extract institutions by type
      const sortedResult = result
        .filter((r) => r.id_jns_sms !== null && r.id_jns_sms !== undefined)
        .sort((a, b) => Number(a.id_jns_sms) - Number(b.id_jns_sms));

      const [fac, dep, maj] = sortedResult;

      // Extract student info with safe defaults
      const studentInfo = {
        faculty: fac?.nm_lemb || "Other",
        department: dep?.nm_lemb || "Other",
        major: {
          degree: maj?.nm_jenj_didik || "unknown",
          name: maj?.nm_lemb || "Other",
        },
      };

      // Parallel lookup of faculty, department, and major IDs
      const [major, department, faculty] = await Promise.all([
        db.query.major.findFirst({
          where: (col, { eq }) => eq(col.name, studentInfo.major.name),
          columns: { id: true },
        }),
        db.query.department.findFirst({
          where: (col, { eq }) => eq(col.name, studentInfo.department),
          columns: { id: true },
        }),
        db.query.faculty.findFirst({
          where: (col, { eq }) => eq(col.name, studentInfo.faculty),
          columns: { id: true },
        }),
      ]);

      // Create student with enriched data
      const firstTwoNPM = token.username.slice(0, 2);
      return await db.transaction(async (tx) => {
        const user = await getOrCreateUser(token.username, tx);

        return await StudentService.createEmptyStudent(
          {
            npm: token.username,
            name: token.nm_pengguna ? toProperCase(token.nm_pengguna) : "",
            degree: studentInfo.major.degree,
            gender: studentDetailOneData.jk === "L" ? "male" : "female",
            email: token.email,
            enrollmentYear: "20" + firstTwoNPM,
            userId: user.id,
            departmentId: department?.id || 1,
            facultyId: faculty?.id || 1,
            majorId: major?.id || 1,
          },
          tx,
        );
      });
    } catch (error) {
      SystemService.errorHandle(error);
    }
  }
}

function base64urlToBase64(s: string): string {
  if (!s) return s;
  let b = s.replace(/-/g, "+").replace(/_/g, "/").replace(/ /g, "+");
  while (b.length % 4 !== 0) b += "=";
  return b;
}

function decodeBase64ToUtf8(part: string, label = "part"): string {
  try {
    const std = base64urlToBase64(part);
    return Buffer.from(std, "base64").toString("utf8");
  } catch {
    throw status(401, {
      status: ResponseStatus.Fail,
      data: [
        {
          field: "authorization",
          message: `Token tidak valid, tidak dapat decode ${label}`,
        },
      ],
    } satisfies FailResponseModel);
  }
}

export const authService = new Elysia({
  name: "service/auth",
  cookie: {
    secrets: [
      env.COOKIE_SECRET_ONE,
      env.COOKIE_SECRET_TWO,
      env.COOKIE_SECRET_THREE,
    ],
    sign: ["sessionToken"],
  },
})
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      alg: "HS256",
      schema: jwtClaimModel,
    }),
  )
  .use(bearer())
  .macro("sso", {
    resolve: async ({ bearer, status }) => {
      if (!bearer) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Bearer token SSO tidak boleh kosong",
            },
          ],
        } satisfies FailResponseModel);
      }

      const tokenParts = bearer.split(".");

      if (tokenParts.length !== 3) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Bearer token SSO tidak valid, format token salah",
            },
          ],
        } satisfies FailResponseModel);
      }

      const [hPart, pPart, sigPart] = tokenParts;

      // decode header & payload (PHP used base64_decode)
      const headerRaw = decodeBase64ToUtf8(hPart, "header");
      const payloadRaw = decodeBase64ToUtf8(pPart, "payload");

      // parse payload JSON
      let payloadObj: unknown;
      try {
        payloadObj = JSON.parse(payloadRaw);
      } catch {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Token tidak valid, payload tidak dapat di-decode",
            },
          ],
        } satisfies FailResponseModel);
      }

      if (typeof payloadObj !== "object" || payloadObj === null) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Token tidak valid, payload bukan object",
            },
          ],
        } satisfies FailResponseModel);
      }

      const payload = payloadObj as Record<string, unknown>;

      // required claims - same order/names as your PHP code
      const required_claims = [
        "id_aplikasi",
        "url_aplikasi",
        "id_pengguna",
        "username",
        "nm_pengguna",
        "peran_pengguna",
        "id_sdm_pengguna",
        "id_pd_pengguna",
        "email",
        "token_dibuat",
        "token_kadarluwasa",
        "asal_domain",
        "ip_address",
        "sso",
      ];

      for (const c of required_claims) {
        if (!Object.prototype.hasOwnProperty.call(payload, c)) {
          return status(401, {
            status: ResponseStatus.Fail,
            data: [
              {
                field: "authorization",
                message: `Token tidak valid, klaim hilang: ${c}`,
              },
            ],
          } satisfies FailResponseModel);
        }
      }

      // expiration check (token_kadarluwasa expected to be a UNIX timestamp in seconds)
      const expirationRaw = payload["token_kadarluwasa"];
      const expiration =
        typeof expirationRaw === "number"
          ? expirationRaw
          : Number(expirationRaw);
      if (!Number.isFinite(expiration)) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "token_kadarluwasa tidak valid",
            },
          ],
        } satisfies FailResponseModel);
      }

      const nowSec = Math.floor(Date.now() / 1000);
      if (expiration - nowSec < 0) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Token kedaluwarsa",
            },
          ],
        } satisfies FailResponseModel);
      }

      // Recreate PHP's signature procedure:
      // PHP did: base64_encode($header) and base64_encode($payload) (standard base64),
      // then hash_hmac(..., true) and base64_encode(signature)
      const base64_url_header = Buffer.from(headerRaw, "utf8").toString(
        "base64",
      );
      const base64_url_payload = Buffer.from(payloadRaw, "utf8").toString(
        "base64",
      );

      const hmac = createHmac("sha256", env.JWT_SSO_SECRET)
        .update(`${base64_url_header}.${base64_url_payload}`)
        .digest(); // Buffer (raw binary, like PHP's hash_hmac(..., true))

      const computedBase64Signature = hmac.toString("base64"); // standard base64, same as PHP base64_encode

      // Normalize provided signature to standard base64
      const providedStdBase64 = base64urlToBase64(sigPart.replace(/ /g, "+"));

      // timing-safe compare (must compare buffers of equal length)
      const a = Buffer.from(computedBase64Signature, "utf8");
      const b = Buffer.from(providedStdBase64, "utf8");

      let isSignatureValid = false;
      if (a.length === b.length) {
        try {
          isSignatureValid = timingSafeEqual(a, b);
        } catch {
          isSignatureValid = false;
        }
      } else {
        // lengths differ -> not valid
        isSignatureValid = false;
      }

      if (!isSignatureValid) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Tanda tangan token tidak sah",
            },
          ],
        } satisfies FailResponseModel);
      }

      // success — return typed payload
      return {
        validToken: payload as JwtSsoClaimModel,
      };
    },
  })
  .macro("auth", {
    cookie: sessionTokenModel,
    resolve: async ({ cookie: { sessionToken }, jwt }) => {
      if (!sessionToken) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Token sesi tidak ditemukan",
            },
          ],
        } satisfies FailResponseModel);
      }

      const tokenValid = await jwt.verify(sessionToken.value, {
        algorithms: ["HS256"],
        requiredClaims: ["studentId", "userId", "iat", "iss", "jti", "exp"],
      });
      if (!tokenValid) {
        return status(401, {
          status: ResponseStatus.Fail,
          data: [
            {
              field: "authorization",
              message: "Token sesi tidak valid",
            },
          ],
        } satisfies FailResponseModel);
      }

      const decoded = (({ exp, iat, iss, jti, nbf, sub, aud, ...rest }) =>
        rest)(tokenValid);

      return {
        userInfo: {
          userId: decoded.userId,
          studentId: decoded.studentId,
        },
      };
    },
  });
