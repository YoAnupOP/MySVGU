-- CreateTable
CREATE TABLE "attendance_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "attendance_pct" DOUBLE PRECISION NOT NULL,
    "attended" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "subjects_json" TEXT NOT NULL,
    "student_name" TEXT,
    "last_synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_snapshots_user_id_key" ON "attendance_snapshots"("user_id");

-- AddForeignKey
ALTER TABLE "attendance_snapshots"
    ADD CONSTRAINT "attendance_snapshots_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
