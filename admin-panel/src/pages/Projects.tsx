import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminProjectListItem } from '../lib/types'
import { Badge, EmptyRow, ErrorRow, LoadingRow, PageHeader, Pagination, SearchInput } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Projects() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminProjectListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi
      .listProjects({ search, includeDeleted, page, pageSize: 20 })
      .then(res => {
        setItems(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المشاريع'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search, includeDeleted, page])

  const toggleDelete = async (project: AdminProjectListItem) => {
    setBusyId(project.id)
    try {
      if (project.isDeleted) await adminApi.restoreProject(project.id)
      else await adminApi.deleteProject(project.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="المشاريع" subtitle="إدارة كل المشاريع بالنظام" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="ابحث باسم المشروع..." />
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
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">المنشئ</th>
                <th className="px-4 py-3 font-semibold">الأعضاء</th>
                <th className="px-4 py-3 font-semibold">المهام</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">تاريخ الإنشاء</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer ${p.isDeleted ? 'opacity-50' : ''}`}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.createdByName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.memberCount}</td>
                  <td className="px-4 py-3 text-gray-500">{p.taskCount}</td>
                  <td className="px-4 py-3">
                    <Badge color={p.status === 'Active' ? '#059669' : '#6B7280'} bg={p.status === 'Active' ? '#F0FDF4' : '#F3F4F6'}>
                      {p.status === 'Active' ? 'نشط' : 'مؤرشف'}
                    </Badge>
                    {p.isDeleted && <span className="mr-2 text-xs text-red-500">محذوف</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={e => { e.stopPropagation(); toggleDelete(p) }}
                      disabled={busyId === p.id}
                      className={`text-xs font-semibold ${p.isDeleted ? 'text-[#059669]' : 'text-red-600'}`}
                    >
                      {p.isDeleted ? 'استعادة' : 'حذف'}
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
