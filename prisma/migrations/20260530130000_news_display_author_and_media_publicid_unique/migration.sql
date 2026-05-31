-- AlterTable
ALTER TABLE "NewsPost" ADD COLUMN "displayAuthor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");
