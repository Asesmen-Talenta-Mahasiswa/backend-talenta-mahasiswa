import { Degree, Faculty, Program } from "../common/enum";
import { NewStudentModel } from "../feature/student/model";
import { fakerID_ID as faker } from "@faker-js/faker";

/**
 * Convert a TypeScript (string) enum or a plain readonly object into a non-empty tuple
 * of its values suitable for Drizzle ORM's `pgEnum` helper.
 *
 * Drizzle's `pgEnum(name, values)` expects a tuple type like `["A", "B", ...]` rather
 * than a plain `string[]` so that the literal types of the enum values are preserved.
 * This utility abstracts the boilerplate of manually writing that tuple.
 *
 * Reference & discussion of the approach:
 * https://github.com/drizzle-team/drizzle-orm/discussions/1914#discussioncomment-9600199
 *
 * Example (string enum):
 * enum Faculty {
 *   FISIP = "FISIP",
 *   FEB = "FEB",
 * }
 * export const facultyEnum = pgEnum("faculty_enum", enumToPgEnum(Faculty));
 *
 * Example (const object):
 * export const Degree = {
 *   D3: "D3",
 *   D4: "D4",
 *   S1: "S1",
 * } as const;
 * export const degreeEnum = pgEnum("degree_enum", enumToPgEnum(Degree));
 *
 * Returned type is asserted as `[T[keyof T], ...T[keyof T][]]` (a non-empty tuple) so Drizzle
 * can infer the literal union of the values for stronger type safety downstream.
 *
 * Caveats:
 * - For numeric enums, TypeScript emits a reverse mapping causing `Object.values` to contain
 *   both numeric and string members; this helper is intended for string enums or const objects.
 * - If you pass a numeric enum, you'll get duplicate stringified values. Filter or convert
 *   beforehand if needed.
 * - The function stringifies each value to be defensive if values are numbers or symbols.
 *
 * @param myEnum A string enum or `as const` object whose values will become the pg enum variants.
 * @returns A non-empty tuple of string literal values accepted by Drizzle's `pgEnum`.
 */
export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  // NOTE: We assume caller supplies a string enum / const object; cast preserves literal types.
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}

/**
 * A strongly-typed wrapper around `Object.values`.
 *
 * Unlike the built-in `Object.values`, which returns `any[]` (or `unknown[]`),
 * this helper preserves the value union type of the input record so the result
 * is typed as `T[keyof T][]`.
 *
 * Example:
 * const Status = { active: "active", disabled: "disabled" } as const;
 * const values = objectValues(Status); // typed as ("active" | "disabled")[]
 *
 * @param obj Object whose enumerable own property values to return.
 * @returns An array of values with type `T[keyof T][]`.
 */
export const objectValues = <T extends Record<string, unknown>>(obj: T) =>
  Object.values(obj) as T[keyof T][];

/**
 * Generate a random username that:
 * - is exactly 8 characters long
 * - contains at least 1 underscore `_`
 * - contains at least 1 uppercase letter `[A-Z]`
 * - contains at least 1 lowercase letter `[a-z]`
 *
 * The remaining characters are drawn from the set `[A-Za-z_]`.
 *
 * Example output: "aB_cdEfG", "Zx_yZabC"
 */
export function generateRandomUsername(): string {
  const length = 8;
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UNDERSCORE = "_";
  const ALL = UPPER + LOWER + UNDERSCORE;

  const pick = (pool: string) => pool[Math.floor(Math.random() * pool.length)];

  // Ensure required character categories are present
  const required = [pick(UPPER), pick(LOWER), UNDERSCORE];

  const result: string[] = new Array(length);
  const used = new Set<number>();
  while (used.size < required.length) {
    used.add(Math.floor(Math.random() * length));
  }
  let i = 0;
  for (const pos of used) {
    result[pos] = required[i++];
  }

  // Fill remaining positions
  for (let idx = 0; idx < length; idx++) {
    if (!result[idx]) {
      result[idx] = pick(ALL);
    }
  }

  return result.join("");
}
