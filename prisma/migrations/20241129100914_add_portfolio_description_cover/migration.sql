/*
  Warnings:

  - Added the required column `cover_url` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "cover_url" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;
