import { type Static, type TObject, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const envSchema = Type.Object({
  NODE_ENV: Type.Enum(
    { dev: "development", prod: "production", test: "test" },
    {
      default: "development",
      error: "NODE_ENV must be one of 'development', 'production', or 'test'",
    },
  ),
  ORIGIN: Type.String({
    error: "ORIGIN is not defined in environment variables",
  }),
  PORT: Type.Number({
    minimum: 1,
    maximum: 65535,
    error: "PORT is not defined in environment variables",
  }),

  DB_HOST: Type.String({
    error: "DB_HOST is not defined in environment variables",
  }),
  DB_PORT: Type.Number({
    minimum: 1,
    maximum: 65535,
    error: "DB_PORT is not defined in environment variables",
  }),
  DB_NAME: Type.String({
    error: "DB_NAME is not defined in environment variables",
  }),
  DB_USER: Type.String({
    error: "DB_USER is not defined in environment variables",
  }),
  DB_PASSWORD: Type.String({
    error: "DB_PASSWORD is not defined in environment variables",
  }),
  DB_URL: Type.String({
    error: "DB_URL is not defined in environment variables",
  }),

  REDIS_PORT: Type.Number({
    minimum: 1,
    maximum: 65535,
    error: "REDIS_PORT is not defined in environment variables",
  }),
  REDIS_HOST: Type.String({
    error: "REDIS_HOST is not defined in environment variables",
  }),

  DB_MIGRATING: Type.Boolean({
    default: "false",
    error: `You must set DB_MIGRATING to "true" when running migrations`,
  }),
  DB_SEEDING: Type.Boolean({
    default: "false",
    error: `You must set DB_SEEDING to "true" when running seeds`,
  }),
});

export function parseEnv<T extends TObject>(
  schema: T,
  env: Record<string, string | undefined>,
): Static<T> {
  const cleaned = Object.fromEntries(
    Object.entries(env).filter(([key]) =>
      Object.keys(schema.properties).includes(key),
    ),
  );
  const converted = Value.Convert(schema, Value.Default(schema, cleaned));
  const isValid = Value.Check(schema, converted);
  if (!isValid) {
    const errors = Value.Errors(schema, converted);
    throw new Error(
      `Invalid environment variables: ${[...errors]
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ")}`,
    );
  }

  return converted;
}

declare module "bun" {
  interface Env extends Static<typeof envSchema> {}
}

export const env = parseEnv(envSchema, process.env);
export const isProd = env.NODE_ENV === "production";
