import { type Transaction } from "..";
import { testInstruction } from "../schema";
import data from "./data/testInstructions.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testInstruction).values(data);
}
