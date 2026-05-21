'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import type { Company } from '@/lib/places'

interface CompareCtx {
  selected: Company[]
  toggle: (c: Company) => void
  clear: () => void
  isSelected: (id: string) => boolean
  canAdd: boolean
}

const Ctx = createContext<CompareCtx>({
  selected: [],
  toggle: () => {},
  clear: () => {},
  isSelected: () => false,
  canAdd: true,
})

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Company[]>([])

  const toggle = useCallback((c: Company) => {
    setSelected(prev => {
      if (prev.find(p => p.id === c.id)) return prev.filter(p => p.id !== c.id)
      if (prev.length >= 3) return prev
      return [...prev, c]
    })
  }, [])

  const clear = useCallback(() => setSelected([]), [])
  const isSelected = useCallback((id: string) => selected.some(c => c.id === id), [selected])

  return (
    <Ctx.Provider value={{ selected, toggle, clear, isSelected, canAdd: selected.length < 3 }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCompare = () => useContext(Ctx)
