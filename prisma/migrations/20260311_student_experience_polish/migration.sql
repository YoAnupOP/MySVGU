CREATE TYPE "VoteDirection" AS ENUM ('UP', 'DOWN');

CREATE TABLE "question_votes" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" "VoteDirection" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_votes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "answer_votes" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" "VoteDirection" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "answer_id" TEXT NOT NULL,
    "authored_by" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "question_votes_question_id_user_id_key" ON "question_votes"("question_id", "user_id");
CREATE UNIQUE INDEX "answer_votes_answer_id_user_id_key" ON "answer_votes"("answer_id", "user_id");
CREATE INDEX "question_votes_question_id_idx" ON "question_votes"("question_id");
CREATE INDEX "question_votes_user_id_idx" ON "question_votes"("user_id");
CREATE INDEX "answer_votes_answer_id_idx" ON "answer_votes"("answer_id");
CREATE INDEX "answer_votes_user_id_idx" ON "answer_votes"("user_id");
CREATE INDEX "comments_answer_id_idx" ON "comments"("answer_id");
CREATE INDEX "comments_authored_by_idx" ON "comments"("authored_by");

ALTER TABLE "question_votes"
    ADD CONSTRAINT "question_votes_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_votes"
    ADD CONSTRAINT "question_votes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answer_votes"
    ADD CONSTRAINT "answer_votes_answer_id_fkey"
    FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "answer_votes"
    ADD CONSTRAINT "answer_votes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments"
    ADD CONSTRAINT "comments_answer_id_fkey"
    FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments"
    ADD CONSTRAINT "comments_authored_by_fkey"
    FOREIGN KEY ("authored_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
