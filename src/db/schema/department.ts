import { serial, text } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";

const department = assessmentSchema.table("department", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export default department;
