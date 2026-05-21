export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <div className="bg-[#0b1120] border-b border-white/5 h-16" />
      <div className="bg-[#0b1120] h-72 md:h-80" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-7 space-y-2">
          <div className="flex items-baseline gap-3">
            <div className="h-9 w-10 shimmer-bg rounded-lg" />
            <div className="h-6 w-36 shimmer-bg rounded-lg" />
          </div>
          <div className="h-4 w-44 shimmer-bg rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-[3px] shimmer-bg" />
              {/* Photo area */}
              <div className="h-36 shimmer-bg relative">
                <div className="absolute bottom-3 left-4 w-11 h-11 bg-white/30 rounded-xl" />
                <div className="absolute bottom-3 right-4 w-20 h-6 bg-white/20 rounded-full" />
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 shimmer-bg rounded" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-3.5 h-3.5 shimmer-bg rounded" />
                    ))}
                    <div className="h-3.5 w-10 shimmer-bg rounded ml-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full shimmer-bg rounded" />
                  <div className="h-3 w-2/3 shimmer-bg rounded" />
                  <div className="h-3 w-1/2 shimmer-bg rounded" />
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <div className="flex-1 h-9 bg-orange-100 rounded-xl shimmer-bg" />
                  <div className="w-20 h-9 shimmer-bg rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
