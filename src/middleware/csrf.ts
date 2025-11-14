import Elysia from "elysia";
import crypto from "node:crypto";
import type { FailResponseModel } from "../common/model";
import { ResponseStatus } from "../common/constant";
import { env } from "../env";

// ============================================================================
// Constants
// ============================================================================

const EQUAL_GLOBAL_REGEXP = /=/g;
const PLUS_GLOBAL_REGEXP = /\+/g;
const SLASH_GLOBAL_REGEXP = /\//g;

// ============================================================================
// Token Generation Utilities
// ============================================================================

/**
 * Hash a string with SHA256, returning url-safe base64.
 */
function hash(str: string): string {
  return crypto
    .createHash("sha256")
    .update(str, "ascii")
    .digest("base64")
    .replace(PLUS_GLOBAL_REGEXP, "-")
    .replace(SLASH_GLOBAL_REGEXP, "_")
    .replace(EQUAL_GLOBAL_REGEXP, "");
}

/**
 * Generate a random string of specified length using url-safe base64.
 */
function randomString(length: number): string {
  const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
  return bytes
    .toString("base64")
    .replace(PLUS_GLOBAL_REGEXP, "-")
    .replace(SLASH_GLOBAL_REGEXP, "_")
    .replace(EQUAL_GLOBAL_REGEXP, "")
    .slice(0, length);
}

/**
 * Tokenize a secret and salt using HMAC-like construction.
 */
function tokenize(secret: string, salt: string): string {
  return `${salt}-${hash(`${salt}-${secret}`)}`;
}

/**
 * Verify if a given token is valid for a given secret using constant-time comparison.
 */
