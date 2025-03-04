/*
  Warnings:

  - You are about to drop the column `username` on the `SiteUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[link]` on the table `SiteUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key]` on the table `SiteUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `api_key` to the `SiteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `SiteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SiteUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website_name` to the `SiteUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SiteUser" DROP CONSTRAINT "SiteUser_auth_id_fkey";

-- DropIndex
DROP INDEX "SiteUser_username_key";

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "github_link" TEXT,
ADD COLUMN     "preview_link" TEXT,
ADD COLUMN     "view" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SiteUser" DROP COLUMN "username",
ADD COLUMN     "api_key" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "registered_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "website_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SiteUser_link_key" ON "SiteUser"("link");

-- CreateIndex
CREATE UNIQUE INDEX "SiteUser_api_key_key" ON "SiteUser"("api_key");

-- AddForeignKey
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
