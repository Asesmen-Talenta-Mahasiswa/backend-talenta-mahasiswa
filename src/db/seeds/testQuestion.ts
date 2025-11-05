import { type Transaction } from "..";
import { testQuestion } from "../schema";
import data from "./data/testQuestions.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testQuestion).values(data);
}
