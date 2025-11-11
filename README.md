# Assessment CCED UNILA Backend

A modern backend API for the Center for Character and Ethics Development (CCED) University of Lampung assessment system. Built with [Elysia](https://elysiajs.com/) web framework and [Bun](https://bun.sh/) runtime for high performance and developer experience.

## Overview

This project is a comprehensive assessment management system that handles:
- **Student Management** - Student profiles and information
- **Test Management** - Creating and managing assessment tests
- **Result Tracking** - Storing and retrieving assessment results
- **User Authentication** - User management and authorization
- **Filtering & Reporting** - Advanced filtering and result analysis

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript/TypeScript runtime
- **Framework**: [Elysia](https://elysiajs.com/) - Simple and ergonomic web framework
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [TypeBox](https://github.com/sinclairr/typebox) - JSON schema validation
- **Logging**: [Pino](https://getpino.io/) - Fast JSON logger
- **Documentation**: OpenAPI 3.0.3 with automatic Swagger UI

## Prerequisites

- [Bun](https://bun.sh/) >= 1.3.0
- PostgreSQL database
- Node.js 18+ (if not using Bun natively)

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assasment-cced-unila-backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   # Generate initial schema
   bun run db:generate
   
   # Apply migrations
   bun run db:migrate
   
   # (Optional) Seed database with sample data
   bun run db:seed
   ```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

The API will be available at `http://localhost:3002`

Visit `http://localhost:3002/docs` to access the interactive API documentation (Swagger UI).

### Build & Production

Build for production:

```bash
bun run build
```

Run the production server:

```bash
bun run start
```

## Available Scripts

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `bun run dev`         | Start development server with hot reload              |
| `bun run build`       | Build the application for production                  |
| `bun run start`       | Start the production server                           |
| `bun run test`        | Run the test suite                                    |
| `bun run db:push`     | Push database schema changes to the database          |
| `bun run db:generate` | Generate migration files from schema changes          |
| `bun run db:migrate`  | Apply pending migrations to the database              |
| `bun run db:seed`     | Seed the database with sample data (development only) |

## Project Structure

```
src/
├── endpoint/              # API endpoints organized by domain
│   ├── filter/           # Filtering endpoints
│   ├── result/           # Result retrieval and analysis
│   ├── student/          # Student management
│   ├── system/           # System-level endpoints
│   ├── test/             # Test/assessment management
│   └── user/             # User authentication and management
├── db/                   # Database layer
│   ├── schema/           # Drizzle ORM schema definitions
│   ├── migrations/       # Generated SQL migrations
│   └── seed.ts           # Database seeding logic
├── middleware/           # Express-style middleware
│   └── errorHandle.ts    # Error handling middleware
├── common/               # Shared utilities and types
├── logger/               # Logging configuration
├── redis/                # Redis cache integration
├── utils/                # Helper functions
├── env.ts                # Environment variable validation
└── index.ts              # Application entry point
```

## API Documentation

The API automatically generates OpenAPI 3.0.3 documentation accessible at:

```
GET /docs
```

This provides an interactive Swagger UI where you can:
- View all available endpoints
- Explore request/response schemas
- Test endpoints directly

## Database

### Schema Management

This project uses Drizzle ORM with PostgreSQL. Schema is defined in `src/db/schema/index.ts`.

### Making Schema Changes

1. **Edit the schema**
   ```bash
   # Update src/db/schema/index.ts
   ```

2. **Generate migration**
   ```bash
   bun run db:generate
   ```
   This creates a new SQL migration file in `src/db/migrations/`

3. **Review and commit**
   ```bash
   git add src/db/migrations/
   git commit -m "chore(db): add migration for schema changes"
   ```

4. **Apply migration locally (optional)**
   ```bash
   bun run db:migrate
   ```

**Important**: Migrations must be committed to Git for CI/CD pipelines to apply them automatically to deployed databases.

### Database Seeding

For development, you can seed the database with sample data:

```bash
bun run db:seed
```

This runs `src/db/seed.ts` which uses [Drizzle Seed](https://orm.drizzle.team/docs/seed) and [Faker](https://fakerjs.dev/) to generate realistic test data.

## Code Conventions

Follow these naming conventions for consistency:

| Purpose                      | Style     | Example         | Suffix | Notes                          |
| ---------------------------- | --------- | --------------- | ------ | ------------------------------ |
| Drizzle Table Definition     | camelCase | usersTable      | Table  | ORM table definition           |
| Validation Schema            | camelCase | createUserSchema | Schema | TypeBox validation schema      |
| Data Transfer Object (Model) | PascalCase| UserDTO         | DTO    | Data sent to/from clients      |
| API Endpoints                | kebab-case| `/api/v1/get-results` | —    | REST API routes               |

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Server
PORT=3002
NODE_ENV=production|development

# Database
DB_URL=postgresql://user:password@localhost:5432/cced_unila

# CORS
ORIGIN=http://localhost:3000

# Logging (optional)
LOG_LEVEL=info
```

## Error Handling

The application includes comprehensive error handling middleware that:
- Catches all uncaught errors
- Returns consistent error responses
- Logs errors with full context using Pino
- Provides detailed information in development mode

## CORS Configuration

CORS is enabled for:
- Frontend origin (from `ORIGIN` env variable)
- Local development (`http://localhost:3002`)

Allowed methods: GET, POST, PATCH, PUT, DELETE
Allowed headers: Content-Type, Authorization

## Logging

Logging is configured with Pino and includes:
- Structured JSON logging in production
- Pretty-printed logs in development
- Request/response logging
- Error tracking with stack traces

## Docker Support

The project includes Docker configuration for containerization:

```bash
# Build Docker image
docker build -t cced-unila-backend .

# Run with docker-compose
docker-compose up
```

## Testing

Run the test suite:

```bash
bun test
```

Tests are located in the `test/` directory.

## Contributing

1. Create a feature branch
2. Make your changes following code conventions
3. If modifying the database schema, generate and commit migrations
4. Run tests to ensure everything works
5. Commit and push your changes
6. Open a pull request

## Performance Features

- **Bun Runtime**: Native TypeScript support, faster startup times
- **Elysia Framework**: Minimal overhead, optimized for speed
- **Drizzle ORM**: Type-safe queries with minimal runtime overhead
- **OpenAPI Caching**: Automatic API documentation generation
- **Hot Reload**: Development server with instant refresh on file changes

## Troubleshooting

### Database Connection Issues
- Verify `DB_URL` is correctly set in `.env`
- Ensure PostgreSQL is running
- Check database credentials and permissions

### Migration Failures
- Review the generated SQL in `src/db/migrations/`
- Ensure the schema file is syntactically correct
- Check database constraints and existing data compatibility

### Port Already in Use
- Change `PORT` in `.env` or use: `PORT=3003 bun run dev`

## License

[Include license information here]

## Contact

**Author**: Muhammad Azka Naufal  
**Email**: mhmdazkanfl@gmail.com

For more information about the CCED UNILA project, please contact the Center for Character and Ethics Development at University of Lampung.

## Resources

- [Elysia Documentation](https://elysiajs.com/)
- [Bun Documentation](https://bun.sh/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeBox Documentation](https://github.com/sinclairr/typebox)
- [Pino Logger Documentation](https://getpino.io/)