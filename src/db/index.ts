import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import {
  drizzle,
  type PostgresJsDatabase,
  type PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import { createSchemaFactory } from "drizzle-typebox";
import { t } from "elysia";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

const client = postgres(env.DB_URL, {
  prepare: false,
  max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
  onnotice: env.DB_SEEDING ? () => {} : undefined,
});

const db = drizzle(client, { logger: false, schema });

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ typeboxInstance: t });

export type Database = PostgresJsDatabase<typeof schema> & {
  $client: typeof client;
};
export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export default db;
