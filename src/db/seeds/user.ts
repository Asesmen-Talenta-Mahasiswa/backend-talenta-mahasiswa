import { type Transaction } from "..";
import { user } from "../schema";
import data from "./data/users.json";

export default async function seed(tx: Transaction) {
    await tx.insert(user).values(data);
}
