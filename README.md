# Assessment CCED UNILA Backend

A backend API built with Elysia and Bun runtime.

## Development

### How to Continue Developing

1. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd assasment-cced-unila-backend
   bun install
   ```

2. **Start Development**

   ```bash
   bun run dev
   ```

   Open http://localhost:3000/ with your browser to see the result.

3. **Make Changes**
   - The dev server automatically reloads when you save files
   - Follow the coding conventions below
   - Test your changes before committing

### Available Scripts

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Start development server with hot reload       |
| `bun run build`       | Build the application for production           |
| `bun run start`       | Start the production server                    |
| `bun run test`        | Run the test suite                             |
| `bun run db:push`     | Push database schema changes using Drizzle     |
| `bun run db:generate` | Generate database schema changes using Drizzle |
| `bun run db:migrate`  | Migrate database schema changes using Drizzle  |

### Database Schema Changes (IMPORTANT)

If you make changes to the database schema in `src/db/schema.ts`, you must generate and commit a migration so that CI/CD can apply it automatically:

1. Edit `src/db/schema.ts` with your schema changes (eg. add column/table/enum).
2. Generate a migration SQL file:

   ```bash
   bun run db:generate
   ```

   This will create a new migration under the `drizzle/` directory (eg. `drizzle/0001_*.sql`).

3. Review the generated SQL and commit it to Git:

   ```bash
   git add drizzle/*.sql drizzle/meta/*
   git commit -m "chore(db): generate migration for schema changes"
   ```

4. Push your branch and open a PR. The GitHub Actions pipeline will pick up the committed migration file(s) and run `drizzle-kit migrate` against the target database.

Optional (local apply): If you want to apply the migration locally before pushing, run:

```bash
bun run db:migrate
```

Notes:

- Config for Drizzle lives in `drizzle.config.ts` (output dir: `./drizzle`, schema source: `./src/db/schema.ts`).
- CI expects migration SQL files to exist and be committed. If you only change `schema.ts` without generating a migration, CI won’t apply any DB change.
- Environment variables for the database connection must be set (see `.env.example`).

## Coding Convention

| Purpose                 | Naming Style | Example    | Suffix | Notes                                         |
| ----------------------- | ------------ | ---------- | ------ | --------------------------------------------- |
| Drizzle Table           | camelCase    | usersTable | Table  | Represents the DB table (not a schema)        |
| Zod Schema (Validation) | camelCase    | userSchema | Schema | For request validation (insert/update/select) |
| Data Transfer Object    | PascalCase   | UserModel  | Model  | What the client sends & receives              |
