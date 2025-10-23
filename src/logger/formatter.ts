import { StatusMap } from "elysia";
import picocolors from "picocolors";

const TIME_UNITS = { ns: "ns", us: "µs", ms: "ms", s: "s" } as const;

export function formatDuration(nsBigInt: bigint): string {
  const thousand = 1000n;
  const million = 1_000_000n;
  const billion = 1_000_000_000n;

  if (nsBigInt >= billion) {
    const seconds = Number(nsBigInt) / 1_000_000_000;
    return picocolors.dim("[" + seconds.toFixed(0) + TIME_UNITS.s + "]");
  } else if (nsBigInt >= million) {
    const ms = Number(nsBigInt) / 1_000_000;
    return picocolors.dim("[" + ms.toFixed(0) + TIME_UNITS.ms + "]");
  } else if (nsBigInt >= thousand) {
    const µs = Number(nsBigInt) / 1_000;
    return picocolors.dim("[" + µs.toFixed(0) + TIME_UNITS.us + "]");
  } else {
    return picocolors.dim("[" + nsBigInt + TIME_UNITS.ns + "]");
  }
}

export function formatStatusCode(
  status: number | keyof StatusMap | undefined,
  defaultStatusCode: number
): number {
  if (!status) return defaultStatusCode;

  if (typeof status === "number") {
    return status;
  }

  return (StatusMap as Record<string, number>)[status];
}

export function formatColorStatusCode(status: number): string {
  if (status >= 500) {
    return picocolors.red(picocolors.bold(status));
  } else if (status >= 400) {
    return picocolors.yellow(status);
  } else {
    return picocolors.green(status);
  }
}

const ResponseSymbol = {
  SUCCESS: "✔",
  ERROR: "✖",
  FAIL: "!",
  REDIRECT: "➜",
} as const;

export function formatSymbol(statusCode: number): string {
  if (statusCode >= 500) {
    // Server error
    return picocolors.red(ResponseSymbol.ERROR);
  } else if (statusCode >= 400) {
    // Client error
    return picocolors.yellow(picocolors.bold(ResponseSymbol.FAIL));
  } else if (statusCode >= 300) {
    // Redirection
    return picocolors.cyan(ResponseSymbol.REDIRECT);
  } else {
    // Success
    return picocolors.green(ResponseSymbol.SUCCESS);
  }
}

export function formatMethod(method: string): string {
  switch (method) {
    case "GET":
      return picocolors.cyan(picocolors.bold(method)); // safe/read
    case "POST":
      return picocolors.green(picocolors.bold(method)); // create
    case "PUT":
      return picocolors.yellow(picocolors.bold(method)); // update/replace
    case "PATCH":
      return picocolors.magenta(picocolors.bold(method)); // partial update
    case "DELETE":
      return picocolors.red(picocolors.bold(method)); // destructive
    case "OPTIONS":
      return picocolors.gray(picocolors.bold(method)); // preflight / metadata
    case "HEAD":
      return picocolors.dim(picocolors.bold(method)); // silent GET
    case "CONNECT":
      return picocolors.blue(picocolors.bold(method)); // tunnel
    case "TRACE":
      return picocolors.white(picocolors.bold(method)); // diagnostic
    default:
      return picocolors.white(picocolors.bold(method));
  }
}

const two = (n: number) => (n < 10 ? "0" + n : "" + n);
export function formatTimestamp(time: Date): string {
  // Build manually, avoids template literals and padStart overhead
  let out = "";
  out += time.getFullYear();
  out += "-";
  out += two(time.getMonth() + 1);
  out += "-";
  out += two(time.getDate());
  out += " ";
  out += two(time.getHours());
  out += ":";
  out += two(time.getMinutes());
  out += ":";
  out += two(time.getSeconds());

  return picocolors.inverse(" " + out + " ");
}

export function formatPath(path: string): string {
  return picocolors.white(path);
}
