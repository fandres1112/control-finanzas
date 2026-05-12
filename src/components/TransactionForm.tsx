'use client'

import { createTransaction } from '@/app/actions'
import { PlusCircle } from 'lucide-react'
import { useRef } from 'react'

export default function TransactionForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const now = new Date()

  const handleSubmit = async (formData: FormData) => {
    try {
      await createTransaction(formData)
      formRef.current?.reset()
    } catch (error) {
      console.error(error)
      alert('Error al crear la transacción')
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Tipo</label>
          <select 
            name="tipo" 
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            defaultValue="Gasto"
          >
            <option value="Gasto">Gasto</option>
            <option value="Ingreso">Ingreso</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Monto</label>
          <input 
            type="number" 
            name="monto" 
            step="1" 
            placeholder="0"
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400">Descripción</label>
        <input 
          type="text" 
          name="descripcion" 
          placeholder="Ej. Almuerzo"
          className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Categoría</label>
          <select 
            name="categoria" 
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            defaultValue="Comida"
          >
            <option value="Comida">Comida</option>
            <option value="Transporte">Transporte</option>
            <option value="Entretenimiento">Entretenimiento</option>
            <option value="Salud">Salud</option>
            <option value="Vivienda">Vivienda</option>
            <option value="Sueldo">Sueldo</option>
            <option value="Deuda">Deuda</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400">Fecha</label>
          <input 
            type="date" 
            name="fecha" 
            defaultValue={now.toISOString().split('T')[0]}
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Checkbox de Recurrencia */}
      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          name="esRecurrente" 
          id="esRecurrente"
          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="esRecurrente" className="text-sm text-slate-700 dark:text-slate-200 font-medium">
          Hacer recurrente todos los meses
        </label>
      </div>

      <button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <PlusCircle className="w-5 h-5" />
        Guardar Transacción
      </button>
    </form>
  )
}
