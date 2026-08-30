export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface DashboardStats {
  totalUsers: number
  newUsersThisWeek: number
  totalProjects: number
  totalTasks: number
  tasksNotStarted: number
  tasksInProgress: number
  tasksDone: number
  tasksOverdue: number
  newTasksThisWeek: number
  totalMessages: number
}

export interface AdminUserListItem {
  id: string
  phone: string
  name: string
  isDisabled: boolean
  isSystemAdmin: boolean
  createdAt: string
}

export interface AdminUserDetail extends AdminUserListItem {
  avatarUrl: string | null
  taskCount: number
  projectCount: number
  messageCount: number
}

export interface AdminTaskListItem {
  id: string
  title: string
  status: 'NotStarted' | 'InProgress' | 'Done'
  projectId: string | null
  projectName: string | null
  ownerId: string | null
  ownerName: string | null
  createdById: string
  createdByName: string
  dueDate: string | null
  isDeleted: boolean
  createdAt: string
}

export interface AdminProjectListItem {
  id: string
  name: string
  status: 'Active' | 'Archived'
  createdById: string
  createdByName: string
  memberCount: number
  taskCount: number
  isDeleted: boolean
  createdAt: string
}

export interface AdminUserTask {
  id: string
  title: string
  status: 'NotStarted' | 'InProgress' | 'Done'
  relation: 'Creator' | 'Owner' | 'Participant'
  dueDate: string | null
}

export interface AdminUserProject {
  id: string
  name: string
  status: 'Active' | 'Archived'
  role: 'Owner' | 'Member'
}

export interface AdminChecklistItem {
  id: string
  title: string
  isCompleted: boolean
  sortOrder: number
}

export interface AdminTaskParticipant {
  userId: string
  name: string
  phone: string
}

export interface AdminTaskUpdateItem {
  id: string
  authorId: string
  authorName: string
  type: string
  text: string | null
  createdAt: string
}

export interface AdminTaskActivity {
  id: string
  actorId: string | null
  actorName: string | null
  type: string
  metadata: string | null
  createdAt: string
}

export interface AdminTaskDetail {
  id: string
  title: string
  description: string | null
  status: 'NotStarted' | 'InProgress' | 'Done'
  projectId: string | null
  projectName: string | null
  createdById: string
  createdByName: string
  ownerId: string | null
  ownerName: string | null
  dueDate: string | null
  createdAt: string
  completedAt: string | null
  isDeleted: boolean
  checklistItems: AdminChecklistItem[]
  participants: AdminTaskParticipant[]
  updates: AdminTaskUpdateItem[]
  activities: AdminTaskActivity[]
}

export interface AdminProjectMember {
  userId: string
  name: string
  phone: string
  role: 'Owner' | 'Member'
}

export interface AdminProjectDetail {
  id: string
  name: string
  description: string | null
  color: string
  status: 'Active' | 'Archived'
  createdById: string
  createdByName: string
  createdAt: string
  isDeleted: boolean
  members: AdminProjectMember[]
  tasks: AdminTaskListItem[]
}

export interface ActivityFeedItem {
  id: string
  type: 'UserRegistered' | 'TaskCreated' | 'ProjectCreated'
  title: string
  subtitle: string | null
  createdAt: string
}

export interface AdminReportListItem {
  id: string
  reporterId: string
  reporterName: string
  reportedUserId: string
  reportedUserName: string
  reason: string
  messageId: string | null
  status: 'Open' | 'Resolved'
  createdAt: string
  resolvedAt: string | null
}

export interface AdminAccessLogItem {
  id: string
  adminUserId: string
  adminUserName: string
  resourceType: 'User' | 'Task' | 'Project'
  resourceId: string
  accessedAt: string
}
