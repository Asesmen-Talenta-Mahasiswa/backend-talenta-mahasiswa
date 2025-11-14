import { randomUUIDv7 } from "bun";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const assessmentSchema = pgSchema("assessment");

// ============================================================================
// User Schema
// ============================================================================
export const user = assessmentSchema.table("user", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed password
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export const userRelations = relations(user, ({ one }) => ({
  student: one(student, {
    fields: [user.id],
    references: [student.userId],
  }),
}));

// ============================================================================
// Lookup Tables (Department, Faculty, Major)
// ============================================================================
export const faculty = assessmentSchema.table(
  "faculty",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
  },
  (column) => [index("faculty_name_idx").on(column.name)],
);

export const major = assessmentSchema.table(
  "major",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
  },
  (column) => [index("major_name_idx").on(column.name)],
);

export const department = assessmentSchema.table(
  "department",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
  },
  (column) => [index("department_name_idx").on(column.name)],
);

// LET IT BE SNAKE_CASE BECAUSE IT'S A LOOKUP TABLE FROM ONEDATA UNILA
export const institution = assessmentSchema.table(
  "institution",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    id_sp: uuid("id_sp"),
    id_sms: uuid("id_sms"),
    id_fak_unila: uuid("id_fak_unila"),
    id_jur_unila: uuid("id_jur_unila"),
    id_induk_sms: uuid("id_induk_sms"),
    id_jns_sms: text("id_jns_sms"),
    id_wil: text("id_wil"),
    nm_jns_sms: text("nm_jns_sms"),
    nm_lemb: text("nm_lemb"),
    kode_prodi: text("kode_prodi"),
    nm_jenj_didik: text("nm_jenj_didik"),
  },
  (column) => [
    index("institution_nm_lemb_idx").on(column.nm_lemb),
    index("institution_id_sms_idx").on(column.id_sms),
    index("institution_id_fak_unila_idx").on(column.id_fak_unila),
    index("institution_id_jur_unila_idx").on(column.id_jur_unila),
  ],
);

// ============================================================================
// Student Schema
// ============================================================================
export const student = assessmentSchema.table(
  "student",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    npm: text("npm").notNull().unique(),
    name: text("name").notNull(),
    email: text("email"),
    gender: text("gender").notNull(),
    degree: text("degree").notNull(),
    enrollmentYear: text("enrollment_year").notNull(),
    hasTakenTest: boolean("has_taken_test").notNull().default(false),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "restrict" }),
    majorId: integer("major_id")
      .notNull()
      .references(() => major.id, { onDelete: "restrict" }),
    departmentId: integer("department_id")
      .notNull()
      .references(() => department.id, { onDelete: "restrict" }),
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculty.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .$onUpdate(() => sql`now()`),
  },
  (column) => [
    // trigram search for case-insensitive name searches
    index("students_name_trgm_idx").using(
      "gin",
      column.name.op("gin_trgm_ops"),
    ),

    // single-column btree indexes for filters
    index("students_major_idx").on(column.majorId),
    index("students_user_idx").on(column.majorId),
    index("students_department_idx").on(column.departmentId),
    index("students_faculty_idx").on(column.facultyId),
    index("students_enrollment_year_idx").on(column.enrollmentYear),
    index("students_gender_idx").on(column.gender),
    index("students_degree_idx").on(column.degree),
  ],
);

export const studentRelations = relations(student, ({ one, many }) => ({
  major: one(major, {
    fields: [student.majorId],
    references: [major.id],
  }),
  department: one(department, {
    fields: [student.departmentId],
    references: [department.id],
  }),
  faculty: one(faculty, {
    fields: [student.facultyId],
    references: [faculty.id],
  }),
  user: one(user, {
    fields: [student.userId],
    references: [user.id],
  }),
  submissions: many(testSubmission),
}));

