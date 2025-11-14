import { randomUUIDv7 } from "bun";
import { type Transaction } from "..";
import { testNote } from "../schema";

type TestNote = typeof testNote.$inferInsert;

function generateData(): TestNote[] {
  return [
    {
      id: randomUUIDv7(),
      text: "Total terdapat 12 situasi yang akan kamu hadapi.",
      order: 0,
      testId: 4,
    },
    {
      id: randomUUIDv7(),
      text: "Pilihlah respon yang paling 'aku banget'.",
      order: 1,
      testId: 4,
    },
    {
      id: randomUUIDv7(),
      text: "Semakin jujur jawabanmu, semakin akurat hasil yang akan kamu peroleh.",
      order: 2,
      testId: 4,
    },
    {
      id: randomUUIDv7(),
      text: "Total terdapat 28 situasi yang akan kamu hadapi.",
      order: 0,
      testId: 5,
    },
    {
      id: randomUUIDv7(),
      text: "Jika merasa kedua pilihan kurang sesuai, tetap pilih salah satu yang paling mendekati dirimu.",
      order: 1,
      testId: 5,
    },
    {
      id: randomUUIDv7(),
      text: "Tidak ada jawaban benar atau salah, semua menggambarkan keunikanmu.",
      order: 2,
      testId: 5,
    },
  ];
}

export default async function seed(tx: Transaction) {
  await tx.insert(testNote).values(generateData());
}
