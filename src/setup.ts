// for environment variables type checking
declare module "bun" {
  interface Env {
    DB_URL: string;
  }
}
