export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export function StatCard({ label, value, color = '#2185C7' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

export function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color, background: bg }}>
      {children}
    </span>
  )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? 'بحث...'}
      className="w-full max-w-xs px-3.5 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2185C7] bg-white"
    />
  )
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 bg-white"
      >
        السابق
      </button>
      <span className="text-sm text-gray-500">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 bg-white"
      >
        التالي
      </button>
    </div>
  )
}

export function LoadingRow() {
  return <div className="py-10 text-center text-sm text-gray-400">جارٍ التحميل...</div>
}

export function ErrorRow({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-red-500">{message}</div>
}

export function EmptyRow({ message = 'لا توجد بيانات' }: { message?: string }) {
  return <div className="py-10 text-center text-sm text-gray-400">{message}</div>
}