// ============================================================================
// Test Schema
// ============================================================================
/**
 * Test
 *
 * Represents assessments in a hierarchical structure.
 *
 * Structure:
 * - Main Test: parentId = NULL (top-level test)
 * - Sub-test: parentId = [main test id] (nested under main test)
 *
 * Example Hierarchy:
 * "Career Assessment" (id: 1, parentId: NULL)          ← Main Test
 *   ├── "Personality Test" (id: 2, parentId: 1)        ← Sub-test
 *   ├── "IQ Test" (id: 3, parentId: 1)                 ← Sub-test
 *   └── "Interest Inventory" (id: 4, parentId: 1)      ← Sub-test
 *
 * Submission Rules:
 * - Students create submissions ONLY for main tests (parentId IS NULL)
 * - Sub-tests do NOT have their own submissions
 * - Questions can belong to either main tests or sub-tests
 * - Results are generated per test (one result per main test + one per sub-test)
 */
export const test = assessmentSchema.table(
  "test",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (column) => [
    // Self-referencing key. NULL parentId = top-level test.
    foreignKey({
      columns: [column.parentId],
      foreignColumns: [column.id],
    }).onDelete("cascade"),

    // search test name
    index("test_name_gin_idx").using("gin", column.name.op("gin_trgm_ops")),
  ],
);

export const testRelations = relations(test, ({ one, many }) => ({
  // Parent test relationship (for sub-tests only)
  parent: one(test, {
    fields: [test.parentId],
    references: [test.id],
    relationName: "test_hierarchy",
  }),
  // Child tests (sub-tests under this main test)
  children: many(test, { relationName: "test_hierarchy" }),
  // Instructions for this test
  instructions: many(testInstruction),
  // Notes for this test
  notes: many(testNote),
  // Questions belonging to this test (can be in main test or sub-test)
  questions: many(testQuestion),
  // Submissions (only for main tests with parentId = NULL)
  submissions: many(testSubmission),
}));

// ============================================================================
// Test Instruction Schema
// ============================================================================
export const testInstruction = assessmentSchema.table("test_instruction", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  text: text("text").notNull(),
  order: integer("order").notNull(),
  testId: integer("test_id")
    .notNull()
    .references(() => test.id, { onDelete: "cascade" }),
});

export const testInstructionRelations = relations(
  testInstruction,
  ({ one }) => ({
    test: one(test, {
      fields: [testInstruction.testId],
      references: [test.id],
    }),
  }),
);

// ============================================================================
// Test Note Schema
// ============================================================================
export const testNote = assessmentSchema.table("test_note", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  text: text("text").notNull(),
  order: integer("order").notNull(),
  testId: integer("test_id")
    .notNull()
    .references(() => test.id, { onDelete: "cascade" }),
});

export const testNoteRelations = relations(testNote, ({ one }) => ({
  test: one(test, {
    fields: [testNote.testId],
    references: [test.id],
  }),
}));

// ============================================================================
// Test Question Schema
// ============================================================================
export const testQuestion = assessmentSchema.table("test_question", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  text: text("text").notNull(),
  type: text("type").notNull(),
  order: integer("order").notNull(),
  testId: integer("test_id")
    .notNull()
    .references(() => test.id, { onDelete: "cascade" }),
});

export const testQuestionRelations = relations(
  testQuestion,
  ({ one, many }) => ({
    test: one(test, {
      fields: [testQuestion.testId],
      references: [test.id],
    }),
    options: many(testQuestionOption),
  }),
);

// ============================================================================
// Test Question Option Schema
// ============================================================================
export const testQuestionOption = assessmentSchema.table(
  "test_question_option",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    text: text("text").notNull(),
    value: text("value").notNull(),
    order: integer("order").notNull(),
    testQuestionId: uuid("test_question_id")
      .notNull()
      .references(() => testQuestion.id, { onDelete: "cascade" }),
  },
);

export const testQuestionOptionRelations = relations(
  testQuestionOption,
  ({ one }) => ({
    question: one(testQuestion, {
      fields: [testQuestionOption.testQuestionId],
      references: [testQuestion.id],
    }),
  }),
);

// ============================================================================
// Test Submission Schema
// ============================================================================
export const testSubmission = assessmentSchema.table("test_submission", {
  id: uuid("id")
    .primaryKey()
    .$default(() => randomUUIDv7()),
  studentId: uuid("student_id")
    .notNull()
    .references(() => student.id, { onDelete: "cascade" }),
  testId: integer("test_id")
    .notNull()
    .references(() => test.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "string" }),
});

