import { type Transaction } from "..";
import { degree } from "../schema";
import data from "./data/degrees.json";

export default async function seed(tx: Transaction) {
  await tx.insert(degree).values(data);
}
