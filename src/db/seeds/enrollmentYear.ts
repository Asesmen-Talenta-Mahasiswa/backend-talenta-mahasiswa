import { type Transaction } from "..";
import { enrollmentYear } from "../schema";
import data from "./data/enrollmentYears.json";

export default async function seed(tx: Transaction) {
    await tx.insert(enrollmentYear).values(data);
}
