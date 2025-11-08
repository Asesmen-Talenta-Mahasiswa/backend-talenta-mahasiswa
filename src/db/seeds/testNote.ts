import { type Transaction } from "..";
import { testNote } from "../schema";
import data from "./data/testNotes.json";

export default async function seed(tx: Transaction) {
    await tx.insert(testNote).values(data);
}
