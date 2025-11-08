import { type Transaction } from "..";
import { student } from "../schema";
import data from "./data/students.json";

export default async function seed(tx: Transaction) {
    await tx.insert(student).values(data);
}
