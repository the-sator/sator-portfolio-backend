/*
  Warnings:

  - You are about to drop the column `email` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `totp_key` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `like` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `SiteUser` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `SiteUser` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `SiteUser` table. All the data in the column will be lost.
  - You are about to drop the column `totp_key` on the `SiteUser` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totp_key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `SiteUserSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth_id]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auth_id]` on the table `SiteUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auth_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_id` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_id` to the `SiteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SiteUserSession" DROP CONSTRAINT "SiteUserSession_site_user_id_fkey";

-- DropIndex
DROP INDEX "Admin_email_key";

-- DropIndex
DROP INDEX "SiteUser_email_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "email",
DROP COLUMN "last_login",
DROP COLUMN "password",
DROP COLUMN "totp_key",
ADD COLUMN     "auth_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "like";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "site_user_id" TEXT;

-- AlterTable
ALTER TABLE "SiteUser" DROP COLUMN "email",
DROP COLUMN "last_login",
DROP COLUMN "password",
DROP COLUMN "totp_key",
ADD COLUMN     "auth_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "last_login",
DROP COLUMN "password",
DROP COLUMN "totp_key",
ADD COLUMN     "auth_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "SiteUserSession";

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "totp_key" BYTEA,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogMetric" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "blog_id" TEXT NOT NULL,
    "view" BIGINT NOT NULL,

    CONSTRAINT "BlogMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_auth_id_key" ON "Admin"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "SiteUser_auth_id_key" ON "SiteUser"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_id_key" ON "User"("auth_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogMetric" ADD CONSTRAINT "BlogMetric_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
