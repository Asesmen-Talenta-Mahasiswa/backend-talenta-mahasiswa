import { NonArray, relations } from "drizzle-orm";
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
} from "drizzle-orm/pg-core";
import {
  CareerCategory,
  CareerFieldResult,
  Degree,
  Faculty,
  MbtiDimension,
  PermissionLevel,
  Program,
  PwbResult,
  QuestionType,
  TalentResult,
  TestType,
} from "../common/enum";
import { enumToPgEnum } from "../utils";

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

export const testTypeEnum = pgEnum("test_type_enum", enumToPgEnum(TestType));

export const careerCategoryEnum = pgEnum(
  "career_category_enum",
  enumToPgEnum(CareerCategory)
);

export const mbtiDimensionEnum = pgEnum(
  "mbti_dimension_enum",
  enumToPgEnum(MbtiDimension)
);

export const careerFieldResultEnum = pgEnum(
  "career_field_result_enum",
  enumToPgEnum(CareerFieldResult)
);

export const pwbResultEnum = pgEnum("pwb_result_enum", enumToPgEnum(PwbResult));

export const talentResultEnum = pgEnum(
  "talent_result_enum",
  enumToPgEnum(TalentResult)
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
});

export const studentsTable = pgTable("students", {
  id: uuid().primaryKey().defaultRandom(),
  npm: char({ length: 10 }).notNull().unique(), // e.g. 2215061066
  name: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 128 }),
  program: programEnum().notNull(),
  // department: varchar(), // university does not have department data.
  faculty: facultyEnum().notNull(),
  degree: degreeEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const testsTable = pgTable("tests", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 256 }).notNull(),
  description: text().notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().notNull().defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: uuid().primaryKey().defaultRandom(),
  testId: uuid()
    .notNull()
    .references(() => testsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  type: questionTypeEnum().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const multipleChoiceOptionsTable = pgTable("multiple_choice_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  careerCategory: careerCategoryEnum(), // only for career interest test
  mbtiType: mbtiDimensionEnum(), // only for mbti test
  createdAt: timestamp().notNull().defaultNow(),
});

export const singleChoiceOptionsTable = pgTable("single_choice_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  careerCategory: careerCategoryEnum(), // only for career interest test
  mbtiType: mbtiDimensionEnum(), // only for mbti test
  createdAt: timestamp().notNull().defaultNow(),
});

export const likertOptionsTable = pgTable("likert_options", {
  id: uuid().primaryKey().defaultRandom(),
  questionId: uuid()
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  likertValueMin: integer().default(1),
  likertValueMax: integer().default(5),
  likertValueLabelMin: text(),
  likertValueLabelMax: text(),
  createdAt: timestamp().notNull().defaultNow(),
});
// Note:
// Test minat bidang karir itu single choice
// Test MBTI itu single choice
// Test PWB itu likert scale
// Test Keluhan stress itu multiple choice

export const resultsTable = pgTable("results", {
  id: uuid().primaryKey().defaultRandom(),
  studentId: uuid()
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  careerCategory: careerCategoryEnum().notNull(), // from career interest test result
  mbtiType: varchar({ length: 4 }).notNull(), // from mbti test result, e.g. INFP
  pwbScore: integer().notNull(), // from pwb test result, range 0-100
  createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
});

// Tests <-> Questions
export const testsRelations = relations(testsTable, ({ many }) => ({
  questions: many(questionsTable),
}));

// Questions -> Tests, Question -> Options
export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    test: one(testsTable, {
      fields: [questionsTable.testId],
      references: [testsTable.id],
    }),
    multipleChoiceOptions: many(multipleChoiceOptionsTable),
    singleChoiceOptions: many(singleChoiceOptionsTable),
    likertOptions: many(likertOptionsTable),
  })
);

// Multiple choice options -> Question
export const multipleChoiceOptionsRelations = relations(
  multipleChoiceOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [multipleChoiceOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Single choice options -> Question
export const singleChoiceOptionsRelations = relations(
  singleChoiceOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [singleChoiceOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Likert options -> Question
export const likertOptionsRelations = relations(
  likertOptionsTable,
  ({ one }) => ({
    question: one(questionsTable, {
      fields: [likertOptionsTable.questionId],
      references: [questionsTable.id],
    }),
  })
);

// Students <-> Results
export const studentsRelations = relations(studentsTable, ({ many }) => ({
  results: many(resultsTable),
}));

export const resultsRelations = relations(resultsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [resultsTable.studentId],
    references: [studentsTable.id],
  }),
}));
