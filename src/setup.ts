// for environment variables type checking and auto completion
declare module "bun" {
  interface Env {
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_URL: string;
    DB_CERT: string;
  }
}
