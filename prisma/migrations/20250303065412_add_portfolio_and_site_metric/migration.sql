/*
  Warnings:

  - You are about to drop the column `view` on the `Blog` table. All the data in the column will be lost.
  - You are about to alter the column `view` on the `BlogMetric` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "view";

-- AlterTable
ALTER TABLE "BlogMetric" ALTER COLUMN "view" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "PortfolioMetric" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "view" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PortfolioMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteMetric" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "site_user_id" TEXT NOT NULL,
    "view" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SiteMetric_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PortfolioMetric" ADD CONSTRAINT "PortfolioMetric_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteMetric" ADD CONSTRAINT "SiteMetric_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
