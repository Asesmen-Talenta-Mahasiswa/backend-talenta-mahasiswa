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
  schema.department,
  schema.faculty,
  schema.major,
  schema.student,
  schema.test,
  schema.testInstruction,
  schema.testNote,
  schema.testQuestion,
  schema.testQuestionOption,
  schema.testSubmission,
  schema.testSubmissionAnswer,
  schema.testSubmissionResult,
  schema.user,
]) {
  await db.execute(
    sql.raw(
      `TRUNCATE TABLE "assessment"."${getTableName(table)}" RESTART IDENTITY CASCADE`,
    ),
  );
}

console.log("Seeding tables...");
const result = await db.transaction(async (tx) => {
  console.log("Seeding degree");
  await seeds.department(tx);
  await seeds.faculty(tx);
  await seeds.major(tx);
  await seeds.student(tx);
  await seeds.test(tx);
  await seeds.testInstruction(tx);
  await seeds.testNote(tx);
  await seeds.testQuestion(tx);
  await seeds.testQuestionOption(tx);
  await seeds.testSubmission(tx);
  await seeds.testSubmissionAnswer(tx);
  await seeds.testSubmissionResult(tx);
  await seeds.user(tx);
  return true;
});

result ? console.log("Seeding completed") : console.log("Seeding failed");

const connection = db.$client;
connection.end();
