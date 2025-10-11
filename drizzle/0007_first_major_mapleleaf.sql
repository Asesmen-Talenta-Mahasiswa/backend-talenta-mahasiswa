ALTER TABLE "subtest_instructions" RENAME COLUMN "sub_test_id" TO "subtest_id";--> statement-breakpoint
ALTER TABLE "subtest_notes" RENAME COLUMN "sub_test_id" TO "subtest_id";--> statement-breakpoint
ALTER TABLE "subtest_instructions" DROP CONSTRAINT "subtest_instructions_sub_test_id_sub_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "subtest_notes" DROP CONSTRAINT "subtest_notes_sub_test_id_sub_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "subtest_instructions" ADD CONSTRAINT "subtest_instructions_subtest_id_sub_tests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtest_notes" ADD CONSTRAINT "subtest_notes_subtest_id_sub_tests_id_fk" FOREIGN KEY ("subtest_id") REFERENCES "public"."sub_tests"("id") ON DELETE cascade ON UPDATE no action;