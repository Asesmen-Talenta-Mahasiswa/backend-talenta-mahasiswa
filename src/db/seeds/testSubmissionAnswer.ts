import { type Transaction } from "..";
import { testSubmissionAnswer } from "../schema";
import data from "./data/testSubmissionAnswers.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testSubmissionAnswer).values(data);
}
