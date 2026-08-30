import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminUserDetail, AdminUserProject, AdminUserTask } from '../lib/types'
import { Badge, ErrorRow, LoadingRow, PageHeader } from '../components/ui'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusLabels: Record<string, string> = { NotStarted: 'لم تبدأ', InProgress: 'قيد التنفيذ', Done: 'مكتملة' }
const statusColors: Record<string, { color: string; bg: string }> = {
  NotStarted: { color: '#6B7280', bg: '#F3F4F6' },
  InProgress: { color: '#D97706', bg: '#FEF3C7' },
  Done: { color: '#059669', bg: '#F0FDF4' },
}
const relationLabels: Record<string, string> = { Creator: 'منشئ', Owner: 'مسؤول', Participant: 'مشارك' }
const roleLabels: Record<string, string> = { Owner: 'مالك', Member: 'عضو' }

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [tasks, setTasks] = useState<AdminUserTask[]>([])
  const [projects, setProjects] = useState<AdminUserProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    if (!id) return
    setError(null)
    Promise.all([adminApi.getUser(id), adminApi.getUserTasks(id), adminApi.getUserProjects(id)])
      .then(([u, t, p]) => {
        setUser(u)
        setTasks(t)
        setProjects(p)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل بيانات المستخدم'))
  }

  useEffect(load, [id])

  const toggleDisabled = async () => {
    if (!user) return
    // Disabling has an immediate, real effect on a real person's access — unlike task/
    // project soft-delete, there's no undo shortcut here, so a stray click shouldn't
    // be enough on its own. Re-enabling needs no confirmation.
    if (!user.isDisabled && !window.confirm(`سيتم تعطيل حساب "${user.name || user.phone}" فوراً ولن يتمكن من الدخول للتطبيق. متابعة؟`)) {
      return
    }
    setBusy(true)
    try {
      const updated = await adminApi.setUserDisabled(user.id, !user.isDisabled)
      setUser(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorRow message={error} />
  if (!user) return <LoadingRow />

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-[#2185C7] mb-4">← رجوع</button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-900">{user.name || '—'}</h1>
              {user.isSystemAdmin && <Badge color="#2185C7" bg="#EBF5FF">مسؤول نظام</Badge>}
              {!user.isSystemAdmin && (
                <Badge color={user.isDisabled ? '#DC2626' : '#059669'} bg={user.isDisabled ? '#FEF2F2' : '#F0FDF4'}>
                  {user.isDisabled ? 'معطل' : 'نشط'}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500" dir="ltr">{user.phone}</div>
            <div className="text-xs text-gray-400 mt-1">مسجل منذ {formatDate(user.createdAt)}</div>
          </div>
          {!user.isSystemAdmin && (
            <button
              onClick={toggleDisabled}
              disabled={busy}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                user.isDisabled ? 'bg-[#F0FDF4] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}
            >
              {user.isDisabled ? 'تفعيل الحساب' : 'تعطيل الحساب'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="text-lg font-bold text-[#2185C7]">{user.taskCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">مهام</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="text-lg font-bold text-[#2185C7]">{user.projectCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">مشاريع</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="text-lg font-bold text-[#2185C7]">{user.messageCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">رسائل</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PageHeader title="المهام" />
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {tasks.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا توجد مهام</div>}
            {tasks.map(t => (
              <Link
                key={t.id}
                to={`/tasks/${t.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{relationLabels[t.relation]}</div>
                </div>
                <Badge color={statusColors[t.status].color} bg={statusColors[t.status].bg}>
                  {statusLabels[t.status]}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <PageHeader title="المشاريع" />
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {projects.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا توجد مشاريع</div>}
            {projects.map(p => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                <Badge color="#2185C7" bg="#EBF5FF">{roleLabels[p.role]}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
