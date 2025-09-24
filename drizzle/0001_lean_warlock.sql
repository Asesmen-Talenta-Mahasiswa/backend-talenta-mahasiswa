CREATE TYPE "public"."career_category_enum" AS ENUM('praktisi', 'akademisi', 'pekerja_kreatif', 'wirausaha');--> statement-breakpoint
CREATE TYPE "public"."mbti_type_enum" AS ENUM('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P');--> statement-breakpoint
CREATE TYPE "public"."question_type_enum" AS ENUM('multiple_choice', 'single_choice', 'likert');--> statement-breakpoint
CREATE TYPE "public"."test_type_enum" AS ENUM('career_interest', 'mbti', 'pwb', 'stress_source');--> statement-breakpoint
CREATE TABLE "choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"title" text NOT NULL,
	"career_category" "career_category_enum",
	"mbti_type" "mbti_type_enum",
	"likert_value_min" integer DEFAULT 0,
	"likert_value_max" integer DEFAULT 5,
	"likert_value_label_min" varchar(100),
	"likert_value_label_max" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "question_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"type" "test_type_enum" NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;