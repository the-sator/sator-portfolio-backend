/*
  Warnings:

  - Added the required column `username` to the `SiteUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SiteUser" ADD COLUMN     "username" TEXT NOT NULL;
