CREATE TYPE "public"."submission_status_enum" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"value" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"question_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"test_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"subtest_id" uuid NOT NULL,
	"result_value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"status" "submission_status_enum" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "likert_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "multiple_choice_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "results" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "single_choice_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "likert_options" CASCADE;--> statement-breakpoint
DROP TABLE "multiple_choice_options" CASCADE;--> statement-breakpoint
DROP TABLE "results" CASCADE;--> statement-breakpoint
DROP TABLE "single_choice_options" CASCADE;--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "title" TO "text";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "test_id" TO "subtest_id";--> statement-breakpoint
ALTER TABLE "tests" RENAME COLUMN "title" TO "name";--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_test_id_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_selected_option_id_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_tests" ADD CONSTRAINT "sub_tests_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_subtest_id_sub_tests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subtest_id_sub_tests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "tests" DROP COLUMN "created_at";--> statement-breakpoint
DROP TYPE "public"."career_category_enum";--> statement-breakpoint
DROP TYPE "public"."career_field_result_enum";--> statement-breakpoint
DROP TYPE "public"."mbti_dimension_enum";--> statement-breakpoint
DROP TYPE "public"."pwb_result_enum";--> statement-breakpoint
DROP TYPE "public"."talent_result_enum";--> statement-breakpoint
DROP TYPE "public"."test_type_enum";