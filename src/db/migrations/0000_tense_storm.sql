CREATE SCHEMA "assessment";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "assessment"."department" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "faculty_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "assessment"."institution" (
	"id" uuid PRIMARY KEY NOT NULL,
	"id_sp" uuid,
	"id_sms" uuid,
	"id_fak_unila" uuid,
	"id_jur_unila" uuid,
	"id_induk_sms" uuid,
	"id_jns_sms" text,
	"id_wil" text,
	"nm_jns_sms" text,
	"nm_lemb" text,
	"kode_prodi" text,
	"nm_jenj_didik" text
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
	"gender" text NOT NULL,
	"degree" text NOT NULL,
	"enrollment_year" text NOT NULL,
	"has_taken_test" boolean DEFAULT false NOT NULL,
	"user_id" uuid NOT NULL,
	"major_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "student_npm_unique" UNIQUE("npm"),
	CONSTRAINT "student_user_id_unique" UNIQUE("user_id")
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
	"completed_at" timestamp
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
	"result" jsonb NOT NULL,
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
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "assessment"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_major_id_major_id_fk" FOREIGN KEY ("major_id") REFERENCES "assessment"."major"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "assessment"."department"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment"."student" ADD CONSTRAINT "student_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "assessment"."faculty"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "department_name_idx" ON "assessment"."department" USING btree ("name");--> statement-breakpoint
CREATE INDEX "faculty_name_idx" ON "assessment"."faculty" USING btree ("name");--> statement-breakpoint
CREATE INDEX "institution_nm_lemb_idx" ON "assessment"."institution" USING btree ("nm_lemb");--> statement-breakpoint
CREATE INDEX "institution_id_sms_idx" ON "assessment"."institution" USING btree ("id_sms");--> statement-breakpoint
CREATE INDEX "institution_id_fak_unila_idx" ON "assessment"."institution" USING btree ("id_fak_unila");--> statement-breakpoint
CREATE INDEX "institution_id_jur_unila_idx" ON "assessment"."institution" USING btree ("id_jur_unila");--> statement-breakpoint
CREATE INDEX "major_name_idx" ON "assessment"."major" USING btree ("name");--> statement-breakpoint
CREATE INDEX "students_name_trgm_idx" ON "assessment"."student" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "students_major_idx" ON "assessment"."student" USING btree ("major_id");--> statement-breakpoint
CREATE INDEX "students_user_idx" ON "assessment"."student" USING btree ("major_id");--> statement-breakpoint
CREATE INDEX "students_department_idx" ON "assessment"."student" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "students_faculty_idx" ON "assessment"."student" USING btree ("faculty_id");--> statement-breakpoint
CREATE INDEX "students_enrollment_year_idx" ON "assessment"."student" USING btree ("enrollment_year");--> statement-breakpoint
CREATE INDEX "students_gender_idx" ON "assessment"."student" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "students_degree_idx" ON "assessment"."student" USING btree ("degree");--> statement-breakpoint
CREATE INDEX "test_name_gin_idx" ON "assessment"."test" USING gin ("name" gin_trgm_ops);
