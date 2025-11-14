import { getTableName, sql } from "drizzle-orm";
import db from ".";
import * as schema from "../db/schema";
import * as seeds from "../db/seeds";
import { env } from "../env";

if (!env.DB_SEEDING) {
  throw new Error("You must set DB_SEEDING to 'true' when running seeds");
}

console.log("Seeding database...");

console.log("Truncating tables...");
for (const table of [
  schema.user,
  schema.department,
  schema.faculty,
  schema.major,
  schema.institution,
  schema.student,
  schema.test,
  schema.testInstruction,
  schema.testNote,
  schema.testQuestion,
  schema.testQuestionOption,
  schema.testSubmission,
  schema.testSubmissionAnswer,
  schema.testSubmissionResult,
]) {
  await db.execute(
    sql.raw(
      `TRUNCATE TABLE "assessment"."${getTableName(table)}" RESTART IDENTITY CASCADE`,
    ),
  );
}

console.log("Seeding tables...");
const result = await db.transaction(async (tx) => {
  console.log("Seeding user");
  await seeds.user(tx);
  console.log("Seeding department");
  await seeds.department(tx);
  console.log("Seeding faculty");
  await seeds.faculty(tx);
  console.log("Seeding major");
  await seeds.major(tx);
  console.log("Seeding institution");
  await seeds.institution(tx);
  console.log("Seeding student");
  await seeds.student(tx);
  console.log("Seeding test");
  await seeds.test(tx);
  console.log("Seeding testInstruction");
  await seeds.testInstruction(tx);
  console.log("Seeding testNote");
  await seeds.testNote(tx);
  console.log("Seeding testQuestion");
  await seeds.testQuestion(tx);
  console.log("Seeding testQuestionOption");
  await seeds.testQuestionOption(tx);
  console.log("Seeding testSubmission");
  await seeds.testSubmission(tx);
  console.log("Seeding testSubmissionAnswer");
  await seeds.testSubmissionAnswer(tx);
  console.log("Seeding testSubmissionResult");
  await seeds.testSubmissionResult(tx);
  return true;
});

result ? console.log("Seeding completed") : console.log("Seeding failed");

const connection = db.$client;
connection.end();
