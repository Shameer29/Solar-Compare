'use client'
import { useRouter } from 'next/navigation'
import { X, BarChart2 } from 'lucide-react'
import { useCompare } from './CompareProvider'

export default function CompareTray() {
  const { selected, toggle, clear } = useCompare()
  const router = useRouter()

  if (selected.length === 0) return null

  const handleCompare = () => {
    const ids = selected.map(c => c.id).join(',')
    router.push(`/compare?ids=${ids}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-[#0b1120]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          {/* Slots */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-0.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`flex-shrink-0 h-11 rounded-xl flex items-center gap-2 px-3 border transition-all ${
                  selected[i]
                    ? 'bg-white/10 border-orange-500/40 w-44'
                    : 'bg-white/3 border-white/8 w-32'
                }`}
              >
                {selected[i] ? (
                  <>
                    <span className="text-[11px] font-semibold text-white truncate flex-1 leading-tight">
                      {selected[i].name}
                    </span>
                    <button
                      onClick={() => toggle(selected[i])}
                      className="text-white/40 hover:text-white/80 flex-shrink-0 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-white/20 font-medium">
                    {i < selected.length + 1 ? '+ add company' : 'optional'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clear}
              className="text-white/40 hover:text-white/70 text-xs transition-colors px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleCompare}
              disabled={selected.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/25 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              Compare {selected.length >= 2 ? `(${selected.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
