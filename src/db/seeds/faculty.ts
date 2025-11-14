import { type Transaction } from "..";
import { faculty } from "../schema";

type Faculty = typeof faculty.$inferInsert;

const data: Faculty[] = [
  {
    id: 1,
    name: "Other",
  },
  {
    id: 2,
    name: "Matematika Dan Ilmu Pengetahuan Alam",
  },
  {
    id: 3,
    name: "Ekonomi Dan Bisnis",
  },
  {
    id: 4,
    name: "Teknik",
  },
  {
    id: 5,
    name: "Hukum",
  },
  {
    id: 6,
    name: "Pascasarjana",
  },
  {
    id: 7,
    name: "Keguruan Dan Ilmu Pendidikan",
  },
  {
    id: 8,
    name: "Kedokteran",
  },
  {
    id: 9,
    name: "Ilmu Sosial Dan Ilmu Politik",
  },
  {
    id: 10,
    name: "Pertanian",
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(faculty).values(data);
}
