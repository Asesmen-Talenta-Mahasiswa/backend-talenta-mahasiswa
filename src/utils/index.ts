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
