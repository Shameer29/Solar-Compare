'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  )
}
