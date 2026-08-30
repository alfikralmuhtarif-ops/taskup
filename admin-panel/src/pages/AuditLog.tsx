import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminAccessLogItem } from '../lib/types'
import { Badge, EmptyRow, ErrorRow, LoadingRow, PageHeader, Pagination } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const resourceLabels: Record<string, string> = { User: 'مستخدم', Task: 'مهمة', Project: 'مشروع' }
const resourceRoute: Record<string, string> = { User: '/users', Task: '/tasks', Project: '/projects' }

export default function AuditLog() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminAccessLogItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    adminApi
      .listAuditLog({ page, pageSize: 30 })
      .then(res => {
        setItems(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل سجل التدقيق'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <PageHeader
        title="سجل التدقيق"
        subtitle="كل مرة يفتح فيها مشرف تفاصيل مستخدم أو مهمة أو مشروع — الأساس الذي تستند إليه سياسة الخصوصية عند وصف وصول الفريق للمحتوى"
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <LoadingRow />}
        {error && <ErrorRow message={error} />}
        {!loading && !error && items.length === 0 && <EmptyRow message="لا توجد سجلات بعد" />}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-right text-xs text-gray-400">
                <th className="px-4 py-3 font-semibold">المشرف</th>
                <th className="px-4 py-3 font-semibold">نوع المورد</th>
                <th className="px-4 py-3 font-semibold">المعرّف</th>
                <th className="px-4 py-3 font-semibold">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {items.map(l => (
                <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/users/${l.adminUserId}`)}>
                    {l.adminUserName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color="#2185C7" bg="#EBF5FF">{resourceLabels[l.resourceType]}</Badge>
                  </td>
                  <td
                    className="px-4 py-3 text-gray-500 font-mono text-xs cursor-pointer hover:text-[#2185C7]"
                    onClick={() => navigate(`${resourceRoute[l.resourceType]}/${l.resourceId}`)}
                  >
                    {l.resourceId}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(l.accessedAt)}</td>
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
