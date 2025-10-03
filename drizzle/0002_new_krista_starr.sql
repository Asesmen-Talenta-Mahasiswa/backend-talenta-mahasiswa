ALTER TYPE "public"."mbti_type_enum" RENAME TO "mbti_dimension_enum";--> statement-breakpoint
CREATE TABLE "likert_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"title" text NOT NULL,
	"likert_value_min" integer DEFAULT 1,
	"likert_value_max" integer DEFAULT 5,
	"likert_value_label_min" text,
	"likert_value_label_max" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "multiple_choice_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"title" text NOT NULL,
	"career_category" "career_category_enum",
	"mbti_type" "mbti_dimension_enum",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"career_category" "career_category_enum" NOT NULL,
	"mbti_type" varchar(4) NOT NULL,
	"pwb_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "single_choice_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"title" text NOT NULL,
	"career_category" "career_category_enum",
	"mbti_type" "mbti_dimension_enum",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"npm" char(10) NOT NULL,
	"email" varchar(100) NOT NULL,
	"program" "program_enum" NOT NULL,
	"department" varchar(100) NOT NULL,
	"faculty" "faculty_enum" NOT NULL,
	"degree" "degree_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_npm_unique" UNIQUE("npm"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "choices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "choices" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_npm_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "permission_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."permission_level_enum";--> statement-breakpoint
CREATE TYPE "public"."permission_level_enum" AS ENUM('program', 'department', 'faculty', 'university', 'admin');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "permission_level" SET DATA TYPE "public"."permission_level_enum" USING "permission_level"::"public"."permission_level_enum";--> statement-breakpoint
ALTER TABLE "likert_options" ADD CONSTRAINT "likert_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multiple_choice_options" ADD CONSTRAINT "multiple_choice_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "single_choice_options" ADD CONSTRAINT "single_choice_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "npm";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "program";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "faculty";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "degree";