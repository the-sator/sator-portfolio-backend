/*
  Warnings:

  - You are about to drop the column `name` on the `Blog` table. All the data in the column will be lost.
  - Added the required column `description` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_admin_id_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "name",
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "site_user_id" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "admin_id" DROP NOT NULL,
ALTER COLUMN "published_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
