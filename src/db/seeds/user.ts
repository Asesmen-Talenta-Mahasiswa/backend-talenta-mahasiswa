import { type Transaction } from "..";
import { user } from "../schema";

type User = typeof user.$inferInsert;

const plainPassword = "password";
const hashedPassword = await Bun.password.hash(plainPassword);

const data: User[] = [
  {
    id: "01934a5a-7b8c-7000-8000-000000000001",
    username: "admin_user_01",
    password: hashedPassword,
    role: "admin",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000002",
    username: "admin_user_02",
    password: hashedPassword,
    role: "admin",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000003",
    username: "major_user_01",
    password: hashedPassword,
    role: "program_studi",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000004",
    username: "major_user_02",
    password: hashedPassword,
    role: "program_studi",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000005",
    username: "major_user_03",
    password: hashedPassword,
    role: "program_studi",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000006",
    username: "dept_user_01",
    password: hashedPassword,
    role: "jurusan",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000007",
    username: "dept_user_02",
    password: hashedPassword,
    role: "jurusan",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000008",
    username: "faculty_user_01",
    password: hashedPassword,
    role: "fakultas",
  },
  {
    id: "01934a5a-7b8c-7000-8000-000000000009",
    username: "faculty_user_02",
    password: hashedPassword,
    role: "fakultas",
  },
  {
    id: "01934a5a-7b8c-7000-8000-00000000000a",
    username: "univ_user_01",
    password: hashedPassword,
    role: "universitas",
  },
  // Student users
  {
    id: "01934a5a-7b8c-7000-8000-100000000001",
    username: "2501847293",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000002",
    username: "2539284756",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000003",
    username: "2587492631",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000004",
    username: "2541763948",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000005",
    username: "2593847562",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000006",
    username: "2574829316",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000007",
    username: "2568372941",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000008",
    username: "2582746195",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-100000000009",
    username: "2549173628",
    password: hashedPassword,
    role: "mahasiswa",
  },
  {
    id: "01934a5a-7b8c-7000-8000-10000000000a",
    username: "2591823457",
    password: hashedPassword,
    role: "mahasiswa",
  },
];

export default async function seed(tx: Transaction) {
  await tx.insert(user).values(data);
}
