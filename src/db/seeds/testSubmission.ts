import { type Transaction } from "..";
import { testSubmission } from "../schema";

type TestSubmission = typeof testSubmission.$inferInsert;

export const data: TestSubmission[] = [
  {
    id: "019f60c7-5000-7000-8000-000000000001",
    studentId: "01934a5a-7b8c-7000-8000-000000000001",
    testId: 1,
    status: "in_progress",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000002",
    studentId: "01934a5a-7b8c-7000-8000-000000000002",
    testId: 1,
    status: "in_progress",
    createdAt: "2025-01-15T11:15:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000003",
    studentId: "01934a5a-7b8c-7000-8000-000000000003",
    testId: 1,
    status: "in_progress",
    createdAt: "2025-01-15T12:00:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000004",
    studentId: "01934a5a-7b8c-7000-8000-000000000004",
    testId: 1,
    status: "in_progress",
    createdAt: "2025-01-15T13:45:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000005",
    studentId: "01934a5a-7b8c-7000-8000-000000000005",
    testId: 1,
    status: "in_progress",
    createdAt: "2025-01-15T14:20:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000006",
    studentId: "01934a5a-7b8c-7000-8000-000000000006",
    testId: 1,
    status: "completed",
    createdAt: "2025-01-14T09:00:00Z",
    completedAt: "2025-01-14T10:45:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000007",
    studentId: "01934a5a-7b8c-7000-8000-000000000007",
    testId: 1,
    status: "completed",
    createdAt: "2025-01-14T10:30:00Z",
    completedAt: "2025-01-14T12:15:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000008",
    studentId: "01934a5a-7b8c-7000-8000-000000000008",
    testId: 1,
    status: "completed",
    createdAt: "2025-01-14T11:00:00Z",
    completedAt: "2025-01-14T13:20:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-000000000009",
    studentId: "01934a5a-7b8c-7000-8000-000000000009",
    testId: 1,
    status: "completed",
    createdAt: "2025-01-13T14:00:00Z",
    completedAt: "2025-01-13T15:50:00Z",
  },
  {
    id: "019f60c7-5000-7000-8000-00000000000a",
    studentId: "01934a5a-7b8c-7000-8000-00000000000a",
    testId: 1,
    status: "completed",
    createdAt: "2025-01-13T15:30:00Z",
    completedAt: "2025-01-13T17:10:00Z",
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(testSubmission).values(data);
}
