import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'

function ProtectedLayout() {
  const { token, isAdmin } = useAuth()
  if (!token || !isAdmin) return <Navigate to="/login" replace />
  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
