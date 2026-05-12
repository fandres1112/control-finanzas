'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createTransaction, deleteTransaction, applyRecurringTransactions, deleteRecurringTransaction, setBudget } from '@/app/actions'
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Wallet, Target, Trash2, Repeat } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import MonthlyChart from '@/components/MonthlyChart'
import TransactionForm from '@/components/TransactionForm'

const CATEGORY_COLORS: { [key: string]: string } = {
  Comida: '#f59e0b',
  Transporte: '#3b82f6',
  Entretenimiento: '#ec4899',
  Salud: '#10b981',
  Vivienda: '#8b5cf6',
  Sueldo: '#10b981',
  Deuda: '#ef4444',
  Otros: '#64748b',
}

const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

interface Transaction {
  id: number
  monto: number
  descripcion: string | null
  tipo: string
  categoria: string
  fecha: Date
  recurringId: number | null
}

interface Budget {
  monto: number
}

interface RecurringTransaction {
  id: number
  monto: number
  descripcion: string | null
  tipo: string
  categoria: string
  dia: number
}

interface DashboardClientProps {
  initialAllTransactions: Transaction[]
  initialMonthTransactions: Transaction[]
  balanceTotal: number
  budget: Budget | null
  recurringTransactions: RecurringTransaction[]
  filterMes: number
  filterAno: number
  meses: string[]
}

