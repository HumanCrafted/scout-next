-- AlterTable
ALTER TABLE "markers" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "marker_categories" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "backgroundColor" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marker_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marker_categories_teamId_name_key" ON "marker_categories"("teamId", "name");

-- AddForeignKey
ALTER TABLE "markers" ADD CONSTRAINT "markers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "marker_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marker_categories" ADD CONSTRAINT "marker_categories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
