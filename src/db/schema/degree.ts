import { serial, text } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";

const degree = assessmentSchema.table("degree", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export default degree;
