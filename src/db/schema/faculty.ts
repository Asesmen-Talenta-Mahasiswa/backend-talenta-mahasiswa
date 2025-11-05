import { serial, text } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";

const faculty = assessmentSchema.table("faculty", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export default faculty;
