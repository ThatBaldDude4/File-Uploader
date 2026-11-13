/*
  Warnings:

  - Added the required column `original_name` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "original_name" TEXT NOT NULL;
