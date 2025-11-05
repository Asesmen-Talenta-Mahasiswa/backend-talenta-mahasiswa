import { serial, text } from "drizzle-orm/pg-core";
import { assessmentSchema } from "../mySchema";

const enrollmentYear = assessmentSchema.table("enrollment_year", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
});

export default enrollmentYear;
