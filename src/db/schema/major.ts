import { serial, text } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";

const major = assessmentSchema.table("major", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export default major;
