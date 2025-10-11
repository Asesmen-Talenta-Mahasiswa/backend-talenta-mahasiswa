CREATE TABLE "subtest_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"sub_test_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtest_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"sub_test_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subtest_instructions" ADD CONSTRAINT "subtest_instructions_sub_test_id_sub_tests_id_fk" FOREIGN KEY ("sub_test_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtest_notes" ADD CONSTRAINT "subtest_notes_sub_test_id_sub_tests_id_fk" FOREIGN KEY ("sub_test_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;