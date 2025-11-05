import { type Transaction } from "..";
import { faculty } from "../schema";
import data from "./data/faculties.json";

export default async function seed(tx: Transaction) {
    await tx.insert(faculty).values(data);
}
