import { type Transaction } from "..";
import { major } from "../schema";
import data from "./data/majors.json";

export default async function seed(tx: Transaction) {
    await tx.insert(major).values(data);
}
