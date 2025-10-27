import db from "../../db";
import { DatabaseService } from "../../db/service";
import {
  optionsTable,
  questionsTable,
  testInstructionsTable,
  testNotesTable,
  testsTable,
} from "../../db/schema";
import { InternalServerError } from "elysia";
import {
  NewTestBodyModel,
  OptionModel,
  QuestionModel,
  TestInstructionModel,
  TestNoteModel,
  UpdateOptionModel,
  UpdateQuestionModel,
  UpdateTestInstructionModel,
  UpdateTestModel,
  NewOptionModel,
  NewQuestionModel,
  NewTestInstructionModel,
  NewTestNoteModel,
  UpdateTestNoteModel,
} from "./model";
import { TransactionRollbackError, eq, inArray } from "drizzle-orm";

export abstract class TestService {
  static async getTests(
    page = 1,
    pageSize = 10,
    search = "",
    showSubTest = false,
    sort = "desc"
  ) {
    try {
      const tests = await db.query.testsTable.findMany({
        where: (column, { ilike, and, isNull }) =>
          and(
            ilike(column.name, `%${search}%`),
            !showSubTest ? isNull(column.parentId) : undefined
          ),
        orderBy: (column, { desc, asc }) => [
          sort === "desc" ? desc(column.id) : asc(column.id),
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      return tests;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTest(testId: number) {
    try {
      const test = await db.query.testsTable.findFirst({
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
      const instructions = await db.query.testInstructionsTable.findMany({
        where: (column, { eq }) => eq(column.testId, testId),
      });
      return instructions;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTestNotes(testId: number) {
    try {
      const notes = await db.query.testNotesTable.findMany({
        where: (column, { eq }) => eq(column.testId, testId),
      });
      return notes;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async getTestQuestions(testId: number) {
    try {
      const questions = await db.query.questionsTable.findMany({
        where: (column, { eq }) => eq(column.testId, testId),
        with: {
          options: true,
        },
      });
      return questions;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      throw new InternalServerError();
    }
  }

  static async createTest(newTest: NewTestBodyModel) {
    try {
      const { instructions, notes, questions, ...test } = newTest;

      const result = await db.transaction(async (tx) => {
        const [_test] = await tx.insert(testsTable).values(test).returning();

        let _instructions: TestInstructionModel[] = [];
        let _notes: TestNoteModel[] = [];
        let _questions: QuestionModel[] = [];
        let _options: OptionModel[] = [];

        if (instructions && instructions.length) {
          const instructionWithId = instructions.map((v) => ({
            ...v,
            testId: _test.id,
          }));
          _instructions = await tx
            .insert(testInstructionsTable)
            .values(instructionWithId)
            .returning();
        }

        if (notes && notes.length) {
          const notesWithId = notes.map((v) => ({
            ...v,
            testId: _test.id,
          }));
          _notes = await tx.insert(testNotesTable).values(notesWithId).returning();
        }

        if (questions && questions.length) {
          const strippedQuestions = questions.map(({ options, ...rest }) => ({
            ...rest,
            testId: _test.id,
          }));

          _questions = await tx
            .insert(questionsTable)
            .values(strippedQuestions)
            .returning();

          const optionsToInsert = _questions.flatMap((qRow, idx) =>
            questions[idx].options.map((opt) => ({
              ...opt,
              questionId: qRow.id,
            }))
          );

          if (optionsToInsert.length) {
            _options = await tx.insert(optionsTable).values(optionsToInsert).returning();
          }
        }

        const mergedQuestions = _questions.map((q) => ({
          ...q,
          options: _options.filter((opt) => opt.questionId === q.id),
        }));

        const payload = {
          ..._test,
          instructions: _instructions.length ? _instructions : undefined,
          notes: _notes.length ? _notes : undefined,
          questions: mergedQuestions,
        };

        return payload;
      });

      return result;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      if (error instanceof TransactionRollbackError) return null;
      throw new InternalServerError();
    }
  }

  static async updateTest(
    testId: number,
    updated: UpdateTestModel & {
      instructions?: (
        | UpdateTestInstructionModel
        | Omit<NewTestInstructionModel, "testId">
      )[];
      notes?: (UpdateTestNoteModel | Omit<NewTestNoteModel, "testId">)[];
      questions?: (
        | (UpdateQuestionModel & {
            options?: (UpdateOptionModel | Omit<NewOptionModel, "questionId">)[];
          })
        | (Omit<NewQuestionModel, "testId"> & {
            options: (UpdateOptionModel | Omit<NewOptionModel, "questionId">)[];
          })
      )[];
    }
  ) {
    try {
      const result = await db.transaction(async (tx) => {
        type QuestionWithOptions = QuestionModel & { options: OptionModel[] };
        // Ensure the test exists and update top-level fields
        const {
          instructions,
          notes,
          questions,
          id: _ignoreId,
          ...testFields
        } = updated || {};

        const updatedTestRows = await tx
          .update(testsTable)
          .set(testFields)
          .where(eq(testsTable.id, testId))
          .returning();

        if (updatedTestRows.length === 0) {
          // Test not found
          return null;
        }

        // Fetch current state for reconciliation
        const current = await tx.query.testsTable.findFirst({
          with: {
            instructions: true,
            notes: true,
            questions: {
              with: { options: true },
            },
          },
          where: (column, { eq }) => eq(column.id, testId),
        });

        if (!current) return null;

        // 1) Reconcile instructions (PUT semantics)
        let _instructions: TestInstructionModel[] | undefined = current.instructions;
        if (instructions === undefined) {
          // Strict PUT: missing collection means delete all
          await tx
            .delete(testInstructionsTable)
            .where(eq(testInstructionsTable.testId, testId));
          _instructions = [];
        } else if (Array.isArray(instructions)) {
          const existingMap = new Map((current.instructions || []).map((i) => [i.id, i]));
          const providedIds = new Set(
            instructions
              .map((i) => ("id" in i ? (i as UpdateTestInstructionModel).id : undefined))
              .filter(Boolean) as string[]
          );

          // Delete missing
          const toDelete = (current.instructions || [])
            .filter((i) => !providedIds.has(i.id))
            .map((i) => i.id);
          if (toDelete.length) {
            await tx
              .delete(testInstructionsTable)
              .where(inArray(testInstructionsTable.id, toDelete));
          }

          // Upsert provided
          const toInsert: Omit<NewTestInstructionModel, "testId">[] = [];
          const toUpdate: UpdateTestInstructionModel[] = [];

          for (const inst of instructions) {
            if ("id" in inst && inst.id && existingMap.has(inst.id as string)) {
              toUpdate.push(inst as UpdateTestInstructionModel);
            } else {
              toInsert.push(inst as Omit<NewTestInstructionModel, "testId">);
            }
          }

          if (toUpdate.length) {
            // update one by one (usually a handful, keeps it simple)
            for (const u of toUpdate) {
              const { id, testId: _ignored, ...setFields } = u as any;
              await tx
                .update(testInstructionsTable)
                .set(setFields)
                .where(eq(testInstructionsTable.id, id as string));
            }
          }

          if (toInsert.length) {
            _instructions = await tx
              .insert(testInstructionsTable)
              .values(toInsert.map((v) => ({ ...v, testId })))
              .returning();
          }

          // Refresh current list after mutations
          _instructions = await tx.query.testInstructionsTable.findMany({
            where: (column, { eq }) => eq(column.testId, testId),
          });
        }

        // 2) Reconcile notes (PUT semantics)
        let _notes: TestNoteModel[] | undefined = current.notes;
        if (notes === undefined) {
          await tx.delete(testNotesTable).where(eq(testNotesTable.testId, testId));
          _notes = [];
        } else if (Array.isArray(notes)) {
          const existingMap = new Map((current.notes || []).map((n) => [n.id, n]));
          const providedIds = new Set(
            notes
              .map((n) => ("id" in n ? (n as UpdateTestNoteModel).id : undefined))
              .filter(Boolean) as string[]
          );

          const toDelete = (current.notes || [])
            .filter((n) => !providedIds.has(n.id))
            .map((n) => n.id);
          if (toDelete.length) {
            await tx.delete(testNotesTable).where(inArray(testNotesTable.id, toDelete));
          }

          const toInsert: Omit<NewTestNoteModel, "testId">[] = [];
          const toUpdate: UpdateTestNoteModel[] = [];

          for (const n of notes) {
            if ("id" in n && n.id && existingMap.has(n.id as string)) {
              toUpdate.push(n as UpdateTestNoteModel);
            } else {
              toInsert.push(n as Omit<NewTestNoteModel, "testId">);
            }
          }

          if (toUpdate.length) {
            for (const u of toUpdate) {
              const { id, testId: _ignored, ...setFields } = u as any;
              await tx
                .update(testNotesTable)
                .set(setFields)
                .where(eq(testNotesTable.id, id as string));
            }
          }

          if (toInsert.length) {
            _notes = await tx
              .insert(testNotesTable)
              .values(toInsert.map((v) => ({ ...v, testId })))
              .returning();
          }

          _notes = await tx.query.testNotesTable.findMany({
            where: (column, { eq }) => eq(column.testId, testId),
          });
        }

        // 3) Reconcile questions (and nested options) with strict PUT semantics
        let _questions: QuestionWithOptions[] | undefined =
          (current.questions as unknown as QuestionWithOptions[]) ?? [];
        let _options: OptionModel[] = (current.questions as any[]).flatMap(
          (q: any) => q.options || []
        );

        if (questions === undefined) {
          // Delete all questions (cascade deletes options)
          await tx.delete(questionsTable).where(eq(questionsTable.testId, testId));
          _questions = [];
          _options = [];
        } else if (Array.isArray(questions)) {
          const existingQMap = new Map((current.questions || []).map((q) => [q.id, q]));
          const providedQIds = new Set(
            questions
              .map((q) => ("id" in q ? (q as UpdateQuestionModel).id : undefined))
              .filter(Boolean) as string[]
          );

          // Delete missing questions (will cascade delete options)
          const qToDelete = (current.questions || [])
            .filter((q) => !providedQIds.has(q.id))
            .map((q) => q.id);
          if (qToDelete.length) {
            await tx.delete(questionsTable).where(inArray(questionsTable.id, qToDelete));
          }

          // Partition insert/update
          type IncomingQuestionInsert = Omit<NewQuestionModel, "testId"> & {
            options: (UpdateOptionModel | Omit<NewOptionModel, "questionId">)[];
          };
          const qToInsert: IncomingQuestionInsert[] = [];
          const qToUpdate: UpdateQuestionModel[] = [];

          for (const q of questions) {
            if ("id" in q && q.id && existingQMap.has(q.id as string)) {
              qToUpdate.push(q as UpdateQuestionModel);
            } else {
              qToInsert.push(q as IncomingQuestionInsert);
            }
          }

          // Update existing questions
          if (qToUpdate.length) {
            for (const uq of qToUpdate) {
              const {
                id,
                testId: _ignored,
                options: incomingOptions,
                ...setFields
              } = uq as any;
              await tx
                .update(questionsTable)
                .set(setFields)
                .where(eq(questionsTable.id, id as string));

              // Reconcile options if provided
              if (Array.isArray(incomingOptions)) {
                // Current options for this question
                const currQ = existingQMap.get(id as string);
                const currOptions = currQ?.options ?? [];
                const existingOMap = new Map(currOptions.map((o) => [o.id, o]));
                const providedOIds = new Set(
                  incomingOptions
                    .map((o) => ("id" in o ? (o as UpdateOptionModel).id : undefined))
                    .filter(Boolean) as string[]
                );

                // Delete missing options
                const oToDelete = currOptions
                  .filter((o) => !providedOIds.has(o.id))
                  .map((o) => o.id);
                if (oToDelete.length) {
                  await tx
                    .delete(optionsTable)
                    .where(inArray(optionsTable.id, oToDelete));
                }

                // Partition insert/update
                const oToInsert: Omit<NewOptionModel, "questionId">[] = [];
                const oToUpdate: UpdateOptionModel[] = [];

                for (const opt of incomingOptions) {
                  if ("id" in opt && opt.id && existingOMap.has(opt.id as string)) {
                    oToUpdate.push(opt as UpdateOptionModel);
                  } else {
                    oToInsert.push(opt as Omit<NewOptionModel, "questionId">);
                  }
                }

                if (oToUpdate.length) {
                  for (const uo of oToUpdate) {
                    const { id: oid, questionId: _qi, ...oSet } = uo as any;
                    await tx
                      .update(optionsTable)
                      .set(oSet)
                      .where(eq(optionsTable.id, oid as string));
                  }
                }

                if (oToInsert.length) {
                  const inserted = await tx
                    .insert(optionsTable)
                    .values(oToInsert.map((v) => ({ ...v, questionId: id as string })))
                    .returning();
                  _options.push(...inserted);
                }
              }
            }
          }

          // Insert new questions (with options)
          if (qToInsert.length) {
            const stripped = qToInsert.map(({ options, ...rest }) => ({ ...rest }));
            const insertedQ = await tx
              .insert(questionsTable)
              .values(stripped.map((q) => ({ ...q, testId })))
              .returning();

            // Insert options for the newly created questions
            const optionsToInsert: (Omit<NewOptionModel, "questionId"> & {
              questionId: string;
            })[] = [];

            // Match by index between qToInsert and insertedQ
            insertedQ.forEach((qRow, idx) => {
              const incoming = qToInsert[idx] as any;
              const opts = (incoming.options || []) as (
                | UpdateOptionModel
                | Omit<NewOptionModel, "questionId">
              )[];
              for (const opt of opts) {
                const { id: _oid, questionId: _qid, ...rest } = opt as any;
                optionsToInsert.push({ ...rest, questionId: qRow.id });
              }
            });

            if (optionsToInsert.length) {
              const insertedOpts = await tx
                .insert(optionsTable)
                .values(optionsToInsert)
                .returning();
              _options.push(...insertedOpts);
            }
          }

          // Refresh questions (+ options)
          _questions = (await tx.query.questionsTable.findMany({
            where: (column, { eq }) => eq(column.testId, testId),
            with: { options: true },
          })) as unknown as QuestionWithOptions[];
        }

        // Final payload mirrors getTest/ createTest response
        return {
          ...updatedTestRows[0],
          instructions: _instructions,
          notes: _notes,
          questions: _questions,
        };
      });

      return result;
    } catch (error) {
      DatabaseService.logDatabaseError(error);
      if (error instanceof TransactionRollbackError) return null;
      throw new InternalServerError();
    }
  }
}
