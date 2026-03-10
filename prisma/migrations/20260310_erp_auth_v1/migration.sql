CREATE TABLE "erp_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_ciphertext" TEXT NOT NULL,
    "last_verified_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "erp_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "erp_credentials_user_id_key" ON "erp_credentials"("user_id");

ALTER TABLE "erp_credentials"
ADD CONSTRAINT "erp_credentials_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
