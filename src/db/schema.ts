import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  char,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  integer,
  foreignKey,
} from "drizzle-orm/pg-core";
import {
  Degree,
  Faculty,
  PermissionLevel,
  Program,
  QuestionType,
  SubmissionStatus,
} from "../common/enum";
import { enumToPgEnum } from "../utils";
import { E } from "@faker-js/faker/dist/airline-CHFQMWko";

// Define the permission level enum
export const permissionLevelEnum = pgEnum(
  "permission_level_enum",
  enumToPgEnum(PermissionLevel)
);

export const facultyEnum = pgEnum("faculty_enum", enumToPgEnum(Faculty));

export const degreeEnum = pgEnum("degree_enum", enumToPgEnum(Degree));

export const programEnum = pgEnum("program_enum", enumToPgEnum(Program));

export const questionTypeEnum = pgEnum(
  "question_type_enum",
  enumToPgEnum(QuestionType)
);

export const submissionStatusEnum = pgEnum(
  "submission_status_enum",
  enumToPgEnum(SubmissionStatus)
);

// User table schema
// This table merge all user roles into a single table with a permission level field
// The permission levels are:
// - student: regular student user
// - program: program head
// - department: department head
// - faculty: faculty head
// - university: university admin
// - admin: system admin
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 32 }).notNull().unique(),
  password: text().notNull(), // hashed password
  permissionLevel: permissionLevelEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const studentsTable = pgTable("students", {
  id: uuid().primaryKey().defaultRandom(),
  npm: char({ length: 10 }).notNull().unique(), // e.g. 2515061066
  name: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 128 }),
  program: programEnum().notNull(),
  // department: varchar(), // university does not have department data.
  faculty: facultyEnum().notNull(),
  degree: degreeEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const testsTable = pgTable("tests", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  isActive: boolean().notNull().default(true),
});

export const subTestsTable = pgTable(
  "sub_tests",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    description: text(),
    testId: uuid().notNull(),
    parentId: uuid(),
  },
  (table) => [
    // reference to testsTable.id
    foreignKey({
      columns: [table.testId],
      foreignColumns: [testsTable.id],
    }).onDelete("cascade"),

    // self-reference (parent/child)
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
  ]
);

export const subtestInstructionsTable = pgTable("subtest_instructions", {
  id: uuid().defaultRandom().primaryKey(),
  text: text().notNull(),
  order: integer().default(0).notNull(), // To order the instructions
  subtestId: uuid()
    .notNull()
    .references(() => subTestsTable.id, { onDelete: "cascade" }),
});

export const subtestNotesTable = pgTable("subtest_notes", {
  id: uuid().defaultRandom().primaryKey(),
  text: text().notNull(),
  order: integer().default(0).notNull(), // To order the notes
  subtestId: uuid()
    .notNull()
    .references(() => subTestsTable.id, { onDelete: "cascade" }),
});

export const questionsTable = pgTable("questions", {
  id: uuid().primaryKey().defaultRandom(),
  text: text().notNull(),
  type: questionTypeEnum().notNull(),
  subtestId: uuid()
    .notNull()
    .references(() => subTestsTable.id, { onDelete: "cascade" }),
});

export const optionsTable = pgTable("options", {
  id: uuid().defaultRandom().primaryKey(),
  text: text().notNull(), // The text displayed to the user (e.g., "Strongly Agree")
  // The calculable value of the option. Text type makes it super flexible.
  value: text().notNull(),
  order: integer().notNull().default(0), // To order the options
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
});

export const testSubmissionsTable = pgTable("test_submissions", {
  id: uuid().defaultRandom().primaryKey(),
  studentId: uuid()
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  testId: uuid()
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
  status: submissionStatusEnum().default("in_progress").notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  completedAt: timestamp(),
});

export const studentAnswersTable = pgTable("student_answers", {
  id: uuid().defaultRandom().primaryKey(),
  submissionId: uuid()
    .notNull()
    .references(() => testSubmissionsTable.id, { onDelete: "cascade" }),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  selectedOptionId: uuid()
    .notNull()
    .references(() => optionsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
});

export const submissionResultsTable = pgTable("submission_results", {
  id: uuid().defaultRandom().primaryKey(),
  submissionId: uuid()
    .notNull()
    .references(() => testSubmissionsTable.id, { onDelete: "cascade" }),
  subtestId: uuid()
    .notNull()
    .references(() => subTestsTable.id, { onDelete: "cascade" }),
  // Stores "academics", "ENTJ", or a score like "50"
  resultValue: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const testRelations = relations(testsTable, ({ many }) => ({
  subTests: many(subTestsTable),
  submissions: many(testSubmissionsTable),
}));

export const subTestRelations = relations(subTestsTable, ({ one, many }) => ({
  test: one(testsTable, {
    fields: [subTestsTable.testId],
    references: [testsTable.id],
  }),
  questions: many(questionsTable),
  instructions: many(subtestInstructionsTable),
  notes: many(subtestNotesTable),
}));

export const subtestInstructionRelations = relations(
  subtestInstructionsTable,
  ({ one }) => ({
    subTest: one(subTestsTable, {
      fields: [subtestInstructionsTable.subtestId],
      references: [subTestsTable.id],
    }),
  })
);

export const subtestNoteRelations = relations(subtestNotesTable, ({ one }) => ({
  subTest: one(subTestsTable, {
    fields: [subtestNotesTable.subtestId],
    references: [subTestsTable.id],
  }),
}));

export const questionRelations = relations(questionsTable, ({ one, many }) => ({
  subTest: one(subTestsTable, {
    fields: [questionsTable.subtestId],
    references: [subTestsTable.id],
  }),
  options: many(optionsTable),
}));

export const optionRelations = relations(optionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.questionId],
    references: [questionsTable.id],
  }),
}));

export const studentRelations = relations(studentsTable, ({ many }) => ({
  submissions: many(testSubmissionsTable),
}));

export const testSubmissionsRelations = relations(
  testSubmissionsTable,
  ({ one, many }) => ({
    student: one(studentsTable, {
      fields: [testSubmissionsTable.studentId],
      references: [studentsTable.id],
    }),
    test: one(testsTable, {
      fields: [testSubmissionsTable.testId],
      references: [testsTable.id],
    }),
    answers: many(studentAnswersTable),
    results: many(submissionResultsTable),
  })
);

export const studentAnswersRelations = relations(
  studentAnswersTable,
  ({ one }) => ({
    submission: one(testSubmissionsTable, {
      fields: [studentAnswersTable.submissionId],
      references: [testSubmissionsTable.id],
    }),
    question: one(questionsTable, {
      fields: [studentAnswersTable.questionId],
      references: [questionsTable.id],
    }),
    selectedOption: one(optionsTable, {
      fields: [studentAnswersTable.selectedOptionId],
      references: [optionsTable.id],
    }),
  })
);

export const submissionResultsRelations = relations(
  submissionResultsTable,
  ({ one }) => ({
    submission: one(testSubmissionsTable, {
      fields: [submissionResultsTable.submissionId],
      references: [testSubmissionsTable.id],
    }),
    subTest: one(subTestsTable, {
      fields: [submissionResultsTable.subtestId],
      references: [subTestsTable.id],
    }),
  })
);

export const schema = {
  usersTable,
  studentsTable,
  testsTable,
  subTestsTable,
  questionsTable,
  optionsTable,
  testSubmissionsTable,
  studentAnswersTable,
  submissionResultsTable,
  subtestInstructionsTable,
  subtestNotesTable,
} as const;
