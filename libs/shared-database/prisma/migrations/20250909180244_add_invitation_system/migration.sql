/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invitationId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `passwordHash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."AccessLevel" AS ENUM ('PUBLIC', 'RESTRICTED', 'INTERNAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "public"."UserRole" ADD VALUE 'DEVELOPER';

-- DropIndex
DROP INDEX "public"."users_walletAddress_key";

-- AlterTable
-- First add columns with defaults to handle existing data
ALTER TABLE "public"."users" 
ADD COLUMN "firstName" TEXT DEFAULT 'Unknown',
ADD COLUMN "lastName" TEXT DEFAULT 'User',
ADD COLUMN "invitationId" TEXT;

-- Update existing users with split names from existing 'name' column
UPDATE "public"."users" 
SET "firstName" = CASE 
    WHEN "name" IS NOT NULL AND position(' ' in "name") > 0 
    THEN trim(split_part("name", ' ', 1))
    ELSE 'Unknown'
END,
"lastName" = CASE 
    WHEN "name" IS NOT NULL AND position(' ' in "name") > 0 
    THEN trim(substring("name" from position(' ' in "name") + 1))
    ELSE 'User'
END
WHERE "name" IS NOT NULL;

-- Drop defaults and make required
ALTER TABLE "public"."users" 
ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- Drop old columns
ALTER TABLE "public"."users" 
DROP COLUMN "emailVerified",
DROP COLUMN "name",
DROP COLUMN "walletAddress",
ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "public"."invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_email_status_key" ON "public"."invitations"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_invitationId_key" ON "public"."users"("invitationId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "public"."invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
