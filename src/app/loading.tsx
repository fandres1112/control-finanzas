import { Skeleton } from "@/components/ui/skeleton" // Asumimos que podemos emularlo o crearlo

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-600 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna 1 */}
          <div className="space-y-6">
            {/* Balance Card Skeleton */}
            <div className="bg-indigo-600/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-4">
              <div className="h-4 w-24 bg-indigo-200 dark:bg-indigo-800 rounded animate-pulse"></div>
              <div className="h-10 w-36 bg-indigo-300 dark:bg-indigo-700 rounded-lg animate-pulse"></div>
              <div className="flex justify-between pt-4 border-t border-indigo-200 dark:border-indigo-800">
                <div className="h-8 w-20 bg-indigo-200 dark:bg-indigo-800 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-indigo-200 dark:bg-indigo-800 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-indigo-600/20 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Columna 2 y 3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presupuesto Skeleton */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-48 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart Skeleton */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center space-y-4">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-start"></div>
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>

              {/* List Skeleton */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-12 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
