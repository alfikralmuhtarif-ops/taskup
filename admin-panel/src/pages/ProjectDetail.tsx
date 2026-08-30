import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminProjectDetail } from '../lib/types'
import { Badge, ErrorRow, LoadingRow } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusLabels: Record<string, string> = { NotStarted: 'لم تبدأ', InProgress: 'قيد التنفيذ', Done: 'مكتملة' }
const statusColors: Record<string, { color: string; bg: string }> = {
  NotStarted: { color: '#6B7280', bg: '#F3F4F6' },
  InProgress: { color: '#D97706', bg: '#FEF3C7' },
  Done: { color: '#059669', bg: '#F0FDF4' },
}
const roleLabels: Record<string, string> = { Owner: 'مالك', Member: 'عضو' }

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<AdminProjectDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    if (!id) return
    setError(null)
    adminApi
      .getProject(id)
      .then(setProject)
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل بيانات المشروع'))
  }

  useEffect(load, [id])

  const toggleDelete = async () => {
    if (!project) return
    setBusy(true)
    try {
      if (project.isDeleted) await adminApi.restoreProject(project.id)
      else await adminApi.deleteProject(project.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorRow message={error} />
  if (!project) return <LoadingRow />

  const doneTasks = project.tasks.filter(t => t.status === 'Done').length
  const progress = project.tasks.length > 0 ? Math.round((doneTasks / project.tasks.length) * 100) : null

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-[#2185C7] mb-4">← رجوع</button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: project.color }} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
                <Badge color={project.status === 'Active' ? '#059669' : '#6B7280'} bg={project.status === 'Active' ? '#F0FDF4' : '#F3F4F6'}>
                  {project.status === 'Active' ? 'نشط' : 'مؤرشف'}
                </Badge>
                {project.isDeleted && <Badge color="#DC2626" bg="#FEF2F2">محذوف</Badge>}
              </div>
              {project.description && <p className="text-sm text-gray-600 mt-1 max-w-xl">{project.description}</p>}
            </div>
          </div>
          <button
            onClick={toggleDelete}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-sm font-semibold shrink-0 ${
              project.isDeleted ? 'bg-[#F0FDF4] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {project.isDeleted ? 'استعادة' : 'حذف'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-1">المنشئ</div>
            <Link to={`/users/${project.createdById}`} className="text-[#2185C7] font-medium">{project.createdByName || '—'}</Link>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">الأعضاء</div>
            <span className="text-gray-700">{project.members.length}</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">المهام</div>
            <span className="text-gray-700">{project.tasks.length}</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">تاريخ الإنشاء</div>
            <span className="text-gray-700">{formatDate(project.createdAt)}</span>
          </div>
        </div>

        {progress !== null && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{doneTasks} / {project.tasks.length} مهمة مكتملة</span>
              <span className="font-semibold text-[#2185C7]">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2185C7] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">الأعضاء</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {project.members.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا يوجد أعضاء</div>}
            {project.members.map(m => (
              <Link key={m.userId} to={`/users/${m.userId}`} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">{m.name || '—'}</span>
                <Badge color="#2185C7" bg="#EBF5FF">{roleLabels[m.role]}</Badge>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">المهام</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {project.tasks.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا توجد مهام</div>}
            {project.tasks.map(t => (
              <Link key={t.id} to={`/tasks/${t.id}`} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">{t.title}</span>
                <Badge color={statusColors[t.status].color} bg={statusColors[t.status].bg}>
                  {statusLabels[t.status]}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
