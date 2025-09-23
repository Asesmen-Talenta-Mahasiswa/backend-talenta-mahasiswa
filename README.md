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

## Coding Convention

| Purpose                 | Naming Style | Example    | Suffix | Notes                                         |
| ----------------------- | ------------ | ---------- | ------ | --------------------------------------------- |
| Drizzle Table           | camelCase    | usersTable | Table  | Represents the DB table (not a schema)        |
| Zod Schema (Validation) | camelCase    | userSchema | Schema | For request validation (insert/update/select) |
| Data Transfer Object    | PascalCase   | UserModel  | Model  | What the client sends & receives              |
