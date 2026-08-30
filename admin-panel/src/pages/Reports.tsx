import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminReportListItem } from '../lib/types'
import { Badge, EmptyRow, ErrorRow, LoadingRow, PageHeader, Pagination } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Reports() {
  const navigate = useNavigate()
  const [includeResolved, setIncludeResolved] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminReportListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi
      .listReports({ includeResolved, page, pageSize: 20 })
      .then(res => {
        setItems(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل البلاغات'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [includeResolved, page])

  const resolve = async (id: string) => {
    setBusyId(id)
    try {
      await adminApi.resolveReport(id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusyId(null)
    }
  }

  const reopen = async (id: string) => {
    setBusyId(id)
    try {
      await adminApi.reopenReport(id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="البلاغات" subtitle="بلاغات المستخدمين عن سلوك أو محتوى مسيء (App Store Guideline 1.2)" />

      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={includeResolved} onChange={e => { setIncludeResolved(e.target.checked); setPage(1) }} />
          عرض البلاغات المعالجة أيضاً
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <LoadingRow />}
        {error && <ErrorRow message={error} />}
        {!loading && !error && items.length === 0 && <EmptyRow message="لا توجد بلاغات" />}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-right text-xs text-gray-400">
                <th className="px-4 py-3 font-semibold">المُبلِّغ</th>
                <th className="px-4 py-3 font-semibold">المُبلَّغ عنه</th>
                <th className="px-4 py-3 font-semibold">السبب</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/users/${r.reporterId}`)}>
                    {r.reporterName || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/users/${r.reportedUserId}`)}>
                    {r.reportedUserName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'Open' ? (
                      <Badge color="#D97706" bg="#FEF3C7">مفتوح</Badge>
                    ) : (
                      <Badge color="#059669" bg="#F0FDF4">معالَج</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {r.status === 'Open' ? (
                      <button
                        onClick={() => resolve(r.id)}
                        disabled={busyId === r.id}
                        className="text-xs font-semibold text-[#059669]"
                      >
                        وضع كمعالَج
                      </button>
                    ) : (
                      <button
                        onClick={() => reopen(r.id)}
                        disabled={busyId === r.id}
                        className="text-xs font-semibold text-[#D97706]"
                      >
                        إعادة فتح
                      </button>
                    )}
                  </td>
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
