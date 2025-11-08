CREATE SCHEMA IF NOT EXISTS assessment;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "assessment"."degree" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "degree_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."department" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."enrollment_year" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "enrollment_year_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "faculty_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."major" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "major_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."student" (
	"id" uuid PRIMARY KEY NOT NULL,
	"npm" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"enrollment_year_id" integer NOT NULL,
	"major_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"degree_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "student_npm_unique" UNIQUE("npm")
);
--> statement-breakpoint
CREATE TABLE "assessment"."test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_instruction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"order" integer NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_note" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"order" integer NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_question" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"order" integer NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_question_option" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"value" text NOT NULL,
	"order" integer NOT NULL,
	"test_question_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_submission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"test_id" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "test_submission_main_test_only" CHECK (EXISTS (
        SELECT 1 FROM "assessment".test
        WHERE "assessment".test.id = "assessment"."test_submission"."test_id"
        AND "assessment".test.parent_id IS NULL
      ))
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_submission_answer" (
	"id" uuid PRIMARY KEY NOT NULL,
	"test_submission_id" uuid NOT NULL,
	"test_question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."test_submission_result" (
	"id" uuid PRIMARY KEY NOT NULL,
	"test_submission_id" uuid,
	"test_id" integer,
	"result" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment"."user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_enrollment_year_id_enrollment_year_id_fk" FOREIGN KEY ("enrollment_year_id") REFERENCES "assessment"."enrollment_year"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "assessment"."major"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "assessment"."faculty"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_degree_id_degree_id_fk" FOREIGN KEY ("degree_id") REFERENCES "assessment"."degree"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test" ADD CONSTRAINT "test_parent_id_test_id_fk" FOREIGN KEY ("parent_id") REFERENCES "assessment"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_instruction" ADD CONSTRAINT "test_instruction_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "assessment"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_note" ADD CONSTRAINT "test_note_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "assessment"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_question" ADD CONSTRAINT "test_question_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "assessment"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_question_option" ADD CONSTRAINT "test_question_option_test_question_id_test_question_id_fk" FOREIGN KEY ("test_question_id") REFERENCES "assessment"."test_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission" ADD CONSTRAINT "test_submission_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "assessment"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission" ADD CONSTRAINT "test_submission_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "assessment"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission_answer" ADD CONSTRAINT "test_submission_answer_test_submission_id_test_submission_id_fk" FOREIGN KEY ("test_submission_id") REFERENCES "assessment"."test_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission_answer" ADD CONSTRAINT "test_submission_answer_test_question_id_test_question_id_fk" FOREIGN KEY ("test_question_id") REFERENCES "assessment"."test_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission_answer" ADD CONSTRAINT "test_submission_answer_selected_option_id_test_question_option_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "assessment"."test_question_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission_result" ADD CONSTRAINT "test_submission_result_test_submission_id_test_submission_id_fk" FOREIGN KEY ("test_submission_id") REFERENCES "assessment"."test_submission"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."test_submission_result" ADD CONSTRAINT "test_submission_result_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "assessment"."test"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "students_name_trgm_idx" ON "assessment"."student" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "students_enrollment_year_idx" ON "assessment"."student" USING btree ("enrollment_year_id");--> statement-breakpoint
CREATE INDEX "students_major_idx" ON "assessment"."student" USING btree ("major_id");--> statement-breakpoint
CREATE INDEX "students_faculty_idx" ON "assessment"."student" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "students_degree_idx" ON "assessment"."student" USING btree ("degree_id");--> statement-breakpoint
CREATE INDEX "test_name_gin_idx" ON "assessment"."test" USING gin ("name" gin_trgm_ops);
