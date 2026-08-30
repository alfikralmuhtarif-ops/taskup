import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, ApiError } from '../lib/api'
import type { ActivityFeedItem, DashboardStats } from '../lib/types'
import { ErrorRow, LoadingRow, PageHeader, StatCard } from '../components/ui'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const activityIcon: Record<string, string> = {
  UserRegistered: '👤',
  TaskCreated: '✓',
  ProjectCreated: '📁',
}

function activityLink(item: ActivityFeedItem): string {
  if (item.type === 'UserRegistered') return `/users/${item.id}`
  if (item.type === 'TaskCreated') return `/tasks/${item.id}`
  return `/projects/${item.id}`
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityFeedItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch(err => setError(err instanceof ApiError ? err.message : 'تعذر تحميل البيانات'))
    adminApi
      .activity(15)
      .then(setActivity)
      .catch(() => setActivity([]))
  }, [])

  return (
    <div>
      <PageHeader title="لوحة المعلومات" subtitle="نظرة عامة على النظام" />

      {error && <ErrorRow message={error} />}
      {!stats && !error && <LoadingRow />}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2">المستخدمون</div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} />
                <StatCard label="مستخدمون جدد هذا الأسبوع" value={stats.newUsersThisWeek} color="#059669" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 mb-2">المشاريع</div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="إجمالي المشاريع" value={stats.totalProjects} />
                <StatCard label="إجمالي الرسائل" value={stats.totalMessages} color="#8B5CF6" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 mb-2">المهام</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="إجمالي المهام" value={stats.totalTasks} />
                <StatCard label="لم تبدأ" value={stats.tasksNotStarted} color="#6B7280" />
                <StatCard label="قيد التنفيذ" value={stats.tasksInProgress} color="#D97706" />
                <StatCard label="مكتملة" value={stats.tasksDone} color="#059669" />
                <StatCard label="متأخرة" value={stats.tasksOverdue} color="#EF4444" />
                <StatCard label="مهام جديدة هذا الأسبوع" value={stats.newTasksThisWeek} color="#2185C7" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 mb-2">آخر النشاطات</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {activity === null && <div className="py-8 text-center text-sm text-gray-400">جارٍ التحميل...</div>}
              {activity?.length === 0 && <div className="py-8 text-center text-sm text-gray-400">لا يوجد نشاط بعد</div>}
              {activity?.map((item, i) => (
                <Link
                  key={`${item.type}-${item.id}-${i}`}
                  to={activityLink(item)}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <span className="text-base leading-none mt-0.5">{activityIcon[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.title || '—'}</div>
                    {item.subtitle && <div className="text-xs text-gray-400 mt-0.5">{item.subtitle}</div>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDateTime(item.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
