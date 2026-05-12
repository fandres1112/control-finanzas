-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_mes_ano_userId_key" ON "Budget"("mes", "ano", "userId");
