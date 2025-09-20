// for environment variables type checking and auto completion
declare module "bun" {
  interface Env {
    DB_URL: string;
    DB_CERT: string;
  }
}
