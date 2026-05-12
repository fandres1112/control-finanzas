-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recurringId" INTEGER;

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);
