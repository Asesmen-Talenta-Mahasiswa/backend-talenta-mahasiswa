import { type Transaction } from "..";
import { testSubmissionResult } from "../schema";
import data from "./data/testSubmissionResults.json";

export default async function seed(tx: Transaction) {
  await tx.insert(testSubmissionResult).values(data);
}
