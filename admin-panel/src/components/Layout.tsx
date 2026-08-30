import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'لوحة المعلومات', end: true },
  { to: '/users', label: 'المستخدمون', end: false },
  { to: '/tasks', label: 'المهام', end: false },
  { to: '/projects', label: 'المشاريع', end: false },
  { to: '/reports', label: 'البلاغات', end: false },
  { to: '/audit-log', label: 'سجل التدقيق', end: false },
]

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <aside className="w-60 shrink-0 bg-white border-l border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-lg font-bold text-[#2185C7]">TaskUp</div>
          <div className="text-xs text-gray-400">لوحة التحكم</div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#EBF5FF] text-[#2185C7]' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-right"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
