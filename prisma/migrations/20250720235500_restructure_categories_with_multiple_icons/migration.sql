-- Restructure marker categories to support multiple icons per category

-- Create the new CategoryIcon table
CREATE TABLE "category_icons" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "backgroundColor" TEXT,
    "isNumbered" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_icons_pkey" PRIMARY KEY ("id")
);

-- Add categoryIconId to markers table
ALTER TABLE "markers" ADD COLUMN "categoryIconId" TEXT;

-- Create unique constraint for category icons
CREATE UNIQUE INDEX "category_icons_categoryId_name_key" ON "category_icons"("categoryId", "name");

-- Add foreign key constraints
ALTER TABLE "category_icons" ADD CONSTRAINT "category_icons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "marker_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "markers" ADD CONSTRAINT "markers_categoryIconId_fkey" FOREIGN KEY ("categoryIconId") REFERENCES "category_icons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing category data to icons
-- For each existing category, create a single icon
INSERT INTO "category_icons" ("id", "categoryId", "name", "icon", "backgroundColor", "isNumbered", "displayOrder", "createdAt", "updatedAt")
SELECT 
    CONCAT('icon_', mc."id") as id,
    mc."id" as "categoryId",
    CASE 
        WHEN mc."name" = 'Locations' THEN 'Areas'
        ELSE mc."name"
    END as name,
    mc."icon",
    mc."backgroundColor",
    CASE 
        WHEN mc."name" = 'Locations' THEN true
        ELSE false
    END as "isNumbered",
    0 as "displayOrder",
    mc."createdAt",
    mc."updatedAt"
FROM "marker_categories" mc
WHERE mc."icon" IS NOT NULL;

-- Update existing markers to reference the new icon
UPDATE "markers" 
SET "categoryIconId" = CONCAT('icon_', "categoryId")
WHERE "categoryId" IS NOT NULL
  AND "categoryId" IN (SELECT "id" FROM "marker_categories" WHERE "icon" IS NOT NULL);

-- Update category names from 'Locations' to 'Areas'
UPDATE "marker_categories" 
SET "name" = 'Areas' 
WHERE "name" = 'Locations';

-- Remove the old columns from marker_categories
ALTER TABLE "marker_categories" DROP COLUMN "icon";
ALTER TABLE "marker_categories" DROP COLUMN "backgroundColor";