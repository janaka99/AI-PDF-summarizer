/*
  Warnings:

  - You are about to drop the column `price_id` on the `Payment` table. All the data in the column will be lost.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `amount` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'canceled');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "price_id",
DROP COLUMN "amount",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "stripe_payment_id" DROP NOT NULL;
