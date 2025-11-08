import { type Transaction } from "..";
import { testSubmission } from "../schema";
import data from "./data/testSubmissions.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testSubmission).values(data);
}
