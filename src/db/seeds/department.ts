import { type Transaction } from "..";
import { department } from "../schema";
import data from "./data/departments.json";

export default async function seed(tx: Transaction) {
    await tx.insert(department).values(data);
}
