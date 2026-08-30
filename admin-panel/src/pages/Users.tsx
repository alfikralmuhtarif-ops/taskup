import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminUserListItem } from '../lib/types'
import { Badge, EmptyRow, ErrorRow, LoadingRow, PageHeader, Pagination, SearchInput } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Users() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminUserListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    adminApi
      .listUsers({ search, page, pageSize: 20 })
      .then(res => {
        setItems(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المستخدمين'))
      .finally(() => setLoading(false))
  }, [search, page])

  return (
    <div>
      <PageHeader title="المستخدمون" subtitle="إدارة حسابات المستخدمين" />

      <div className="mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="ابحث بالاسم أو الجوال..." />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <LoadingRow />}
        {error && <ErrorRow message={error} />}
        {!loading && !error && items.length === 0 && <EmptyRow />}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-right text-xs text-gray-400">
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">الجوال</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{u.phone}</td>
                  <td className="px-4 py-3">
                    {u.isSystemAdmin && <Badge color="#2185C7" bg="#EBF5FF">مسؤول نظام</Badge>}
                    {!u.isSystemAdmin && u.isDisabled && <Badge color="#DC2626" bg="#FEF2F2">معطل</Badge>}
                    {!u.isSystemAdmin && !u.isDisabled && <Badge color="#059669" bg="#F0FDF4">نشط</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
