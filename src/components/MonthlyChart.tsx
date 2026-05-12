'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartProps {
  data: { day: number; amount: number }[]
}

export default function MonthlyChart({ data }: ChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `Día ${value}`}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Día {payload[0].payload.day}</p>
                    <p className="text-indigo-600 dark:text-indigo-400">${payload[0].value}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar 
            dataKey="amount" 
            fill="#4f46e5" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
