import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminTaskListItem } from '../lib/types'
import { Badge, EmptyRow, ErrorRow, LoadingRow, PageHeader, Pagination, SearchInput } from '../components/ui'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusLabels: Record<string, string> = {
  NotStarted: 'لم تبدأ',
  InProgress: 'قيد التنفيذ',
  Done: 'مكتملة',
}
const statusColors: Record<string, { color: string; bg: string }> = {
  NotStarted: { color: '#6B7280', bg: '#F3F4F6' },
  InProgress: { color: '#D97706', bg: '#FEF3C7' },
  Done: { color: '#059669', bg: '#F0FDF4' },
}

export default function Tasks() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminTaskListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi
      .listTasks({ search, status: status || undefined, includeDeleted, page, pageSize: 20 })
      .then(res => {
        setItems(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المهام'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search, status, includeDeleted, page])

  const toggleDelete = async (task: AdminTaskListItem) => {
    setBusyId(task.id)
    try {
      if (task.isDeleted) await adminApi.restoreTask(task.id)
      else await adminApi.deleteTask(task.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="المهام" subtitle="إدارة كل المهام بالنظام" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="ابحث بعنوان المهمة..." />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
        >
          <option value="">كل الحالات</option>
          <option value="NotStarted">لم تبدأ</option>
          <option value="InProgress">قيد التنفيذ</option>
          <option value="Done">مكتملة</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={includeDeleted} onChange={e => { setIncludeDeleted(e.target.checked); setPage(1) }} />
          عرض المحذوفة
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading && <LoadingRow />}
        {error && <ErrorRow message={error} />}
        {!loading && !error && items.length === 0 && <EmptyRow />}

        {!loading && !error && items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-right text-xs text-gray-400">
                <th className="px-4 py-3 font-semibold">العنوان</th>
                <th className="px-4 py-3 font-semibold">المشروع</th>
                <th className="px-4 py-3 font-semibold">المسؤول</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">تاريخ الاستحقاق</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer ${t.isDeleted ? 'opacity-50' : ''}`}
                  onClick={() => navigate(`/tasks/${t.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500">{t.projectName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.ownerName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColors[t.status].color} bg={statusColors[t.status].bg}>
                      {statusLabels[t.status]}
                    </Badge>
                    {t.isDeleted && <span className="mr-2 text-xs text-red-500">محذوفة</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(t.dueDate)}</td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={e => { e.stopPropagation(); toggleDelete(t) }}
                      disabled={busyId === t.id}
                      className={`text-xs font-semibold ${t.isDeleted ? 'text-[#059669]' : 'text-red-600'}`}
                    >
                      {t.isDeleted ? 'استعادة' : 'حذف'}
                    </button>
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