export default function DashboardClient({
  initialAllTransactions,
  initialMonthTransactions,
  balanceTotal,
  budget,
  recurringTransactions,
  filterMes,
  filterAno,
  meses,
}: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentYear = new Date().getFullYear()

  // Estado Optimista para el historial completo
  const [optimisticAllTransactions, addOptimisticAllTransaction] = useOptimistic(
    initialAllTransactions,
    (state, action: { type: 'ADD' | 'DELETE'; payload: any }) => {
      if (action.type === 'ADD') {
        return [action.payload, ...state]
      }
      if (action.type === 'DELETE') {
        return state.filter((t) => t.id !== action.payload)
      }
      return state
    }
  )

  // Estado Optimista para las transacciones del mes
  const [optimisticMonthTransactions, addOptimisticMonthTransaction] = useOptimistic(
    initialMonthTransactions,
    (state, action: { type: 'ADD' | 'DELETE'; payload: any }) => {
      if (action.type === 'ADD') {
        return [action.payload, ...state]
      }
      if (action.type === 'DELETE') {
        return state.filter((t) => t.id !== action.payload)
      }
      return state
    }
  )

  // Cálculos del mes
  const ingresosMes = optimisticMonthTransactions
    .filter((t) => t.tipo === 'Ingreso')
    .reduce((acc, t) => acc + t.monto, 0)

  const gastosMes = optimisticMonthTransactions
    .filter((t) => t.tipo === 'Gasto')
    .reduce((acc, t) => acc + t.monto, 0)

  const presupuestoMonto = budget?.monto || 0
  const porcentajePresupuesto = presupuestoMonto > 0 ? Math.min((gastosMes / presupuestoMonto) * 100, 100) : 0

  const gastosPorCategoria = optimisticMonthTransactions
    .filter((t) => t.tipo === 'Gasto')
    .reduce((acc: { [key: string]: number }, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto
      return acc
    }, {})

  const totalGastosMes = Object.values(gastosPorCategoria).reduce((acc, v) => acc + v, 0)

  let gradientString = ''
  let accumulatedPercentage = 0
  if (totalGastosMes > 0) {
    const segments = Object.entries(gastosPorCategoria).map(([cat, amount]) => {
      const percentage = (amount / totalGastosMes) * 100
      const color = CATEGORY_COLORS[cat] || '#cbd5e1'
      const start = accumulatedPercentage
      accumulatedPercentage += percentage
      return `${color} ${start.toFixed(2)}% ${accumulatedPercentage.toFixed(2)}%`
    })
    gradientString = `conic-gradient(${segments.join(', ')})`
  } else {
    gradientString = `conic-gradient(#e2e8f0 0% 100%)`
  }

  const daysInMonth = new Date(filterAno, filterMes, 0).getDate()
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: 0,
  }))

  optimisticMonthTransactions
    .filter((t) => t.tipo === 'Gasto')
    .forEach((t) => {
      const day = new Date(t.fecha).getDate()
      dailyData[day - 1].amount += t.monto
    })

  // Manejador para eliminar transacciones optimistas
  const handleDelete = async (id: number, fecha: Date) => {
    const isCurrentMonth = new Date(fecha).getMonth() + 1 === filterMes && new Date(fecha).getFullYear() === filterAno

    startTransition(async () => {
      addOptimisticAllTransaction({ type: 'DELETE', payload: id })
      if (isCurrentMonth) {
        addOptimisticMonthTransaction({ type: 'DELETE', payload: id })
      }
      
      const formData = new FormData()
      formData.append('id', id.toString())
      await deleteTransaction(formData)
    })
  }

  // Manejador para los filtros (Evita recarga completa)
  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const mes = formData.get('mes')
    const ano = formData.get('ano')
    const tipo = formData.get('tipo')
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (mes) params.set('mes', mes.toString())
    if (ano) params.set('ano', ano.toString())
    if (tipo !== null) {
      if (tipo) params.set('tipo', tipo.toString())
      else params.delete('tipo')
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Movido Aquí para controlar el submit */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Control de Finanzas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona y analiza tus gastos e ingresos</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Selector de Mes/Año con SPA navigation */}
          <form onSubmit={handleFilterSubmit} className="flex gap-2 w-full md:w-auto">
            <select 
              name="mes" 
              defaultValue={filterMes}
              className="flex-1 md:flex-none p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
            >
              {meses.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select 
              name="ano" 
              defaultValue={filterAno}
              className="flex-1 md:flex-none p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg text-sm font-medium transition-colors">
              Consultar
            </button>
          </form>

          <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-700">
            <UserButton afterSignOutUrl="/" />
            <div className="hidden md:block text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-200">Mi Cuenta</p>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Resumen y Formularios */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm opacity-80">Saldo Total (Histórico)</p>
              <Wallet className="w-5 h-5 opacity-80" />
            </div>
            <h2 className="text-3xl font-bold mt-1">{formatCOP(balanceTotal)}</h2>
            
            <div className="flex justify-between mt-6 pt-4 border-t border-indigo-500">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 opacity-80" />
                <div>
                  <p className="text-xs opacity-75">Ingresos {meses[filterMes - 1]}</p>
                  <p className="font-semibold text-sm">{formatCOP(ingresosMes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 opacity-80" />
                <div>
                  <p className="text-xs opacity-75">Gastos {meses[filterMes - 1]}</p>
                  <p className="font-semibold text-sm">{formatCOP(gastosMes)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Entry Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Nueva Transacción</h3>
            <TransactionForm />
            
            {/* Botón para aplicar recurrentes */}
            <form action={applyRecurringTransactions} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <input type="hidden" name="mes" value={filterMes.toString()} />
              <input type="hidden" name="ano" value={filterAno.toString()} />
              <button 
                type="submit" 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Repeat className="w-5 h-5 text-slate-600" />
                Aplicar Recurrentes del Mes
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Genera las transacciones de este mes basadas en tus registros recurrentes.
              </p>
            </form>
          </div>

          {/* Lista de Recurrencias */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-indigo-500" />
              Tus Recurrencias
            </h3>
            
            <div className="space-y-4 max-h-48 overflow-y-auto">
              {recurringTransactions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tienes recurrencias programadas.</p>
              ) : (
                recurringTransactions.map((rt) => (
                  <div key={rt.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${rt.tipo === 'Ingreso' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {rt.tipo === 'Ingreso' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{rt.descripcion || 'Sin descripción'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Día {rt.dia} • {rt.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-semibold ${rt.tipo === 'Ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCOP(rt.monto)}
                      </p>
                      <form action={deleteRecurringTransaction}>
                        <input type="hidden" name="id" value={rt.id.toString()} />
                        <button type="submit" className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar Recurrencia">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna 2: Gráficos y Listas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presupuesto */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Presupuesto {meses[filterMes - 1]}
              </h3>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {formatCOP(gastosMes)} / {formatCOP(presupuestoMonto)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all ${porcentajePresupuesto > 90 ? 'bg-red-500' : porcentajePresupuesto > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${porcentajePresupuesto}%` }}
              ></div>
          </div>
            
            <form action={setBudget} className="flex gap-2">
              <input type="hidden" name="mes" value={filterMes.toString()} />
              <input type="hidden" name="ano" value={filterAno.toString()} />
              <input 
                type="number" 
                name="monto" 
                placeholder="Ajustar presupuesto"
                className="flex-1 p-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 rounded-lg transition-colors"
              >
                Definir
              </button>
            </form>
          </div>

          {/* Gráfico de Progreso Mensual */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Progreso Diario de Gastos ({meses[filterMes - 1]})</h3>
            <MonthlyChart data={dailyData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Pastel */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Distribución de Gastos</h3>
              {totalGastosMes > 0 ? (
                <div className="flex flex-col items-center gap-6">
                  <div 
                    className="w-40 h-40 rounded-full shadow-inner"
                    style={{ background: gradientString }}
                  ></div>
                  
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2 w-full text-xs">
                    {Object.entries(gastosPorCategoria).map(([cat, total]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[cat] || '#cbd5e1' }}
                        ></div>
                        <span className="text-slate-600 dark:text-slate-300 truncate">{cat}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 ml-auto">{formatCOP(total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                  No hay gastos registrados en este mes.
                </div>
              )}
            </div>

            {/* Historial Rápido Optimista con SPA navigation */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Historial ({meses[filterMes - 1]})</h3>
                <div className="flex gap-2">
                  <div className="text-xs">
                    <select 
                      name="tipo" 
                      className="p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      defaultValue={searchParams.get('tipo') || ''}
                      onChange={(e) => {
                        const tipo = e.target.value
                        const params = new URLSearchParams(searchParams.toString())
                        if (tipo) params.set('tipo', tipo)
                        else params.delete('tipo')
                        
                        startTransition(() => {
                          router.push(`${pathname}?${params.toString()}`)
                        })
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="Gasto">Gastos</option>
                      <option value="Ingreso">Ingresos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {optimisticAllTransactions.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No hay transacciones.</p>
                ) : (
                  optimisticAllTransactions.map((t) => (
                    <div key={t.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${t.tipo === 'Ingreso' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                          {t.tipo === 'Ingreso' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.descripcion || 'Sin descripción'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t.categoria} • {new Date(t.fecha).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-semibold ${t.tipo === 'Ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {t.tipo === 'Ingreso' ? '+' : '-'}{formatCOP(t.monto)}
                        </p>
                        <button 
                          onClick={() => handleDelete(t.id, t.fecha)} 
                          className="text-slate-400 hover:text-red-500 transition-colors" 
                          title="Eliminar"
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
