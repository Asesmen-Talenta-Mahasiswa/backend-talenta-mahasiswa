import { type Transaction } from "..";
import { testQuestionOption } from "../schema";
import data from "./data/testQuestionOptions.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testQuestionOption).values(data);
}
