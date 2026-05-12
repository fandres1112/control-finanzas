import prisma from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import DashboardClient from '@/components/DashboardClient'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { categoria?: string; tipo?: string; mes?: string; ano?: string }
}) {
  const { userId } = await auth()
  
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Acceso Denegado</h1>
          <p className="text-slate-600 dark:text-slate-400">Por favor inicia sesión para continuar.</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Filtros de Fecha (Mes/Año)
  const filterMes = searchParams.mes ? parseInt(searchParams.mes) : currentMonth
  const filterAno = searchParams.ano ? parseInt(searchParams.ano) : currentYear

  // Rango de fechas para el mes seleccionado
  const startOfMonth = new Date(filterAno, filterMes - 1, 1)
  const endOfMonth = new Date(filterAno, filterMes, 0)

  // Filtros de Historial
  const filterCategoria = searchParams.categoria
  const filterTipo = searchParams.tipo

  // Buscar transacciones del mes seleccionado para el resumen y gráficos
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      fecha: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: { fecha: 'desc' },
  })

  // Buscar todas las transacciones del usuario (para el historial filtrado)
  const allTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      AND: [
        filterCategoria ? { categoria: filterCategoria } : {},
        filterTipo ? { tipo: filterTipo } : {},
        (!filterCategoria && !filterTipo) ? {
          fecha: {
            gte: startOfMonth,
            lte: endOfMonth,
          }
        } : {},
      ],
    },
    orderBy: { fecha: 'desc' },
  })

  // Buscar presupuesto del mes seleccionado
  const budget = await prisma.budget.findUnique({
    where: {
      mes_ano_userId: {
        mes: filterMes,
        ano: filterAno,
        userId,
      },
    },
  })

  // Buscar transacciones recurrentes
  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: { userId },
    orderBy: { dia: 'asc' },
  })

  // Cálculos de por vida (Balance Total) del usuario
  const userAllTransactions = await prisma.transaction.findMany({ where: { userId } })
  const balanceTotal = userAllTransactions.reduce((acc, t) => {
    return t.tipo === 'Ingreso' ? acc + t.monto : acc - t.monto
  }, 0)

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Componente de Cliente para la interactividad */}
        <DashboardClient 
          initialAllTransactions={allTransactions}
          initialMonthTransactions={monthTransactions}
          balanceTotal={balanceTotal}
          budget={budget}
          recurringTransactions={recurringTransactions}
          filterMes={filterMes}
          filterAno={filterAno}
          meses={meses}
        />
      </div>
    </main>
  )
}
