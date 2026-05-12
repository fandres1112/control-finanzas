-- AlterTable
ALTER TABLE "RecurringTransaction" ALTER COLUMN "descripcion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "descripcion" DROP NOT NULL;
