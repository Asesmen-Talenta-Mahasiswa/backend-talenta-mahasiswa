import { randomUUIDv7 } from "bun";
import { type Transaction } from "..";
import { testSubmissionAnswer } from "../schema";
import { data as testSubmissionData } from "./testSubmission";
import { data as testQuestionData } from "./testQuestion";
import { data as testQuestionOptionData } from "./testQuestionOption";

type TestSubmissionAnswer = typeof testSubmissionAnswer.$inferInsert;

export default async function seed(tx: Transaction) {
  // Helper function to get random option for a question
  function getRandomOptionForQuestion(questionId: string): string {
    const options = testQuestionOptionData.filter(
      (opt) => opt.testQuestionId === questionId,
    );
    if (options.length === 0) {
      throw new Error(`No options found for question ${questionId}`);
    }
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex].id!;
  }

  // Get all questions for testId 4, 5, and 6 (children of test 1)
  const allQuestions = testQuestionData.filter((q) =>
    [4, 5, 6].includes(q.testId),
  );

  // Sort questions by testId and order for consistent processing
  const sortedQuestions = [...allQuestions].sort((a, b) => {
    if (a.testId !== b.testId) return a.testId - b.testId;
    return a.order - b.order;
  });

  const data: TestSubmissionAnswer[] = [];

  // Generate answers for each submission
  testSubmissionData.forEach((submission) => {
    const isCompleted = submission.status === "completed";

    // For completed: answer all questions
    // For in_progress: answer only half of the questions
    const questionsToAnswer = isCompleted
      ? sortedQuestions
      : sortedQuestions.slice(0, Math.floor(sortedQuestions.length / 2));

    questionsToAnswer.forEach((question) => {
      const selectedOptionId = getRandomOptionForQuestion(question.id!);

      data.push({
        id: randomUUIDv7(),
        testSubmissionId: submission.id!,
        testQuestionId: question.id!,
        selectedOptionId: selectedOptionId,
      });
    });
  });

  await tx.insert(testSubmissionAnswer).values(data);
}
