import { randomUUIDv7 } from "bun";
import { type Transaction } from "..";
import { testInstruction } from "../schema";

type TestInstruction = typeof testInstruction.$inferInsert;

function generateData(): TestInstruction[] {
  return [
    {
      id: randomUUIDv7(),
      text: "Pilih 1 respon yang paling kamu sukai atau paling mungkin kamu lakukan dari 4 pilihan respon yang tersedia di setiap situasi.",
      order: 0,
      testId: 4,
    },
    {
      id: randomUUIDv7(),
      text: "Tentukan pilihan yang paling sesuai dengan karakteristik dan kebiasaanmu dari 2 opsi jawaban yang tersedia di setiap situasi.",
      order: 0,
      testId: 5,
    },
    {
      id: randomUUIDv7(),
      text: "Cermati setiap pernyataan dan renungkan seberapa cocok pernyataan tersebut dengan kondisi dirimu saat ini.",
      order: 0,
      testId: 6,
    },
    {
      id: randomUUIDv7(),
      text: "Jika pernyataan sangat sesuai, pilih angka 5 (iya banget).",
      order: 1,
      testId: 6,
    },
    {
      id: randomUUIDv7(),
      text: "Jika pernyataan tidak sesuai, pilih angka 1 (nggak juga).",
      order: 2,
      testId: 6,
    },
    {
      id: randomUUIDv7(),
      text: "Pilih angka di antara 1-5 sesuai dengan tingkat kesesuaianmu.",
      order: 3,
      testId: 6,
    },
  ];
}

export default async function seed(tx: Transaction) {
  await tx.insert(testInstruction).values(generateData());
}
