/*
  Warnings:

  - Added the required column `updated_at` to the `UserEmail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `pdf_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserEmail" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pdf_summaries" ADD COLUMN     "summary" TEXT NOT NULL;
