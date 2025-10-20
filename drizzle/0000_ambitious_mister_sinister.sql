CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TYPE "public"."permission_level_enum" AS ENUM('program', 'department', 'faculty', 'university', 'admin');--> statement-breakpoint
CREATE TYPE "public"."question_type_enum" AS ENUM('multiple_choice', 'single_choice', 'likert');--> statement-breakpoint
CREATE TYPE "public"."submission_status_enum" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"text" text NOT NULL,
	"value" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"question_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"text" text NOT NULL,
	"type" "question_type_enum" NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"npm" varchar NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"year" integer NOT NULL,
	"program" varchar NOT NULL,
	"faculty" varchar NOT NULL,
	"degree" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "students_npm_unique" UNIQUE("npm")
);
--> statement-breakpoint
CREATE TABLE "submission_results" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"submission_id" uuid NOT NULL,
	"test_id" integer NOT NULL,
	"result_value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_instructions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_notes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"test_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_submissions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"student_id" uuid NOT NULL,
	"test_id" integer NOT NULL,
	"status" "submission_status_enum" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" varchar NOT NULL,
	"password" text NOT NULL,
	"permission_level" "permission_level_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_selected_option_id_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_instructions" ADD CONSTRAINT "test_instructions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_notes" ADD CONSTRAINT "test_notes_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_parent_id_tests_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "npm_gin_idx" ON "students" USING gin ("npm" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "name_gin_idx" ON "students" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "name_btree_idx" ON "students" USING btree ("name");--> statement-breakpoint
CREATE INDEX "student_filters_idx" ON "students" USING btree ("program","faculty","year","degree");