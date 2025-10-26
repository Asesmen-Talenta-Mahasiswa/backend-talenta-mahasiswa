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
} from "./model";
import { TransactionRollbackError } from "drizzle-orm";

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

  static async getTestOptions(testId: number, questionId: string) {
    try {
      const options = await db.query.questionsTable.findFirst({
        where: (column, { eq }) => eq(column.testId, testId),
        with: {
          options: {
            where: (column, { eq }) => eq(column.questionId, questionId),
          },
        },
      });

      if (!options) {
        return null;
      }

      return options.options;
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
}
