import { randomUUIDv7 } from "bun";
import { relations, sql } from "drizzle-orm";
import { index, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";
import degree from "./degree";
import enrollmentYear from "./enrollmentYear";
import faculty from "./faculty";
import major from "./major";
import testSubmission from "./testSubmission";

const student = assessmentSchema.table(
  "student",
  {
    id: uuid("id")
      .primaryKey()
      .$default(() => randomUUIDv7()),
    npm: text("npm").notNull().unique(),
    name: text("name").notNull(),
    email: text("email"),
    enrollmentYearId: integer("enrollment_year_id")
      .notNull()
      .references(() => enrollmentYear.id, { onDelete: "restrict" }),
    majorId: integer("major_id")
      .notNull()
      .references(() => major.id, { onDelete: "restrict" }),
    // departmentId: integer("department_id")
    //   .notNull()
    //   .references(() => departments.id), // Add later when we have access to One Data API
    facultyId: integer("faculty_id")
      .notNull()
      .references(() => faculty.id, { onDelete: "restrict" }),
    degreeId: integer("degree_id")
      .notNull()
      .references(() => degree.id, { onDelete: "restrict" }),
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
    index("students_enrollment_year_idx").on(column.enrollmentYearId),
    index("students_major_idx").on(column.majorId),
    // index("students_department_idx").on(column.departmentId),
    index("students_faculty_idx").on(column.facultyId),
    index("students_degree_idx").on(column.degreeId),
  ],
);

export const studentRelations = relations(student, ({ one, many }) => ({
  enrollmentYear: one(enrollmentYear, {
    fields: [student.enrollmentYearId],
    references: [enrollmentYear.id],
  }),
  major: one(major, {
    fields: [student.majorId],
    references: [major.id],
  }),
  //   department: one(department, {
  //     fields: [student.departmentId],
  //     references: [department.id],
  //   }),
  faculty: one(faculty, {
    fields: [student.facultyId],
    references: [faculty.id],
  }),
  degree: one(degree, {
    fields: [student.degreeId],
    references: [degree.id],
  }),
  submissions: many(testSubmission),
}));

export default student;