export const testSubmissionRelations = relations(
  testSubmission,
  ({ one, many }) => ({
    student: one(student, {
      fields: [testSubmission.studentId],
      references: [student.id],
    }),
    test: one(test, {
      fields: [testSubmission.testId],
      references: [test.id],
    }),
    answers: many(testSubmissionAnswer),
    results: many(testSubmissionResult),
  }),
);

// ============================================================================
// Test Submission Answer Schema
// ============================================================================
/**
 * Test Submission Answer
 *
 * Stores student answers for questions in a test submission.
 *
 * Relationship Flow:
 * - testSubmissionId → references the main test submission
 * - testQuestionId → references the question being answered
 * - The question itself (testQuestion) has testId, which tells us
 *   whether the answer is for the main test or a specific sub-test
 *
 * Example:
 * Student takes "Career Assessment" (main test) which contains:
 * - Sub-test: "Personality Test" (has questions 1-50)
 * - Sub-test: "IQ Test" (has questions 51-100)
 *
 * All answers reference the same submission (main test),
 * but through testQuestionId we can determine which sub-test
 * each answer belongs to.
 */
export const testSubmissionAnswer = assessmentSchema.table(
  "test_submission_answer",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    testSubmissionId: uuid("test_submission_id")
      .notNull()
      .references(() => testSubmission.id, { onDelete: "cascade" }),
    testQuestionId: uuid("test_question_id")
      .notNull()
      .references(() => testQuestion.id, { onDelete: "cascade" }),
    selectedOptionId: uuid("selected_option_id")
      .notNull()
      .references(() => testQuestionOption.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
);

export const testSubmissionAnswerRelations = relations(
  testSubmissionAnswer,
  ({ one }) => ({
    submission: one(testSubmission, {
      fields: [testSubmissionAnswer.testSubmissionId],
      references: [testSubmission.id],
    }),
    question: one(testQuestion, {
      fields: [testSubmissionAnswer.testQuestionId],
      references: [testQuestion.id],
    }),
    selectedOption: one(testQuestionOption, {
      fields: [testSubmissionAnswer.selectedOptionId],
      references: [testQuestionOption.id],
    }),
  }),
);

// ============================================================================
// Test Submission Result Schema
// ============================================================================
/**
 * Test Submission Result
 *
 * Stores the results/scores for tests within a submission.
 * A single submission (main test) can have MULTIPLE results - one for each sub-test.
 *
 * Relationship Flow:
 * - testSubmissionId → references the main test submission
 * - testId → references which test (main or sub-test) this result is for
 *
 * Example:
 * Student takes "Career Assessment" (main test) submission ID: "abc-123"
 *
 * This creates multiple results:
 * 1. Result { submissionId: "abc-123", testId: 1, result: "aligned_developers" }    ← Main test result
 * 2. Result { submissionId: "abc-123", testId: 2, result: "sangat_sesuai" }         ← Sub-test 1 result
 * 3. Result { submissionId: "abc-123", testId: 3, result: "cukup_siap" }            ← Sub-test 2 result
 * 4. Result { submissionId: "abc-123", testId: 4, result: "praktisi" }              ← Sub-test 3 result
 *
 * All results belong to the same submission, but each represents
 * the outcome of a different test (main or sub-test).
 */
export const testSubmissionResult = assessmentSchema.table(
  "test_submission_result",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    testSubmissionId: uuid("test_submission_id").references(
      () => testSubmission.id,
      {
        onDelete: "set null",
      },
    ),
    testId: integer("test_id").references(() => test.id, {
      onDelete: "set null",
    }),
    result: jsonb("result").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
);

export const testSubmissionResultRelations = relations(
  testSubmissionResult,
  ({ one }) => ({
    // The main test submission this result belongs to
    submission: one(testSubmission, {
      fields: [testSubmissionResult.testSubmissionId],
      references: [testSubmission.id],
    }),
    // Which specific test (main or sub-test) this result is for
    test: one(test, {
      fields: [testSubmissionResult.testId],
      references: [test.id],
    }),
  }),
);
