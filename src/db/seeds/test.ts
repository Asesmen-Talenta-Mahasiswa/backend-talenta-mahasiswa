import { type Transaction } from "..";
import { test } from "../schema";
import data from "./data/tests.json";

export default async function seed(tx: Transaction) {
    await tx.insert(test).values(data);
}
