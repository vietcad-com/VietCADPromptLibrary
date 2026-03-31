/*
  Warnings:

  - You are about to drop the column `content` on the `prompts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prompts" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "prompt_items" (
    "id" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "prompt_id" TEXT NOT NULL,

    CONSTRAINT "prompt_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prompt_items" ADD CONSTRAINT "prompt_items_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
