'use client'
import { Check, BarChart2 } from 'lucide-react'
import { useCompare } from './CompareProvider'
import type { Company } from '@/lib/places'

export default function CompareButton({ company }: { company: Company }) {
  const { toggle, isSelected, canAdd } = useCompare()
  const active = isSelected(company.id)
  const disabled = !active && !canAdd

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(company) }}
      disabled={disabled}
      title={disabled ? 'Max 3 companies' : active ? 'Remove from compare' : 'Add to compare'}
      className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 select-none ${
        active
          ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
          : disabled
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
          : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600'
      }`}
    >
      {active ? <Check className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
      {active ? 'Added' : 'Compare'}
    </button>
  )
}
