CREATE TYPE "public"."career_field_result_enum" AS ENUM('very_suitable', 'quite_suitable', 'not_suitable');--> statement-breakpoint
CREATE TYPE "public"."pwb_result_enum" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."talent_result_enum" AS ENUM('analyst', 'diplomat', 'sentinel', 'explorer');--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_email_unique";--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "name" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "email" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "department" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "department" DROP NOT NULL;