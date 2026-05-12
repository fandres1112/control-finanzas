import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  // 1. Verificar el token de seguridad
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('No autorizado', { status: 401 })
  }

  const now = new Date()
  const filterMes = now.getMonth() + 1
  const filterAno = now.getFullYear()

  const startOfMonth = new Date(filterAno, filterMes - 1, 1)
  const endOfMonth = new Date(filterAno, filterMes, 0)
  const daysInMonth = endOfMonth.getDate()

  // 2. Buscar todas las plantillas recurrentes de todos los usuarios
  const recurringTemplates = await prisma.recurringTransaction.findMany()
  let createdCount = 0

  for (const rt of recurringTemplates) {
    const targetDay = Math.min(rt.dia, daysInMonth)
    const targetDate = new Date(filterAno, filterMes - 1, targetDay)

    // Lógica Mensual
    if (rt.frecuencia === 'Mensual') {
      const exists = await prisma.transaction.findFirst({
        where: { 
          recurringId: rt.id, 
          fecha: { gte: startOfMonth, lte: endOfMonth } 
        }
      })
      
      if (!exists) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId: rt.userId, // Usamos el userId de la plantilla
            recurringId: rt.id,
            fecha: targetDate,
          }
        })
        createdCount++
      }
    } 
    // Lógica Quincenal (Por si acaso quedó activa)
    else if (rt.frecuencia === 'Quincenal') {
      // Primera quincena (Día X)
      const exists1 = await prisma.transaction.findFirst({
        where: { 
          recurringId: rt.id, 
          fecha: { gte: startOfMonth, lte: new Date(filterAno, filterMes - 1, 14) } 
        }
      })
      
      if (!exists1) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion ? `${rt.descripcion} (Q1)` : null,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId: rt.userId,
            recurringId: rt.id,
            fecha: targetDate,
          }
        })
        createdCount++
      }
      
      // Segunda quincena (Día X + 15)
      const targetDay2 = Math.min(rt.dia + 15, daysInMonth)
      const targetDate2 = new Date(filterAno, filterMes - 1, targetDay2)

      const exists2 = await prisma.transaction.findFirst({
        where: { 
          recurringId: rt.id, 
          fecha: { gte: new Date(filterAno, filterMes - 1, 15), lte: endOfMonth } 
        }
      })
      
      if (!exists2) {
        await prisma.transaction.create({
          data: {
            monto: rt.monto,
            descripcion: rt.descripcion ? `${rt.descripcion} (Q2)` : null,
            tipo: rt.tipo,
            categoria: rt.categoria,
            userId: rt.userId,
            recurringId: rt.id,
            fecha: targetDate2,
          }
        })
        createdCount++
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: `Se procesaron ${recurringTemplates.length} plantillas. Se crearon ${createdCount} transacciones.` 
  })
}
