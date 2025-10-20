import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  integer,
  foreignKey,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { PermissionLevel, QuestionType, SubmissionStatus } from "../common/enum";
import { enumToPgEnum } from "../utils";

// --- ENUMS ---

export const permissionLevelEnum = pgEnum(
  "permission_level_enum",
  enumToPgEnum(PermissionLevel)
);

export const questionTypeEnum = pgEnum("question_type_enum", enumToPgEnum(QuestionType));

export const submissionStatusEnum = pgEnum(
  "submission_status_enum",
  enumToPgEnum(SubmissionStatus)
);

// --- CORE TABLES ---

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  username: varchar().notNull().unique(),
  password: text().notNull(), // hashed password
  permissionLevel: permissionLevelEnum("permission_level").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const studentsTable = pgTable(
  "students",
  {
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    npm: varchar().notNull().unique(),
    name: varchar().notNull(),
    email: varchar(),
    year: integer().notNull(),
    program: varchar().notNull(),
    faculty: varchar().notNull(),
    degree: varchar().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // search
    index("npm_gin_idx").using("gin", sql`${table.npm} gin_trgm_ops`),
    index("name_gin_idx").using("gin", sql`${table.name} gin_trgm_ops`),
    // sorting
    index("name_btree_idx").on(table.name),
    // filters b-tree index
    index("student_filters_idx").on(
      table.program,
      table.faculty,
      table.year,
      table.degree
    ),
  ]
);

export const testsTable = pgTable(
  "tests",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    description: text(),
    isActive: boolean("is_active").notNull().default(true),
    // Self-referencing key. NULL parentId = top-level test.
    parentId: integer("parent_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
  ]
);

export const testInstructionsTable = pgTable("test_instructions", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  text: text().notNull(),
  order: integer().default(0).notNull(),
  testId: integer("test_id")
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
});

export const testNotesTable = pgTable("test_notes", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  text: text().notNull(),
  order: integer().default(0).notNull(),
  testId: integer("test_id")
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
});

export const questionsTable = pgTable("questions", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  text: text().notNull(),
  type: questionTypeEnum().notNull(),
  testId: integer("test_id") // Formerly subtestId
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
});

export const optionsTable = pgTable("options", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  text: text().notNull(),
  value: text().notNull(),
  order: integer().notNull().default(0),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
});

export const testSubmissionsTable = pgTable("test_submissions", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  testId: integer("test_id")
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
  status: submissionStatusEnum().default("in_progress").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const studentAnswersTable = pgTable("student_answers", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => testSubmissionsTable.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  selectedOptionId: uuid("selected_option_id")
    .notNull()
    .references(() => optionsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissionResultsTable = pgTable("submission_results", {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => testSubmissionsTable.id, { onDelete: "cascade" }),
  testId: integer("test_id")
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
  resultValue: text("result_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---

export const studentRelations = relations(studentsTable, ({ many }) => ({
  submissions: many(testSubmissionsTable),
}));

export const testRelations = relations(testsTable, ({ one, many }) => ({
  parent: one(testsTable, {
    fields: [testsTable.parentId],
    references: [testsTable.id],
    relationName: "test_hierarchy",
  }),
  children: many(testsTable, {
    relationName: "test_hierarchy",
  }),
  instructions: many(testInstructionsTable),
  notes: many(testNotesTable),
  questions: many(questionsTable),
  submissions: many(testSubmissionsTable),
}));

export const testInstructionRelations = relations(testInstructionsTable, ({ one }) => ({
  test: one(testsTable, {
    fields: [testInstructionsTable.testId],
    references: [testsTable.id],
  }),
}));

export const testNoteRelations = relations(testNotesTable, ({ one }) => ({
  test: one(testsTable, {
    fields: [testNotesTable.testId],
    references: [testsTable.id],
  }),
}));

export const questionRelations = relations(questionsTable, ({ one, many }) => ({
  test: one(testsTable, {
    fields: [questionsTable.testId],
    references: [testsTable.id],
  }),
  options: many(optionsTable),
}));

export const optionRelations = relations(optionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.questionId],
    references: [questionsTable.id],
  }),
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

export const studentAnswersRelations = relations(studentAnswersTable, ({ one }) => ({
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
}));

export const submissionResultsRelations = relations(
  submissionResultsTable,
  ({ one }) => ({
    submission: one(testSubmissionsTable, {
      fields: [submissionResultsTable.submissionId],
      references: [testSubmissionsTable.id],
    }),
    test: one(testsTable, {
      fields: [submissionResultsTable.testId],
      references: [testsTable.id],
    }),
  })
);

export const schema = {
  usersTable,
  studentsTable,
  testsTable,
  testInstructionsTable,
  testNotesTable,
  questionsTable,
  optionsTable,
  testSubmissionsTable,
  studentAnswersTable,
  submissionResultsTable,
} as const;