function verifyToken(
  secret: string,
  token: string,
  saltLength: number,
): boolean {
  if (
    !secret ||
    typeof secret !== "string" ||
    !token ||
    typeof token !== "string"
  ) {
    return false;
  }

  // Token format: {salt}-{hash}
  if (token.length < saltLength + 1 || token[saltLength] !== "-") {
    return false;
  }

  const salt = token.slice(0, saltLength);
  const expected = tokenize(secret, salt);

  // Constant-time comparison to prevent timing attacks
  if (token.length !== expected.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a cryptographically secure random secret.
 */
function generateSecret(length: number = 18): string {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString("base64")
    .replace(PLUS_GLOBAL_REGEXP, "-")
    .replace(SLASH_GLOBAL_REGEXP, "_")
    .replace(EQUAL_GLOBAL_REGEXP, "");
}

// ============================================================================
// Types
// ============================================================================

type CookieOptions = {
  /** Cookie name for storing CSRF secret */
  key?: string;
  /** Cookie domain */
  domain?: string;
  /** HTTP only flag (recommended: true) */
  httpOnly?: boolean;
  /** Max age in seconds */
  maxAge?: number;
  /** Cookie path */
  path?: string;
  /** SameSite policy (recommended: 'strict' or 'lax') */
  sameSite?: "lax" | "none" | "strict" | boolean;
  /** Secure flag (recommended: true in production) */
  secure?: boolean;
  /** Use signed cookies */
  signed?: boolean;
};

export type CsrfOptions = {
  /**
   * Cookie configuration for CSRF secret storage.
   * Set to true to enable with defaults, or provide custom options.
   * @default false
   */
  cookie?: boolean | CookieOptions;

  /**
   * HTTP methods to ignore (skip CSRF validation).
   * @default ["GET", "HEAD", "OPTIONS"]
   */
  ignoreMethods?: string[];

  /**
   * Custom function to extract CSRF token from request.
   * By default, checks body._csrf, query._csrf, and various headers.
   */
  value?: (context: any) => string | undefined;

  /**
   * Length of the salt used in token generation.
   * @default 8
   */
  saltLength?: number;

  /**
   * Length of the secret used in token generation.
   * @default 18
   */
  secretLength?: number;

  /**
   * Custom error message for invalid CSRF token.
   * @default "Invalid CSRF token"
   */
  errorMessage?: string;

  /**
   * Custom status code for CSRF validation failure.
   * @default 403
   */
  errorStatus?: number;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Default token extraction function supporting multiple sources.
 */
function defaultValue(context: any): string | undefined {
  const { body, query, headers } = context;

  return (
    body?._csrf ||
    query?._csrf ||
    headers["csrf-token"] ||
    headers["xsrf-token"] ||
    headers["x-csrf-token"] ||
    headers["x-xsrf-token"]
  );
}

/**
 * Get cookie options with secure defaults.
 */
function getCookieOptions(
  options: boolean | CookieOptions | undefined,
): CookieOptions | undefined {
  if (options !== true && typeof options !== "object") {
    return undefined;
  }

  const defaults: CookieOptions = {
    key: "_csrf",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  };

  return typeof options === "object" ? { ...defaults, ...options } : defaults;
}

/**
 * Create a lookup object for ignored methods (case-insensitive).
 */
function getIgnoredMethods(methods: string[]): Record<string, true> {
  return methods.reduce(
    (acc, method) => {
      acc[method.toUpperCase()] = true;
      return acc;
    },
    {} as Record<string, true>,
  );
}

/**
 * Apply cookie attributes to an Elysia cookie object.
 */
function applyCookieAttributes(cookieObj: any, config: CookieOptions): void {
  if (config.path !== undefined) cookieObj.path = config.path;
  if (config.httpOnly !== undefined) cookieObj.httpOnly = config.httpOnly;
  if (config.sameSite !== undefined) cookieObj.sameSite = config.sameSite;
  if (config.secure !== undefined) cookieObj.secure = config.secure;
  if (config.maxAge !== undefined) cookieObj.maxAge = config.maxAge;
  if (config.domain !== undefined) cookieObj.domain = config.domain;
}

function getOriginFromReferer(referer: string) {
  try {
    return new URL(referer).origin;
  } catch (e) {
    return null;
  }
}

// ============================================================================
// CSRF Plugin
// ============================================================================

/**
 * CSRF Protection Plugin for Elysia
 *
 * Provides protection against Cross-Site Request Forgery attacks using
 * the synchronizer token pattern with secure token generation and validation.
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { csrf } from './middleware/csrf'
 *
 * const app = new Elysia()
 *   .use(csrf({ cookie: true }))
 *   .get('/form', ({ csrfToken }) => {
 *     return `<form><input name="_csrf" value="${csrfToken()}"></form>`
 *   })
 *   .post('/submit', () => 'Success!')
 *   .listen(3000)
 * ```
 */
export const csrf = (options: CsrfOptions = {}) => {
  // Configuration
  const cookieConfig = getCookieOptions(options.cookie);
  const saltLength = options.saltLength ?? 8;
  const secretLength = options.secretLength ?? 18;
  const ignoreMethods = options.ignoreMethods ?? ["GET", "HEAD", "OPTIONS"];
  const ignoreMethod = getIgnoredMethods(ignoreMethods);
  const getValue = options.value ?? defaultValue;
  const errorMessage = options.errorMessage ?? "Invalid CSRF token";
  const errorStatus = options.errorStatus ?? 403;

  const cookieKey = cookieConfig?.key ?? "_csrf";

  return new Elysia({
    name: "csrf",
    seed: options,
  })
    .derive({ as: "scoped" }, ({ cookie }) => {
      /**
       * Get or create CSRF secret from cookie.
       * Generates a new secret if one doesn't exist.
       */
      const getOrCreateSecret = (): string => {
        if (!cookieConfig) {
          throw new Error("CSRF: Cookie storage must be enabled");
        }

        const cookieObj = cookie[cookieKey] as any;
        let secret = cookieObj.value ? String(cookieObj.value) : undefined;

        // Generate new secret if needed
        if (!secret) {
          secret = generateSecret(secretLength);
          cookieObj.value = secret;
          applyCookieAttributes(cookieObj, cookieConfig);
        }

        return secret;
      };

      /**
       * Generate a new CSRF token.
       * Each call generates a unique token with a new salt for the same secret.
       * @returns A CSRF token string to be included in forms or headers
       */
      const csrfToken = (): string => {
        const secret = getOrCreateSecret();
        const salt = randomString(saltLength);
        return tokenize(secret, salt);
      };

      return { csrfToken };
    })
    .onBeforeHandle(
      { as: "scoped" },
      ({ request, cookie, body, query, status, server }) => {
        const method = request.method.toUpperCase();

        // Skip validation for safe methods
        if (ignoreMethod[method]) {
          return;
        }

        const origin = request.headers.get("origin");
        const referer = request.headers.get("referer");

        // Allowed origins
        const allowedOrigins = [env.ORIGIN, server?.url.origin].filter(Boolean);

        // If Origin header is present, validate it
        if (origin) {
          if (!allowedOrigins.includes(origin)) {
            return status(errorStatus, {
              status: ResponseStatus.Fail,
              data: [
                {
                  field: "origin",
                  message: "Origin tidak diperbolehkan",
                },
              ],
            } satisfies FailResponseModel);
          }
        } else if (referer) {
          const refererOrigin = getOriginFromReferer(referer);
          if (!refererOrigin || !allowedOrigins.includes(refererOrigin)) {
            return status(errorStatus, {
              status: ResponseStatus.Fail,
              data: [
                {
                  field: "origin",
                  message: "Origin tidak diperbolehkan",
                },
              ],
            } satisfies FailResponseModel);
          }
        }

        // Ensure cookie config is enabled
        if (!cookieConfig) {
          return status(errorStatus, {
            status: ResponseStatus.Fail,
            data: [
              {
                field: "csrf-token",
                message: errorMessage,
              },
            ],
          } satisfies FailResponseModel);
        }

        // Get secret from cookie
        const cookieObj = cookie[cookieKey] as any;
        const secret = cookieObj.value ? String(cookieObj.value) : undefined;

        if (!secret) {
          return status(errorStatus, {
            status: ResponseStatus.Fail,
            data: [
              {
                field: "csrf-token",
                message: errorMessage,
              },
            ],
          } satisfies FailResponseModel);
        }

        // Extract token from request
        const tokenValue = getValue({
          body,
          query,
          headers: request.headers,
          cookie,
          request,
        });

        if (!tokenValue) {
          return status(errorStatus, {
            status: ResponseStatus.Fail,
            data: [
              {
                field: "csrf-token",
                message: errorMessage,
              },
            ],
          } satisfies FailResponseModel);
        }

        // Verify token validity
        if (!verifyToken(secret, tokenValue, saltLength)) {
          return status(errorStatus, {
            status: ResponseStatus.Fail,
            data: [
              {
                field: "csrf-token",
                message: errorMessage,
              },
            ],
          } satisfies FailResponseModel);
        }

        // Token is valid, continue to handler
      },
    );
};
