-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "error_signature" TEXT NOT NULL,
    "dependency_name" TEXT NOT NULL,
    "version_number" TEXT NOT NULL,
    "code_fix" TEXT NOT NULL,
    "confidence_score" REAL NOT NULL DEFAULT 1.0,
    "is_deprecated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Migration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "old_solution_id" TEXT NOT NULL,
    "new_solution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Migration_old_solution_id_fkey" FOREIGN KEY ("old_solution_id") REFERENCES "Solution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Migration_new_solution_id_fkey" FOREIGN KEY ("new_solution_id") REFERENCES "Solution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solution_id" TEXT NOT NULL,
    "worked" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verification_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "Solution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
