import { describe, expect, mock, test } from "bun:test";

// Mock drizzle-orm for buildConflictUpdateColumns
mock.module("drizzle-orm", () => ({
  getTableColumns: (_table: any) => ({
    id: { name: "id_col" },
    name: { name: "name_col" },
    email: { name: "email_col" },
  }),
  sql: {
    raw: (s: string) => ({ raw: s }),
  },
}));

import {
  enumToPgEnum,
  objectValues,
  generateRandomUsername,
  cleanFalsyArray,
  buildConflictUpdateColumns,
  enumValuesAsNonEmptyTuple,
  hasAnyValue,
} from "../utils";

describe("src/utils/index.ts", () => {
  test("enumToPgEnum works with string enum", () => {
    enum Faculty {
      FISIP = "FISIP",
      FEB = "FEB",
      FT = "FT",
    }
    const vals = enumToPgEnum(Faculty);
    expect(vals as unknown as string[]).toEqual(["FISIP", "FEB", "FT"]);
  });

  test("enumToPgEnum works with const object", () => {
    const Degree = {
      D3: "D3",
      D4: "D4",
      S1: "S1",
    } as const;

    const vals = enumToPgEnum(Degree);
    expect(vals).toEqual(["D3", "D4", "S1"]);
  });

  test("objectValues preserves order and values", () => {
    const Status = {
      active: "active",
      disabled: "disabled",
      archived: "archived",
    } as const;
    const vals = objectValues(Status);
    expect(vals).toEqual(["active", "disabled", "archived"]);
  });

  test("generateRandomUsername meets all constraints", () => {
    const runs = 100;
    for (let i = 0; i < runs; i++) {
      const u = generateRandomUsername();
      expect(u).toHaveLength(8);
      expect(u.includes("_")).toBeTrue();
      expect(/[A-Z]/.test(u)).toBeTrue();
      expect(/[a-z]/.test(u)).toBeTrue();
      expect(/^[A-Za-z_]{8}$/.test(u)).toBeTrue();
    }
  });

  test("cleanFalsyArray filters falsy values and handles undefined", () => {
    expect(
      cleanFalsyArray<number | string>([1, 0, 2, null, undefined, false, "", "a"])
    ).toEqual([1, 2, "a"]);
    expect(cleanFalsyArray()).toEqual([]);
  });

  test("buildConflictUpdateColumns maps to excluded.<colName>", () => {
    const fakeTable: any = { _: { columns: { id: {}, name: {}, email: {} } } };
    const result = buildConflictUpdateColumns(fakeTable, ["id", "name"] as any);

    expect(Object.keys(result)).toEqual(["id", "name"]);
    expect((result["id"] as any).raw).toBe("excluded.id_col");
    expect((result["name"] as any).raw).toBe("excluded.name_col");
  });

  test("enumValuesAsNonEmptyTuple returns values for non-empty object", () => {
    const Obj = { A: "A", B: "B" } as const;
    const vals = enumValuesAsNonEmptyTuple(Obj);
    expect(vals as unknown as string[]).toEqual(["A", "B"]);
  });

  test("enumValuesAsNonEmptyTuple throws for empty object", () => {
    expect(() => enumValuesAsNonEmptyTuple({} as any)).toThrow(
      "enum object must have at least one value"
    );
  });

  test("hasAnyValue returns true if any key is not null/undefined", () => {
    expect(hasAnyValue({})).toBeFalse();
    expect(hasAnyValue({ a: undefined, b: null })).toBeFalse();
    expect(hasAnyValue({ a: 0 })).toBeTrue();
    expect(hasAnyValue({ a: "" })).toBeTrue();
    expect(hasAnyValue({ a: false })).toBeTrue();
    expect(hasAnyValue({ a: undefined, b: "x" })).toBeTrue();
  });
});
