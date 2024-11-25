-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "totp_key" BYTEA;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "two_factor_verified" BOOLEAN NOT NULL DEFAULT false;
