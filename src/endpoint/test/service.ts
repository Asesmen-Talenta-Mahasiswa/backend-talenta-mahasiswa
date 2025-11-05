import db from "../../db";
import { DatabaseService } from "../../db/service";
import { InternalServerError } from "elysia";
import {
  TransactionRollbackError,
  and,
  eq,
  ilike,
  inArray,
  isNull,
} from "drizzle-orm";
import type {
  NewTestBodyModel,
  NewTestQuestionOptionModel,
  TestInstructionModel,
  TestNoteModel,
  TestQuestionModel,
  TestQuestionOptionModel,
  UpdateTestBodyModel,
} from "./model";
import testTable from "../../db/schema/test";
import testInstructionTable from "../../db/schema/testInstruction";
import testNoteTable from "../../db/schema/testNote";
import testQuestionTable from "../../db/schema/testQuestion";
import testQuestionOptionTable from "../../db/schema/testQuestionOption";

export abstract class TestService {
  static async getTests(
    page = 1,
    pageSize = 10,
    search = "",
    showSubTest = false,
    sort = "desc",
  ) {
    try {
      const whereClause = and(
        search ? ilike(testTable.name, `%${search}%`) : undefined,
        !showSubTest ? isNull(testTable.parentId) : undefined,
      );

      const tests = await db.query.test.findMany({
        where: whereClause,
        orderBy: (column, { desc, asc }) => [
          sort === "desc" ? desc(column.id) : asc(column.id),
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const totalItems = await db.$count(testTable);
      const totalPages =
        pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

      return {
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
        tests,
      };
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTest(testId: number) {
    try {
      const test = await db.query.test.findFirst({
        with: {
          instructions: true,
          notes: true,
          questions: {
            with: {
              options: true,
            },
          },
          children: true,
        },
        where: (column, { eq }) => eq(column.id, testId),
      });
      return test;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTestInstructions(testId: number) {
    try {
      const instructions = await db.query.test.findFirst({
        columns: {},
        with: {
          instructions: true,
        },
        where: (column, { eq }) => eq(column.id, testId),
      });

      if (!instructions) return null;

      return instructions.instructions;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTestNotes(testId: number) {
    try {
      const notes = await db.query.test.findFirst({
        columns: {},
        with: {
          notes: true,
        },
        where: (column, { eq }) => eq(column.id, testId),
      });

      if (!notes) return null;

      return notes.notes;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTestQuestions(testId: number) {
    try {
      const questions = await db.query.test.findFirst({
        columns: {},
        with: {
          questions: {
            with: {
              options: true,
            },
          },
        },
        where: (column, { eq }) => eq(column.id, testId),
      });

      if (!questions) return null;

      return questions.questions;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createTest(newTest: NewTestBodyModel) {
    try {
      const newInstruction = newTest.instructions;
      const newNotes = newTest.notes;
      const newQuestions = newTest.questions;
      const _newTest = (({ instructions, notes, questions, ...rest }) => rest)(
        newTest,
      );

      const result = await db.transaction(async (tx) => {
        const [test] = await tx.insert(testTable).values(_newTest).returning();

        let instructionResult: TestInstructionModel[] = [];
        let notesResult: TestNoteModel[] = [];
        let questionsResult: TestQuestionModel[] = [];
        let optionsResult: TestQuestionOptionModel[] = [];

        if (newInstruction.length > 0) {
          const tempVal = newInstruction.map((item) => ({
            ...item,
            testId: test.id,
          }));

          instructionResult = await tx
            .insert(testInstructionTable)
            .values(tempVal)
            .returning();
        }

        if (newNotes.length > 0) {
          const tempVal = newNotes.map((item) => ({
            ...item,
            testId: test.id,
          }));

          notesResult = await tx
            .insert(testNoteTable)
            .values(tempVal)
            .returning();
        }

        if (newQuestions.length > 0) {
          const questionOnly = newQuestions.map(({ options, ...rest }) => ({
            ...rest,
            testId: test.id,
          }));

          questionsResult = await tx
            .insert(testQuestionTable)
            .values(questionOnly)
            .returning();

          const optionsVal: (NewTestQuestionOptionModel & {
            testQuestionId: string;
          })[] = [];

          questionsResult.forEach((question, index) => {
            const options = newQuestions[index].options.map((option) => ({
              ...option,
              testQuestionId: question.id,
            }));
            optionsVal.push(...options);
          });

          optionsResult = await tx
            .insert(testQuestionOptionTable)
            .values(optionsVal)
            .returning();
        }

        // Merge questions with their options so the response matches the endpoint schema
        const questionsWithOptions = questionsResult.map((q) => ({
          ...q,
          options: optionsResult.filter((o) => o.testQuestionId === q.id),
        }));

        return {
          test,
          instructions: instructionResult,
          notes: notesResult,
          questions: questionsWithOptions,
        };
      });

      return result;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      if (error instanceof TransactionRollbackError) return null;
      throw new InternalServerError();
    }
  }

  static async updateTest(testId: number, newTest: UpdateTestBodyModel) {
    try {
      const oldTest = await db.query.test.findFirst({
        where: (column, { eq }) => eq(column.id, testId),
        with: {
          instructions: true,
          notes: true,
          questions: {
            with: {
              options: true,
            },
          },
        },
      });

      if (!oldTest) return null;

      const {
        instructions = [],
        notes = [],
        questions = [],
        ...testFields
      } = newTest as UpdateTestBodyModel & {
        instructions: UpdateTestBodyModel["instructions"] | [];
        notes: UpdateTestBodyModel["notes"] | [];
        questions: UpdateTestBodyModel["questions"] | [];
      };

      // Helper to strip undefined values from update payloads
      const pickDefined = <T extends Record<string, any>>(obj: T) =>
        Object.fromEntries(
          Object.entries(obj).filter(([, v]) => v !== undefined),
        ) as Partial<T>;

      await db.transaction(async (tx) => {
        // 1) Update top-level test fields if provided
        const testUpdatePayload = pickDefined(testFields as any);
        if (Object.keys(testUpdatePayload).length > 0) {
          await tx
            .update(testTable)
            .set(testUpdatePayload)
            .where(eq(testTable.id, testId));
        }

        // 2) Instructions: upsert and delete missing
        const oldInstructionsMap = new Map(
          (oldTest.instructions ?? []).map((it) => [it.id, it]),
        );
        const seenInstructionIds = new Set<string>();

        for (const ins of instructions) {
          const { id, testId: _ignored, ...rest } = ins as any;
          if (id && oldInstructionsMap.has(id)) {
            // Update if changed
            const oldVal = oldInstructionsMap.get(id)!;
            const next = pickDefined(rest);
            const changed =
              (next.text !== undefined && next.text !== oldVal.text) ||
              (next.order !== undefined && next.order !== oldVal.order);
            if (changed) {
              await tx
                .update(testInstructionTable)
                .set(next)
                .where(eq(testInstructionTable.id, id));
            }
            seenInstructionIds.add(id);
          } else {
            // Insert
            const payload = { ...rest, testId } as any;
            await tx.insert(testInstructionTable).values(payload);
          }
        }

        const instructionIdsToDelete = (oldTest.instructions ?? [])
          .map((it) => it.id)
          .filter((id) => !seenInstructionIds.has(id));
        if (instructionIdsToDelete.length > 0) {
          await tx
            .delete(testInstructionTable)
            .where(inArray(testInstructionTable.id, instructionIdsToDelete));
        }

        // 3) Notes: upsert and delete missing
        const oldNotesMap = new Map(
          (oldTest.notes ?? []).map((it) => [it.id, it]),
        );
        const seenNoteIds = new Set<string>();

        for (const note of notes) {
          const { id, testId: _ignored, ...rest } = note as any;
          if (id && oldNotesMap.has(id)) {
            const oldVal = oldNotesMap.get(id)!;
            const next = pickDefined(rest);
            const changed =
              (next.text !== undefined && next.text !== oldVal.text) ||
              (next.order !== undefined && next.order !== oldVal.order);
            if (changed) {
              await tx
                .update(testNoteTable)
                .set(next)
                .where(eq(testNoteTable.id, id));
            }
            seenNoteIds.add(id);
          } else {
            const payload = { ...rest, testId } as any;
            await tx.insert(testNoteTable).values(payload);
          }
        }

        const noteIdsToDelete = (oldTest.notes ?? [])
          .map((it) => it.id)
          .filter((id) => !seenNoteIds.has(id));
        if (noteIdsToDelete.length > 0) {
          await tx
            .delete(testNoteTable)
            .where(inArray(testNoteTable.id, noteIdsToDelete));
        }

        // 4) Questions and Options: upsert and delete missing
        const oldQuestionsMap = new Map(
          (oldTest.questions ?? []).map((q) => [q.id, q]),
        );
        const seenQuestionIds = new Set<string>();

        for (const q of questions) {
          const {
            id,
            options: newOptions = [],
            testId: _ignored,
            ...qRest
          } = q as any;

          if (id && oldQuestionsMap.has(id)) {
            // Update question if changed
            const oldQ = oldQuestionsMap.get(id)!;
            const nextQ = pickDefined(qRest);
            const qChanged =
              (nextQ.text !== undefined && nextQ.text !== oldQ.text) ||
              (nextQ.type !== undefined && nextQ.type !== oldQ.type) ||
              (nextQ.order !== undefined && nextQ.order !== oldQ.order);
            if (qChanged) {
              await tx
                .update(testQuestionTable)
                .set(nextQ)
                .where(eq(testQuestionTable.id, id));
            }

            // Upsert options for existing question
            const oldOptionsMap = new Map(
              (oldQ.options ?? []).map((op) => [op.id, op]),
            );
            const seenOptionIds = new Set<string>();

            for (const op of newOptions as any[]) {
              const { id: opId, testQuestionId: _qIgnored, ...opRest } = op;
              if (opId && oldOptionsMap.has(opId)) {
                const oldOp = oldOptionsMap.get(opId)!;
                const nextOp = pickDefined(opRest);
                const opChanged =
                  (nextOp.text !== undefined && nextOp.text !== oldOp.text) ||
                  (nextOp.value !== undefined &&
                    nextOp.value !== oldOp.value) ||
                  (nextOp.order !== undefined && nextOp.order !== oldOp.order);
                if (opChanged) {
                  await tx
                    .update(testQuestionOptionTable)
                    .set(nextOp)
                    .where(eq(testQuestionOptionTable.id, opId));
                }
                seenOptionIds.add(opId);
              } else {
                const payload = { ...opRest, testQuestionId: id } as any;
                await tx.insert(testQuestionOptionTable).values(payload);
              }
            }

            const optionIdsToDelete = (oldQ.options ?? [])
              .map((op) => op.id)
              .filter((oid) => !seenOptionIds.has(oid));
            if (optionIdsToDelete.length > 0) {
              await tx
                .delete(testQuestionOptionTable)
                .where(inArray(testQuestionOptionTable.id, optionIdsToDelete));
            }

            seenQuestionIds.add(id);
          } else {
            // Insert new question and its options
            const insertQ = { ...qRest, testId } as any;
            const [createdQ] = await tx
              .insert(testQuestionTable)
              .values(insertQ)
              .returning();

            const optionsToInsert = (q.options ?? []).map((op: any) => ({
              text: op.text,
              value: op.value,
              order: op.order,
              testQuestionId: createdQ.id,
            }));
            if (optionsToInsert.length > 0) {
              await tx.insert(testQuestionOptionTable).values(optionsToInsert);
            }

            seenQuestionIds.add(createdQ.id);
          }
        }

        const questionIdsToDelete = (oldTest.questions ?? [])
          .map((q) => q.id)
          .filter((qid) => !seenQuestionIds.has(qid));
        if (questionIdsToDelete.length > 0) {
          await tx
            .delete(testQuestionTable)
            .where(inArray(testQuestionTable.id, questionIdsToDelete));
        }
      });

      // Return fresh snapshot without children (matches update response schema)
      const updated = await db.query.test.findFirst({
        where: (column, { eq }) => eq(column.id, testId),
        with: {
          instructions: true,
          notes: true,
          questions: {
            with: {
              options: true,
            },
          },
          children: true,
        },
      });

      return updated ?? null;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      if (error instanceof TransactionRollbackError) return null;
      throw new InternalServerError();
    }
  }
}
