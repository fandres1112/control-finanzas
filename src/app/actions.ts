'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function createTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const monto = parseFloat(formData.get('monto') as string)
  const descripcion = formData.get('descripcion') as string
  const tipo = formData.get('tipo') as string
  const categoria = formData.get('categoria') as string
  const fechaStr = formData.get('fecha') as string
  const esRecurrente = formData.get('esRecurrente') === 'on'

  if (isNaN(monto) || !tipo || !categoria) {
    throw new Error('Datos inválidos')
  }

  let fecha = new Date()
  if (fechaStr) {
    const [year, month, day] = fechaStr.split('-').map(Number)
    fecha = new Date(year, month - 1, day)
  }

  // 1. Crear la transacción normal
  await prisma.transaction.create({
    data: {
      monto,
      descripcion,
      tipo,
      categoria,
      userId,
      fecha,
    },
  })

  // 2. Si es recurrente, crear la plantilla
  if (esRecurrente) {
    await prisma.recurringTransaction.create({
      data: {
        monto,
        descripcion,
        tipo,
        categoria,
        frecuencia: 'Mensual',
        dia: fecha.getDate(),
        userId,
      },
    })
  }

  revalidatePath('/')
}

export async function setBudget(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const monto = parseFloat(formData.get('monto') as string)
  const mes = parseInt(formData.get('mes') as string)
  const ano = parseInt(formData.get('ano') as string)

  if (isNaN(monto) || isNaN(mes) || isNaN(ano)) {
    throw new Error('Datos inválidos')
  }

  await prisma.budget.upsert({
    where: {
      mes_ano_userId: {
        mes,
        ano,
        userId,
      },
    },
    update: { monto },
    create: { monto, mes, ano, userId },
  })

  revalidatePath('/')
}

export async function deleteTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const id = parseInt(formData.get('id') as string)
  if (isNaN(id)) throw new Error('ID inválido')

  await prisma.transaction.delete({
    where: { 
      id,
      userId,
    },
  })

  revalidatePath('/')
}

export async function createRecurringTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const monto = parseFloat(formData.get('monto') as string)
  const descripcion = formData.get('descripcion') as string
  const tipo = formData.get('tipo') as string
  const categoria = formData.get('categoria') as string
  const frecuencia = formData.get('frecuencia') as string
  const dia = parseInt(formData.get('dia') as string) || 1

  if (isNaN(monto) || !tipo || !categoria || !frecuencia) {
    throw new Error('Datos inválidos')
  }

  await prisma.recurringTransaction.create({
    data: {
      monto,
      descripcion,
      tipo,
      categoria,
      frecuencia,
      dia,
      userId,
    },
  })

  revalidatePath('/')
}

export async function applyRecurringTransactions(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const filterMes = parseInt(formData.get('mes') as string)
  const filterAno = parseInt(formData.get('ano') as string)

  const startOfMonth = new Date(filterAno, filterMes - 1, 1)
  const endOfMonth = new Date(filterAno, filterMes, 0)
  const daysInMonth = endOfMonth.getDate()

  const recurringTemplates = await prisma.recurringTransaction.findMany({ where: { userId } })
  
  for (const rt of recurringTemplates) {
    // Calculamos el día objetivo asegurando que no pase del fin de mes
    const targetDay = Math.min(rt.dia, daysInMonth)
    const targetDate = new Date(filterAno, filterMes - 1, targetDay)

    if (rt.frecuencia === 'Mensual') {
      const exists = await prisma.transaction.findFirst({
        where: { recurringId: rt.id, fecha: { gte: startOfMonth, lte: endOfMonth } }
      })
      if (!exists) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId,
            recurringId: rt.id,
            fecha: targetDate,
          }
        })
      }
    } else if (rt.frecuencia === 'Quincenal') {
      // Primera quincena (Día X)
      const exists1 = await prisma.transaction.findFirst({
        where: { recurringId: rt.id, fecha: { gte: startOfMonth, lte: new Date(filterAno, filterMes - 1, 14) } }
      })
      if (!exists1) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion ? `${rt.descripcion} (Q1)` : null,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId,
            recurringId: rt.id,
            fecha: targetDate,
          }
        })
      }
      
      // Segunda quincena (Día X + 15)
      const targetDay2 = Math.min(rt.dia + 15, daysInMonth)
      const targetDate2 = new Date(filterAno, filterMes - 1, targetDay2)

      const exists2 = await prisma.transaction.findFirst({
        where: { recurringId: rt.id, fecha: { gte: new Date(filterAno, filterMes - 1, 15), lte: endOfMonth } }
      })
      if (!exists2) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion ? `${rt.descripcion} (Q2)` : null,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId,
            recurringId: rt.id,
            fecha: targetDate2,
          }
        })
      }
    }
  }

  revalidatePath('/')
}

export async function deleteRecurringTransaction(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('No autorizado')

  const id = parseInt(formData.get('id') as string)

  await prisma.recurringTransaction.delete({
    where: { id, userId },
  })

  revalidatePath('/')
}
