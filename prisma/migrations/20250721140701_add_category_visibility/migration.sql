-- Migration to add visibility toggle for marker categories
ALTER TABLE "marker_categories" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- All existing categories should be visible by default
UPDATE "marker_categories" SET "isVisible" = true;