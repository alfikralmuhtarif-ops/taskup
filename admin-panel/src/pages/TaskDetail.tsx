import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { AdminTaskDetail } from '../lib/types'
import { Badge, ErrorRow, LoadingRow } from '../components/ui'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusLabels: Record<string, string> = { NotStarted: 'لم تبدأ', InProgress: 'قيد التنفيذ', Done: 'مكتملة' }
const statusColors: Record<string, { color: string; bg: string }> = {
  NotStarted: { color: '#6B7280', bg: '#F3F4F6' },
  InProgress: { color: '#D97706', bg: '#FEF3C7' },
  Done: { color: '#059669', bg: '#F0FDF4' },
}
const activityLabels: Record<string, string> = {
  Created: 'تم إنشاء المهمة',
  StatusChanged: 'تغيّرت الحالة',
  OwnerChanged: 'تغيّر المسؤول',
  ParticipantAdded: 'أُضيف مشارك',
  ParticipantRemoved: 'أُزيل مشارك',
  ChecklistItemAdded: 'أُضيف عنصر للقائمة',
  ChecklistItemCompleted: 'اكتمل عنصر بالقائمة',
  ChecklistItemReopened: 'أُعيد فتح عنصر بالقائمة',
  Completed: 'اكتملت المهمة',
  Reopened: 'أُعيدت فتح المهمة',
  Deleted: 'حُذفت المهمة',
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<AdminTaskDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    if (!id) return
    setError(null)
    adminApi
      .getTask(id)
      .then(setTask)
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل بيانات المهمة'))
  }

  useEffect(load, [id])

  const toggleDelete = async () => {
    if (!task) return
    setBusy(true)
    try {
      if (task.isDeleted) await adminApi.restoreTask(task.id)
      else await adminApi.deleteTask(task.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تنفيذ الإجراء')
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorRow message={error} />
  if (!task) return <LoadingRow />

  const completedCount = task.checklistItems.filter(c => c.isCompleted).length
  const progress = task.checklistItems.length > 0 ? Math.round((completedCount / task.checklistItems.length) * 100) : null

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-[#2185C7] mb-4">← رجوع</button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-900">{task.title}</h1>
              <Badge color={statusColors[task.status].color} bg={statusColors[task.status].bg}>
                {statusLabels[task.status]}
              </Badge>
              {task.isDeleted && <Badge color="#DC2626" bg="#FEF2F2">محذوفة</Badge>}
            </div>
            {task.description && <p className="text-sm text-gray-600 mt-2 max-w-xl">{task.description}</p>}
          </div>
          <button
            onClick={toggleDelete}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-sm font-semibold shrink-0 ${
              task.isDeleted ? 'bg-[#F0FDF4] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {task.isDeleted ? 'استعادة' : 'حذف'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-1">المشروع</div>
            {task.projectId ? (
              <Link to={`/projects/${task.projectId}`} className="text-[#2185C7] font-medium">{task.projectName}</Link>
            ) : (
              <span className="text-gray-500">—</span>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">المنشئ</div>
            <Link to={`/users/${task.createdById}`} className="text-[#2185C7] font-medium">{task.createdByName || '—'}</Link>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">المسؤول</div>
            {task.ownerId ? (
              <Link to={`/users/${task.ownerId}`} className="text-[#2185C7] font-medium">{task.ownerName}</Link>
            ) : (
              <span className="text-gray-500">—</span>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">تاريخ الاستحقاق</div>
            <span className="text-gray-700">{formatDate(task.dueDate)}</span>
          </div>
        </div>

        {progress !== null && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{completedCount} / {task.checklistItems.length} عنصر مكتمل</span>
              <span className="font-semibold text-[#2185C7]">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2185C7] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">قائمة المهام الفرعية</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {task.checklistItems.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا توجد عناصر</div>}
              {task.checklistItems.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${c.isCompleted ? 'bg-[#059669] border-[#059669]' : 'border-gray-300'}`} />
                  <span className={`text-sm ${c.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">المشاركون</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {task.participants.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا يوجد مشاركون</div>}
              {task.participants.map(p => (
                <Link key={p.userId} to={`/users/${p.userId}`} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{p.name || '—'}</span>
                  <span className="text-xs text-gray-400" dir="ltr">{p.phone}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">التحديثات</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto">
              {task.updates.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا توجد تحديثات</div>}
              {task.updates.map(u => (
                <div key={u.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{u.authorName || '—'}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(u.createdAt)}</span>
                  </div>
                  {u.text && <p className="text-sm text-gray-600">{u.text}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">سجل النشاط</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto">
              {task.activities.length === 0 && <div className="py-6 text-center text-sm text-gray-400">لا يوجد نشاط</div>}
              {task.activities.map(a => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">
                    {activityLabels[a.type] ?? a.type}
                    {a.actorName && <span className="text-gray-400"> — {a.actorName}</span>}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{formatDateTime(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
