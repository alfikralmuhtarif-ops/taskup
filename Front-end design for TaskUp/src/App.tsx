import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import {
  authApi, usersApi, peopleApi, conversationsApi, tasksApi, projectsApi, notificationsApi, filesApi, notesApi,
  searchApi, activityApi, notificationSettingsApi, invitesApi, setSession, absoluteStorageUrl, ApiError,
  type BackendUserProfile, type BackendTaskListItem, type BackendTaskDetail, type BackendProjectListItem, type BackendProjectDetail, type BackendPerson,
  type BackendNoteListItem, type BackendNoteDetail, type BackendSearchResult, type BackendActivityItem, type BackendInvite,
  type BackendConversation, type BackendNotificationPreferences, type BackendNotificationDeliverySettings,
} from './lib/api'

// ─── Icon Kit ─────────────────────────────────────────────────────────────────
// Single consistent line-icon set (24x24 viewBox, currentColor stroke) used across
// the whole app instead of emoji, so every screen renders the same crisp,
// platform-independent icons.
type IconProps = { size?: number }

const HomeIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ProjectsIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)
const ChatsIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const BellIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const PersonIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const CheckIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const CheckCircleIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CloseIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
)
const EditIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const TrashIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 7l.7 12.4c0 .9.7 1.6 1.6 1.6h6.4c.9 0 1.6-.7 1.6-1.6L17.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const MoreIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="5" cy="12" r="1.6" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
    <circle cx="19" cy="12" r="1.6" fill="currentColor"/>
  </svg>
)
const NoteIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const ThumbtackIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14.5 3.5l6 6-3 3-1.5-1.5L12.8 14l1.2 4-1.5 1.5-4-4-4.5 4.5L3 18.5 7.5 14l-4-4L5 8.5l4 1.2 3.2-3.2L10.7 5l3-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const PeopleIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M2.8 19.5c0-3.4 2.8-5.8 6.2-5.8s6.2 2.4 6.2 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M15.3 3.4a3.2 3.2 0 010 6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M16.8 13.9c2.2.6 3.7 2.4 3.7 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const CameraIcon = ({ size = 26 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 8a2 2 0 012-2h1.2l.9-1.6A1 1 0 019 3.8h6a1 1 0 01.9.6L16.8 6H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)
const ClipboardIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 4a1 1 0 011-1h4a1 1 0 011 1v1H9V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8.5 11h7M8.5 15h7M8.5 8.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const PaperclipIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8 12.5l6.5-6.5a3 3 0 014.2 4.2l-8 8a5 5 0 01-7-7l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const MailIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 6.5l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CalendarIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const SearchIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const ImageIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="8.5" cy="9.5" r="1.7" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PinIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)
const PhoneIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M10.5 18h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const LockIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const LinkIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9.5 14.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M11 6.5l1-1a4 4 0 015.6 5.6l-1.4 1.4M13 17.5l-1 1a4 4 0 01-5.6-5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GlobeIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const ShareIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 15V3M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const HelpCircleIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9.5 9.2a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
  </svg>
)
const WarningIcon = ({ size = 13 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3.5L22 20.5H2L12 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="17.5" r="0.9" fill="currentColor"/>
  </svg>
)
const StarIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l3 6.4 6.9.8-5.1 4.8 1.4 6.9L12 17.8l-6.2 3.6 1.4-6.9-5.1-4.8 6.9-.8L12 2.5z"/></svg>
)
const BoltIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M13 2.5L4.5 14h6l-1.5 7.5L18.5 10h-6L13 2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
)
const MicIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5.5 11a6.5 6.5 0 0013 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 17.5V21M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const SendIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const SpeakerIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 9.5h3.5L13 5.5v13L7.5 14.5H4v-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const VibrationIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8" y="4" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M3 9v6M21 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const EyeIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
)
const LightbulbIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18h6M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 2.5a6.5 6.5 0 00-3.8 11.8c.6.5 1 1.2 1 2v.7h5.6v-.7c0-.8.4-1.5 1-2A6.5 6.5 0 0012 2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const XLogoIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
)
const TelegramIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 4L3 11.5l6 2M21 4l-3 16-6-4.5M21 4L9 13.5m0 0v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const BriefcaseIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8.5 7.5V6a2 2 0 012-2h3a2 2 0 012 2v1.5M3 12.5h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)
const OutboxIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3v11M8 8l4-5 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SignalIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 18 13" fill="none">
    <rect x="0" y="8.5" width="3" height="4.5" rx="0.6" fill="currentColor"/>
    <rect x="5" y="6" width="3" height="7" rx="0.6" fill="currentColor"/>
    <rect x="10" y="3.5" width="3" height="9.5" rx="0.6" fill="currentColor"/>
    <rect x="15" y="0" width="3" height="13" rx="0.6" fill="currentColor"/>
  </svg>
)
const WifiIcon = ({ size = 15 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 16" fill="none">
    <path d="M1 5.5a13 13 0 0118 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M4.3 9.3a8.3 8.3 0 0111.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M7.6 13a3.7 3.7 0 014.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <circle cx="10" cy="15.3" r="1" fill="currentColor"/>
  </svg>
)
const BatteryIcon = ({ size = 25 }: IconProps) => (
  <svg width={size} height={size * 0.48} viewBox="0 0 25 12" fill="none">
    <rect x="0.75" y="0.75" width="20" height="10.5" rx="2.5" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    <rect x="2.25" y="2.25" width="17" height="7.5" rx="1.5" fill="currentColor"/>
    <rect x="22" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4"/>
  </svg>
)
import logoImg from '@/imports/logo.png'
import { t, type Lang } from './i18n'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen =
  | 'langSelect'
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'profileSetup'
  | 'contacts'
  | 'notifPerm'
  | 'home'
  | 'notes'
  | 'taskList'
  | 'taskDetail'
  | 'createTask'
  | 'projectDetail'
  | 'notifications'
  | 'profile'
  | 'projects'
  | 'taskReport'
  | 'langChange'
  | 'terms'
  | 'privacy'
  | 'createProject'
  | 'conversations'
  | 'chat'
  | 'notifSettings'
  | 'contactsSettings'
  | 'shareApp'
  | 'help'
  | 'search'

/// null fields mean "not collected yet" — screens fall back to the localized demo name/phone.
/// `id` is only set once a real backend session exists (see OTPScreen) — null means the
/// current screen state is still the local design mockup, not a live account.
interface CurrentUser {
  id: string | null
  name: string | null
  phone: string | null
  photo: string | null
}

type TaskStatus = 'not_started' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  titleEn: string
  status: TaskStatus
  assignee: string
  dueDate: string
  dueDateEn: string
  /// Raw ISO due date from the backend, kept alongside the display-formatted `dueDate`/
  /// `dueDateEn` above so EditTaskSheet can tell "no change" apart from "clear the date"
  /// without having to parse the localized display string back into a Date.
  dueDateIso?: string
  project?: string
  projectEn?: string
  updates: number
  participants: string[]
  description?: string
  descriptionEn?: string
  /// Set when this Task was loaded from the real backend (see mapBackendTask) — TaskDetailScreen
  /// uses this to fetch full detail (checklist/updates/participants) instead of trusting the
  /// summary fields passed in from the list. Seeded TASKS/LATE_TASKS/UPCOMING_TASKS never have it.
  realId?: string
}

interface Project {
  id: string
  name: string
  nameEn: string
  progress: number
  taskCount: number
  memberCount: number
  lateTasks: number
  description?: string
  color?: string
  realId?: string
}

const backendStatusToLocal: Record<string, TaskStatus> = { NotStarted: 'not_started', InProgress: 'in_progress', Done: 'done' }
const localStatusToBackend: Record<TaskStatus, 'NotStarted' | 'InProgress' | 'Done'> = { not_started: 'NotStarted', in_progress: 'InProgress', done: 'Done' }

function formatDueDate(iso: string | null, lang: Lang): string {
  if (!iso) return lang === 'en' ? 'No date' : 'بدون تاريخ'
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-SA', { month: 'short', day: 'numeric' })
}

function mapBackendTask(t: BackendTaskListItem, lang: Lang): Task {
  const due = formatDueDate(t.dueDate, lang)
  return {
    id: t.id, realId: t.id,
    title: t.title, titleEn: t.title,
    status: backendStatusToLocal[t.status] ?? 'not_started',
    assignee: t.ownerName ?? '',
    dueDate: due, dueDateEn: due, dueDateIso: t.dueDate ?? undefined,
    project: t.projectName ?? undefined, projectEn: t.projectName ?? undefined,
    updates: 0,
    participants: t.ownerName ? [t.ownerName] : [],
  }
}

function mapBackendTaskDetail(t: BackendTaskDetail, lang: Lang): Task {
  const due = formatDueDate(t.dueDate, lang)
  return {
    id: t.id, realId: t.id,
    title: t.title, titleEn: t.title,
    status: backendStatusToLocal[t.status] ?? 'not_started',
    assignee: t.ownerName ?? '',
    dueDate: due, dueDateEn: due, dueDateIso: t.dueDate ?? undefined,
    project: t.projectName ?? undefined, projectEn: t.projectName ?? undefined,
    updates: 0,
    participants: t.participants.map(p => p.name),
    description: t.description ?? undefined, descriptionEn: t.description ?? undefined,
  }
}

function mapBackendProject(p: BackendProjectListItem): Project {
  return {
    id: p.id, realId: p.id,
    name: p.name, nameEn: p.name,
    progress: p.progress ?? 0,
    taskCount: p.taskCount,
    memberCount: p.memberCount,
    lateTasks: 0,
    description: p.description ?? undefined,
    color: p.color,
  }
}

interface Update {
  id: string
  author: string
  text: string
  textEn: string
  time: string
  file?: { name: string; size: string }
  isSystem?: boolean
  authorId?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  {
    id: '1',
    title: 'مراجعة عقد المدرسة',
    titleEn: 'Review school contract',
    status: 'in_progress',
    assignee: 'أحمد',
    dueDate: 'اليوم',
    dueDateEn: 'Today',
    project: 'افتتاح الفرع',
    projectEn: 'Branch Opening',
    updates: 8,
    participants: ['محمد', 'سارة', 'خالد'],
    description: 'مراجعة النسخة النهائية من العقد والتأكد من البنود المالية.',
    descriptionEn: 'Review the final version of the contract and verify the financial terms.',
  },
  {
    id: '2',
    title: 'تجهيز عرض التصميم',
    titleEn: 'Prepare design presentation',
    status: 'not_started',
    assignee: 'سارة',
    dueDate: 'غداً',
    dueDateEn: 'Tomorrow',
    project: 'افتتاح الفرع',
    projectEn: 'Branch Opening',
    updates: 2,
    participants: ['أحمد'],
  },
  {
    id: '3',
    title: 'تراخيص المبنى',
    titleEn: 'Building permits',
    status: 'in_progress',
    assignee: 'خالد',
    dueDate: 'أمس',
    dueDateEn: 'Yesterday',
    project: 'افتتاح الفرع',
    projectEn: 'Branch Opening',
    updates: 14,
    participants: ['محمد', 'أحمد'],
    description: 'متابعة ملف التراخيص مع الجهة المختصة.',
    descriptionEn: 'Follow up on the permits file with the relevant authority.',
  },
  {
    id: '4',
    title: 'توظيف مدير المتجر',
    titleEn: 'Hire store manager',
    status: 'not_started',
    assignee: 'محمد',
    dueDate: 'الأسبوع القادم',
    dueDateEn: 'Next week',
    updates: 0,
    participants: [],
  },
]

const LATE_TASKS: Task[] = [
  {
    id: '5',
    title: 'إرسال تقرير المبيعات',
    titleEn: 'Send sales report',
    status: 'in_progress',
    assignee: 'أحمد',
    dueDate: 'منذ يومين',
    dueDateEn: '2 days ago',
    updates: 3,
    participants: ['محمد'],
  },
]

const UPCOMING_TASKS: Task[] = [
  {
    id: '6',
    title: 'اجتماع مجلس الإدارة',
    titleEn: 'Board meeting',
    status: 'not_started',
    assignee: 'محمد',
    dueDate: 'بعد غد',
    dueDateEn: 'Day after tomorrow',
    updates: 0,
    participants: ['سارة', 'خالد', 'أحمد'],
  },
  {
    id: '7',
    title: 'تحديث لوحة الأسعار',
    titleEn: 'Update price board',
    status: 'not_started',
    assignee: 'سارة',
    dueDate: '12 أغسطس',
    dueDateEn: 'Aug 12',
    updates: 1,
    participants: ['أحمد'],
  },
]

const PROJECTS: Project[] = [
  { id: 'p1', name: 'افتتاح الفرع الجديد', nameEn: 'New Branch Opening', progress: 75, taskCount: 12, memberCount: 4, lateTasks: 3 },
  { id: 'p2', name: 'حملة التسويق Q3', nameEn: 'Q3 Marketing Campaign', progress: 40, taskCount: 8, memberCount: 3, lateTasks: 0 },
  { id: 'p3', name: 'تطوير الموقع الإلكتروني', nameEn: 'Website Development', progress: 90, taskCount: 20, memberCount: 5, lateTasks: 1 },
]

const UPDATES: Update[] = [
  { id: 'u0', author: '', text: 'تم إنشاء المهمة', textEn: 'Task created', time: '09:00', isSystem: true },
  { id: 'u1', author: 'أحمد', text: 'بدأت مراجعة العقد.', textEn: 'Started reviewing the contract.', time: '09:42' },
  { id: 'u2', author: 'محمد', text: 'تم رفع النسخة الجديدة.', textEn: 'Uploaded the new version.', time: '10:15', file: { name: 'Final Contract.pdf', size: '2.4 MB' } },
  { id: 'u3', author: 'سارة', text: 'راجعت البنود المالية. هناك تعديل بسيط في المادة 5.', textEn: 'Reviewed the financial terms. Minor edit needed in clause 5.', time: '11:02' },
  { id: 'u4', author: 'أحمد', text: 'تم التعديل وإعادة الرفع.', textEn: 'Updated and re-uploaded.', time: '11:45' },
  { id: 'u5', author: 'خالد', text: 'في انتظار الموافقة النهائية من المدير.', textEn: "Waiting for manager's final approval.", time: '12:30' },
]

const NOTIFS_AR = [
  { id: 'n1', icon: <CheckIcon size={15} />, text: 'أحمد عيّنك مسؤولاً عن مهمة مراجعة العقد', time: 'منذ 5 د', read: false },
  { id: 'n2', icon: <ChatsIcon size={15} />, text: 'سارة أضافت تحديثاً إلى مهمة العقد', time: 'منذ 20 د', read: false },
  { id: 'n3', icon: <span style={{ fontWeight: 700 }}>@</span>, text: 'محمد ذكرك في مهمة التراخيص', time: 'منذ ساعة', read: false },
  { id: 'n4', icon: <CalendarIcon size={15} />, text: 'موعد مهمة إرسال التقرير غداً', time: 'منذ 3 س', read: true },
  { id: 'n5', icon: <CheckIcon size={15} />, text: 'أحمد أكمل مهمة تصميم الهوية', time: 'أمس', read: true },
  { id: 'n6', icon: <ChatsIcon size={15} />, text: 'خالد أضاف تحديثاً إلى مهمة التراخيص', time: 'أمس', read: true },
]

const NOTIFS_EN = [
  { id: 'n1', icon: <CheckIcon size={15} />, text: 'Ahmed assigned you as owner of Review contract task', time: '5m ago', read: false },
  { id: 'n2', icon: <ChatsIcon size={15} />, text: 'Sara added an update to the contract task', time: '20m ago', read: false },
  { id: 'n3', icon: <span style={{ fontWeight: 700 }}>@</span>, text: 'Mohammed mentioned you in the permits task', time: '1h ago', read: false },
  { id: 'n4', icon: <CalendarIcon size={15} />, text: 'Sales report task due tomorrow', time: '3h ago', read: true },
  { id: 'n5', icon: <CheckIcon size={15} />, text: 'Ahmed completed the branding task', time: 'Yesterday', read: true },
  { id: 'n6', icon: <ChatsIcon size={15} />, text: 'Khaled added an update to the permits task', time: 'Yesterday', read: true },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#2185C7', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']
function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function Avatar({ name, size = 32, photo }: { name: string; size?: number; photo?: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: getAvatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: size * 0.4, flexShrink: 0 }}>
      {name[0]}
    </div>
  )
}

function StatusDot({ color, size = 7 }: { color: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
}

function StatusBadge({ status, lang }: { status: TaskStatus; lang: Lang }) {
  const tr = t[lang]
  const map = {
    not_started: { label: tr.notStarted, color: '#6B7280', bg: '#F3F4F6' },
    in_progress: { label: tr.inProgress, color: '#D97706', bg: '#FEF3C7' },
    done: { label: tr.done, color: '#059669', bg: '#D1FAE5' },
  }
  const s = map[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: s.color, background: s.bg }}>
      <StatusDot color={s.color} /> {s.label}
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ background: '#E5E7EB', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: '#2185C7', borderRadius: 4, transition: 'width 0.5s' }} />
    </div>
  )
}

// ─── Shared: BackButton ──────────────────────────────────────────────────────

function BackButton({ onBack, lang }: { onBack: () => void; lang?: Lang }) {
  const isRtl = lang === 'ar'
  return (
    <button
      onClick={onBack}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 12,
        background: '#F5F7FA',
        border: '1px solid #E5E7EB',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {isRtl
          ? <path d="M7 4l5 5-5 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M11 4L6 9l5 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  )
}

// ─── Screen: Language Select ──────────────────────────────────────────────────

function LangSelectScreen({ onSelect }: { onSelect: (lang: Lang) => void }) {
  const [selected, setSelected] = useState<Lang | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '32px 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <img src={logoImg} alt="TaskUp" style={{ width: 80, height: 80, objectFit: 'contain' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: 'IBM Plex Sans Arabic' }}>اختر لغتك</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', fontFamily: 'Inter' }}>Choose your language</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          {([
            { lang: 'ar' as Lang, label: 'العربية', sub: 'Arabic', dir: 'rtl' as const },
            { lang: 'en' as Lang, label: 'English', sub: 'الإنجليزية', dir: 'ltr' as const },
          ]).map(opt => (
            <button
              key={opt.lang}
              onClick={() => setSelected(opt.lang)}
              style={{
                width: '100%',
                padding: '18px 20px',
                border: `2px solid ${selected === opt.lang ? '#2185C7' : '#E5E7EB'}`,
                borderRadius: 16,
                background: selected === opt.lang ? '#EBF5FF' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: selected === opt.lang ? '#2185C7' : '#F5F7FA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, transition: 'all 0.15s', flexShrink: 0,
              }}>
                {opt.lang === 'ar' ? '🇸🇦' : '🇬🇧'}
              </div>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{
                  fontSize: 17, fontWeight: 700,
                  color: selected === opt.lang ? '#2185C7' : '#111827',
                  fontFamily: opt.dir === 'rtl' ? 'IBM Plex Sans Arabic' : 'Inter',
                  direction: opt.dir,
                }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', fontFamily: opt.dir === 'rtl' ? 'Inter' : 'IBM Plex Sans Arabic' }}>
                  {opt.sub}
                </div>
              </div>
              {selected === opt.lang && (
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2185C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><CheckIcon size={12} /></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        style={{
          width: '100%', padding: '16px',
          background: selected ? '#2185C7' : '#E5E7EB',
          color: selected ? '#fff' : '#9CA3AF',
          border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 600,
          cursor: selected ? 'pointer' : 'default',
          fontFamily: selected === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter',
          transition: 'background 0.2s',
        }}
      >
        {selected === 'en' ? 'Continue' : selected === 'ar' ? 'متابعة' : 'Continue / متابعة'}
      </button>
    </div>
  )
}

// ─── Screen: Lang Change (from Profile) ───────────────────────────────────────

function LangChangeScreen({ current, onBack, onSelect }: { current: Lang; onBack: () => void; onSelect: (lang: Lang) => void }) {
  const [selected, setSelected] = useState<Lang>(current)
  const tr = t[current]
  const isRtl = current === 'ar'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={current} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{tr.language}</span>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {([
          { lang: 'ar' as Lang, label: 'العربية', sub: 'Arabic', flag: '🇸🇦', dir: 'rtl' as const },
          { lang: 'en' as Lang, label: 'English', sub: 'الإنجليزية', flag: '🇬🇧', dir: 'ltr' as const },
        ]).map(opt => (
          <button
            key={opt.lang}
            onClick={() => setSelected(opt.lang)}
            style={{
              width: '100%', padding: '16px',
              border: `2px solid ${selected === opt.lang ? '#2185C7' : '#E5E7EB'}`,
              borderRadius: 16,
              background: selected === opt.lang ? '#EBF5FF' : '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{opt.flag}</span>
            <div style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: selected === opt.lang ? '#2185C7' : '#111827', fontFamily: opt.lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>{opt.label}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{opt.sub}</div>
            </div>
            {selected === opt.lang && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2185C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><CheckIcon size={12} /></div>
            )}
          </button>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: 16, right: 16 }}>
        <button
          onClick={() => onSelect(selected)}
          style={{
            width: '100%', padding: '16px',
            background: '#2185C7', color: '#fff',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            fontFamily: selected === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter',
          }}
        >
          {selected === 'ar' ? 'حفظ' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Screen: Welcome ──────────────────────────────────────────────────────────

function WelcomeScreen({ onRegister, onLogin, lang, onBack, onTerms, onPrivacy }: {
  onRegister: () => void
  onLogin: () => void
  lang: Lang
  onBack: () => void
  onTerms: () => void
  onPrivacy: () => void
}) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', background: '#fff' }}>
      <div style={{ marginBottom: 8 }}>
        <BackButton onBack={onBack} lang={lang} />
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%' }}>
        <img src={logoImg} alt="TaskUp Logo" style={{ width: 88, height: 88, objectFit: 'contain' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: 'Inter' }}>TaskUp</div>
          <div style={{ fontSize: 15, color: '#2185C7', fontWeight: 600 }}>{tr.tagline}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3, fontFamily: isRtl ? 'Inter' : 'IBM Plex Sans Arabic' }}>{tr.taglineEn}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {[tr.point1, tr.point2, tr.point3].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4B5563', fontSize: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2185C7', flexShrink: 0 }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Register */}
        <button
          onClick={onRegister}
          style={{ width: '100%', padding: '16px', background: '#2185C7', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
        >
          {tr.startNow}
        </button>

        {/* Login */}
        <button
          onClick={onLogin}
          style={{ width: '100%', padding: '15px', background: '#fff', color: '#2185C7', border: '2px solid #2185C7', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
        >
          {tr.signIn}
        </button>

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.8, margin: 0 }}>
          {lang === 'ar' ? 'بالمتابعة توافق على ' : 'By continuing you agree to our '}
          <span onClick={onTerms} style={{ color: '#2185C7', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{tr.termsOfUse}</span>
          {lang === 'ar' ? ' و' : ' and '}
          <span onClick={onPrivacy} style={{ color: '#2185C7', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{tr.privacyPolicy}</span>
        </p>
      </div>
    </div>
  )
}

// ─── Screen: Phone ────────────────────────────────────────────────────────────

function PhoneScreen({ onNext, onBack, onNotRegistered, lang, mode }: { onNext: (phone: string, countryCode: string, requestId: string) => void; onBack: () => void; onNotRegistered: () => void; lang: Lang; mode: 'register' | 'login' }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notRegistered, setNotRegistered] = useState(false)
  const tr = t[lang]
  const isEn = lang === 'en'
  const isRtl = lang === 'ar'
  const countryCode = isEn ? '+1' : '+966'
  const title = mode === 'login' ? tr.loginTitle : tr.welcomeTitle
  const subtitle = mode === 'login' ? tr.loginSubtitle : tr.phoneSubtitle

  const handleNext = async () => {
    setLoading(true)
    setError(null)
    setNotRegistered(false)
    try {
      const { requestId } = await authApi.requestOtp(countryCode, phone, mode === 'login')
      onNext(phone, countryCode, requestId)
    } catch (e) {
      // A 404 while logging in means this specific phone number was never registered —
      // surfaced as a dedicated "create an account instead" prompt rather than a generic
      // error, since silently auto-registering on a login attempt (the previous behavior)
      // meant "تسجيل الدخول" and "إنشاء حساب" were indistinguishable to the backend.
      if (mode === 'login' && e instanceof ApiError && e.status === 404) {
        setNotRegistered(true)
      } else {
        setError(e instanceof Error ? e.message : String(e))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, marginBottom: 28 }}>
        <BackButton onBack={onBack} lang={lang} />
        <img src={logoImg} alt="TaskUp" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        {mode === 'login' && (
          <span style={{ marginInlineStart: 'auto', fontSize: 12, background: '#EBF5FF', color: '#2185C7', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{title}</h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 32px' }}>{subtitle}</p>
        <div dir="ltr" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ padding: '14px', border: '1.5px solid #E5E7EB', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, minWidth: 90, color: '#374151', fontSize: 14, fontWeight: 500, fontFamily: 'Inter' }}>
            {isEn ? '🌍 ' : '🇸🇦 '}{countryCode}
          </div>
          <input data-ltr value={phone} onChange={e => setPhone(e.target.value)} placeholder={tr.phonePlaceholder}
            style={{ flex: 1, padding: '14px 16px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 15, fontFamily: 'Inter', outline: 'none', color: '#111827' }} />
        </div>
        <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>{tr.smsnote}</p>
        {error && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: 12 }}>{error}</p>}
        {notRegistered && (
          <div style={{ marginTop: 16, padding: '14px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#92400E', margin: '0 0 10px' }}>
              {isRtl ? 'رقم جوالك غير مسجّل لدينا.' : "This number isn't registered with us."}
            </p>
            <button onClick={() => { setNotRegistered(false); onNotRegistered() }}
              style={{ padding: '9px 22px', background: '#2185C7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              {isRtl ? 'إنشاء حساب جديد' : 'Create a new account'}
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={handleNext} disabled={phone.length < 8 || loading}
          style={{ width: '100%', padding: '16px', background: phone.length >= 8 && !loading ? '#2185C7' : '#E5E7EB', color: phone.length >= 8 && !loading ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: phone.length >= 8 && !loading ? 'pointer' : 'default', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>
          {loading ? (isRtl ? 'جارٍ الإرسال...' : 'Sending...') : tr.next}
        </button>
        {mode === 'login' && (
          <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: 0 }}>
            {tr.newUser}{' '}
            <span onClick={onNotRegistered} style={{ color: '#2185C7', fontWeight: 600, cursor: 'pointer' }}>{tr.createAccount}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Screen: OTP ─────────────────────────────────────────────────────────────

function OTPScreen({ requestId, onNext, onBack, lang, mode }: {
  requestId: string
  onNext: (profile: BackendUserProfile, isNewUser: boolean) => void
  onBack: () => void
  lang: Lang
  mode: 'register' | 'login'
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null))
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs[i + 1].current?.focus()
  }
  const filled = otp.every(v => v !== '')

  const handleVerify = async () => {
    setLoading(true)
    setError(null)
    try {
      const { accessToken, refreshToken, isNewUser } = await authApi.verifyOtp(requestId, otp.join(''))
      setSession(accessToken, refreshToken)
      const profile = await usersApi.getMe()
      onNext(profile, isNewUser)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '24px' }}>
      <div style={{ paddingTop: 8, marginBottom: 4 }}><BackButton onBack={onBack} lang={lang} /></div>
      <div style={{ flex: 1, paddingTop: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{tr.otpTitle}</h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 32px' }}>{tr.otpSubtitle}</p>
        <div dir="ltr" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {otp.map((v, i) => (
            <input key={i} ref={refs[i]} value={v} maxLength={1} onChange={e => handleChange(i, e.target.value)}
              style={{ width: 44, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700, border: `2px solid ${v ? '#2185C7' : '#E5E7EB'}`, borderRadius: 12, outline: 'none', fontFamily: 'Inter', color: '#111827', transition: 'border-color 0.15s' }} />
          ))}
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
          {tr.notReceived}{' '}
          <span style={{ color: '#2185C7', cursor: 'pointer', fontWeight: 500 }}>{tr.resend}</span>
        </p>
        {error && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: 12 }}>{error}</p>}
      </div>
      <button onClick={handleVerify} disabled={!filled || loading}
        style={{ width: '100%', padding: '16px', background: filled && !loading ? '#2185C7' : '#E5E7EB', color: filled && !loading ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: filled && !loading ? 'pointer' : 'default', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>
        {loading ? (isRtl ? 'جارٍ التحقق...' : 'Verifying...') : tr.verify}
      </button>
    </div>
  )
}

// ─── Screen: Profile Setup ────────────────────────────────────────────────────

function ProfileSetupScreen({ onNext, onBack, lang }: { onNext: (name: string, photo: string | null) => void; onBack: () => void; lang: Lang }) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tr = t[lang]
  // Holds the real backend storage path once upload succeeds — the instant local preview
  // (`photo`, a data: URL) is what's actually shown in this screen and carried forward for
  // in-session display, so upload happening in the background doesn't block the UI.
  const uploadedUrlRef = useRef<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
    filesApi.upload(file).then(result => { uploadedUrlRef.current = result.storageUrl }).catch(() => {})
  }

  const handleNext = async () => {
    setSaving(true)
    try {
      await usersApi.updateMe({ name: name.trim(), avatarUrl: uploadedUrlRef.current ?? undefined })
    } catch {
      // Non-fatal: local screens still work off the name/photo captured here even if
      // the save fails (e.g. session expired mid-registration, or the upload hadn't
      // finished yet when Next was pressed).
    } finally {
      setSaving(false)
      onNext(name.trim(), photo)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '24px' }}>
      <div style={{ paddingTop: 8, marginBottom: 4 }}><BackButton onBack={onBack} lang={lang} /></div>
      <div style={{ flex: 1, paddingTop: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{tr.profileTitle}</h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 32px' }}>{tr.profileSubtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 84, height: 84, borderRadius: '50%',
              background: photo ? `center / cover no-repeat url(${photo})` : '#EBF5FF',
              border: photo ? '2px solid #2185C7' : '2px dashed #2185C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexDirection: 'column', gap: 4, color: '#2185C7',
            }}
          >
            {!photo && <>
              <CameraIcon size={26} />
              <span style={{ fontSize: 11, color: '#2185C7', fontWeight: 500 }}>{tr.addPhoto}</span>
            </>}
          </div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={tr.namePlaceholder}
          style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 16, fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter', outline: 'none', color: '#111827' }} />
      </div>
      <button onClick={handleNext} disabled={!name.trim() || saving}
        style={{ width: '100%', padding: '16px', background: name.trim() && !saving ? '#2185C7' : '#E5E7EB', color: name.trim() && !saving ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: name.trim() && !saving ? 'pointer' : 'default', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>
        {tr.next}
      </button>
    </div>
  )
}

// ─── Screen: Contacts Permission ──────────────────────────────────────────────

function ContactsScreen({ onNext, onBack, lang }: { onNext: () => void; onBack: () => void; lang: Lang }) {
  const tr = t[lang]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '24px' }}>
      <div style={{ paddingTop: 8, marginBottom: 4 }}><BackButton onBack={onBack} lang={lang} /></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2185C7' }}><PeopleIcon size={44} /></div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{tr.contactsTitle}</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>{tr.contactsSubtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onNext} style={{ width: '100%', padding: '16px', background: '#2185C7', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.allowContacts}</button>
        <button onClick={onNext} style={{ width: '100%', padding: '16px', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 14, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.notNow}</button>
      </div>
    </div>
  )
}

// ─── Screen: Notifications Permission ────────────────────────────────────────

function NotifPermScreen({ onNext, onBack, lang }: { onNext: () => void; onBack: () => void; lang: Lang }) {
  const tr = t[lang]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '24px' }}>
      <div style={{ paddingTop: 8, marginBottom: 4 }}><BackButton onBack={onBack} lang={lang} /></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}><BellIcon size={44} /></div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{tr.notifTitle}</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>{tr.notifSubtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onNext} style={{ width: '100%', padding: '16px', background: '#2185C7', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.allowNotif}</button>
        <button onClick={onNext} style={{ width: '100%', padding: '16px', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 14, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.notNow}</button>
      </div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onClick, lang }: { task: Task; onClick: () => void; lang: Lang }) {
  const tr = t[lang]
  const isEn = lang === 'en'
  const title = isEn ? task.titleEn : task.title
  const project = isEn ? task.projectEn : task.project
  const dueDate = isEn ? task.dueDateEn : task.dueDate
  const isLate = task.dueDate.includes('أمس') || task.dueDate.includes('ago') || task.dueDate.includes('منذ') || task.dueDateEn.includes('ago') || task.dueDateEn === 'Yesterday'
  const statusColor = task.status === 'done' ? '#10B981' : task.status === 'in_progress' ? '#D97706' : '#6B7280'
  const statusBg = task.status === 'done' ? '#D1FAE5' : task.status === 'in_progress' ? '#FEF3C7' : '#F3F4F6'
  const statusLabel = task.status === 'done' ? tr.done : task.status === 'in_progress' ? tr.inProgress : tr.notStarted

  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{title}</div>
        {project && <div style={{ fontSize: 12, color: '#2185C7', fontWeight: 500 }}>{project}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: statusColor, background: statusBg }}><StatusDot color={statusColor} /> {statusLabel}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: isLate ? '#EF4444' : '#6B7280', fontWeight: isLate ? 600 : 400 }}>{isLate && <WarningIcon size={12} />}{dueDate}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F5F5F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar name={task.assignee} size={22} />
          <span style={{ fontSize: 12, color: '#4B5563' }}>{task.assignee}</span>
        </div>
        {task.updates > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}><ChatsIcon size={13} /> {task.updates} {isEn ? tr.updates : tr.updates}</span>}
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick, lang }: { project: Project; onClick: () => void; lang: Lang }) {
  const tr = t[lang]
  const isEn = lang === 'en'
  const name = isEn ? project.nameEn : project.name
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{name}</div>
      <ProgressBar value={project.progress} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}><ClipboardIcon size={13} /> {project.taskCount} {tr.tasks}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}><PeopleIcon size={13} /> {project.memberCount} {tr.members}</span>
          {project.lateTasks > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444', fontWeight: 500 }}><WarningIcon size={12} /> {project.lateTasks} {tr.late}</span>}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#2185C7' }}>{project.progress}%</span>
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count, lang, onViewAll }: { title: string; count?: number; lang: Lang; onViewAll?: () => void }) {
  const tr = t[lang]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</span>
        {count !== undefined && <span style={{ fontSize: 12, color: '#fff', background: '#2185C7', borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>{count}</span>}
      </div>
      {/* Only rendered when there's somewhere for it to actually go — previously this was
          a static, unclickable span everywhere it appeared. */}
      {onViewAll && <span onClick={onViewAll} style={{ fontSize: 13, color: '#2185C7', cursor: 'pointer', fontWeight: 500 }}>{tr.viewAll}</span>}
    </div>
  )
}

// ─── Screen: Home ─────────────────────────────────────────────────────────────

function HomeScreen({ onTaskClick, onProjectClick, onCreateClick, onViewAll, onNotifClick, onSearch, onOpenTaskById, unreadNotifCount, lang, currentUser, dataVersion }: {
  onTaskClick: (task: Task) => void
  onProjectClick: (project: Project) => void
  onCreateClick: () => void
  onViewAll: (title: string, tasks: Task[]) => void
  onNotifClick: () => void
  onSearch: () => void
  onOpenTaskById: (taskId: string) => void
  unreadNotifCount: number
  lang: Lang
  currentUser: CurrentUser
  dataVersion: number
}) {
  const tr = t[lang]
  const isEn = lang === 'en'
  const displayName = currentUser.name ?? (isEn ? 'Mohammed Al-Otaibi' : 'محمد العتيبي')

  // Real backend data (see mapBackendTask) — a session always exists by the time this
  // screen renders, since OTPScreen always completes real login/registration first.
  const [nowTasks, setNowTasks] = useState<Task[] | null>(null)
  const [lateTasks, setLateTasks] = useState<Task[] | null>(null)
  const [upcomingTasks, setUpcomingTasks] = useState<Task[] | null>(null)
  // "Team updates" used to be three hardcoded Arabic/English strings. GET /activity
  // returns the real updates other people posted on tasks this user can see.
  const [teamActivity, setTeamActivity] = useState<BackendActivityItem[] | null>(null)

  useEffect(() => {
    if (!currentUser.id) return
    Promise.all([tasksApi.list({ section: 'now' }), tasksApi.list({ section: 'late' }), tasksApi.list({ section: 'upcoming' })])
      .then(([now, late, upcoming]) => {
        setNowTasks(now.map(t => mapBackendTask(t, lang)))
        setLateTasks(late.map(t => mapBackendTask(t, lang)))
        setUpcomingTasks(upcoming.map(t => mapBackendTask(t, lang)))
      })
      .catch(() => { setNowTasks([]); setLateTasks([]); setUpcomingTasks([]) })
  }, [currentUser.id, lang, dataVersion])

  useEffect(() => {
    if (!currentUser.id) return
    activityApi.list().then(items => setTeamActivity(items.slice(0, 8))).catch(() => setTeamActivity([]))
  }, [currentUser.id, dataVersion])

  // null (not []) specifically means "the fetch above hasn't resolved yet" — used to show
  // a loading state instead of flashing placeholder/mock tasks that aren't the user's real data.
  const loadingHome = nowTasks === null
  const displayedNow = nowTasks ?? []
  const displayedLate = lateTasks ?? []
  const displayedUpcoming = upcomingTasks ?? []

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>{tr.goodMorning}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{displayName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={onNotifClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', position: 'relative', padding: 0 }}>
              <BellIcon size={22} />
              {unreadNotifCount > 0 && (
                <div style={{ position: 'absolute', top: -4, insetInlineEnd: -4, minWidth: 15, height: 15, padding: '0 3px', background: '#EF4444', borderRadius: 8, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadNotifCount}</div>
              )}
            </button>
            <Avatar name={displayName} size={40} photo={currentUser.photo} />
          </div>
        </div>
        <button onClick={onSearch}
          style={{ width: '100%', display: 'flex', alignItems: 'center', background: '#F5F7FA', border: 'none', borderRadius: 12, padding: '10px 14px', gap: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ color: '#9CA3AF', display: 'flex' }}><SearchIcon size={16} /></span>
          <span style={{ color: '#9CA3AF', fontSize: 14 }}>{tr.searchPlaceholder}</span>
        </button>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{tr.todayQuestion}</p>

        {loadingHome ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>
            {lang === 'ar' ? 'جارٍ تحميل مهامك...' : 'Loading your tasks...'}
          </div>
        ) : (
          <>
            <div>
              <SectionHeader title={tr.sectionNow} count={displayedNow.length} lang={lang} onViewAll={() => onViewAll(tr.sectionNow, displayedNow)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayedNow.slice(0, 3).map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
              </div>
            </div>

            <div>
              <SectionHeader title={tr.sectionLate} count={displayedLate.length} lang={lang} onViewAll={() => onViewAll(tr.sectionLate, displayedLate)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayedLate.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
              </div>
            </div>

            <div>
              <SectionHeader title={tr.sectionUpcoming} count={displayedUpcoming.length} lang={lang} onViewAll={() => onViewAll(tr.sectionUpcoming, displayedUpcoming)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayedUpcoming.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
              </div>
            </div>
          </>
        )}

        <div>
          <SectionHeader title={tr.sectionTeam} lang={lang} />
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
            {teamActivity === null ? (
              <div style={{ padding: '18px 16px', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                {isEn ? 'Loading updates...' : 'جارٍ تحميل التحديثات...'}
              </div>
            ) : teamActivity.length === 0 ? (
              <div style={{ padding: '18px 16px', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                {isEn ? 'No team updates yet' : 'لا توجد تحديثات من فريقك بعد'}
              </div>
            ) : teamActivity.map((item, i, arr) => (
              <div key={i} onClick={() => onOpenTaskById(item.taskId)}
                style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <Avatar name={item.authorName} size={32} photo={item.authorAvatarUrl ? absoluteStorageUrl(item.authorAvatarUrl) : null} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.authorName}</div>
                  <div style={{ fontSize: 13, color: '#4B5563' }}>{item.text || (isEn ? 'Updated the task' : 'حدّث المهمة')}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.taskTitle}</div>
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{timeAgo(item.createdAt, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onCreateClick} style={{ position: 'sticky', bottom: 20, right: '50%', transform: 'translateX(50%)', display: 'flex', alignItems: 'center', gap: 8, background: '#2185C7', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(33,133,199,0.35)', fontFamily: lang === 'ar' ? 'IBM Plex Sans Arabic' : 'Inter', marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 400 }}>+</span> {tr.create}
      </button>
    </div>
  )
}

// ─── Screen: Task List (destination of Home's "View all") ─────────────────────

function TaskListScreen({ title, tasks, onBack, onTaskClick, lang }: { title: string; tasks: Task[]; onBack: () => void; onTaskClick: (t: Task) => void; lang: Lang }) {
  const isRtl = lang === 'ar'
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</span>
      </div>
      {tasks.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
          {isRtl ? 'لا توجد مهام هنا' : 'No tasks here'}
        </div>
      ) : (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
        </div>
      )}
    </div>
  )
}

// ─── Screen: Projects ─────────────────────────────────────────────────────────

// ─── Screen: Search ───────────────────────────────────────────────────────────
// Destination of Home's search bar, backed by the (previously unwired) GET /search.
// The backend scopes every result to what this user may actually see, so nothing here
// needs a client-side permission filter.

const SEARCH_SCOPES = [
  { key: '', ar: 'الكل', en: 'All' },
  { key: 'tasks', ar: 'المهام', en: 'Tasks' },
  { key: 'projects', ar: 'المشاريع', en: 'Projects' },
  { key: 'people', ar: 'الأشخاص', en: 'People' },
  { key: 'conversations', ar: 'المحادثات', en: 'Chats' },
  { key: 'files', ar: 'الملفات', en: 'Files' },
] as const

function SearchScreen({ onBack, onOpenTask, onOpenProject, onOpenPerson, onOpenConversation, lang }: {
  onBack: () => void
  onOpenTask: (taskId: string) => void
  onOpenProject: (projectId: string) => void
  onOpenPerson: (userId: string) => void
  onOpenConversation: (conversationId: string) => void
  lang: Lang
}) {
  const isRtl = lang === 'ar'
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<string>('')
  const [results, setResults] = useState<BackendSearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced so typing doesn't fire an ILIKE query per keystroke.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length === 0) { setResults(null); setError(null); setLoading(false); return }

    setLoading(true)
    const handle = setTimeout(() => {
      searchApi.search(trimmed, scope || undefined)
        .then(res => { setResults(res.items); setError(null) })
        .catch((e: unknown) => { setResults([]); setError(e instanceof ApiError ? e.message : String(e)) })
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [query, scope])

  const typeMeta: Record<BackendSearchResult['type'], { ar: string; en: string; color: string; bg: string; icon: React.ReactNode }> = {
    Task: { ar: 'مهمة', en: 'Task', color: '#2185C7', bg: '#EBF5FF', icon: <CheckCircleIcon size={16} /> },
    Project: { ar: 'مشروع', en: 'Project', color: '#8B5CF6', bg: '#F3E8FF', icon: <ProjectsIcon size={16} /> },
    Person: { ar: 'شخص', en: 'Person', color: '#059669', bg: '#F0FDF4', icon: <PeopleIcon size={16} /> },
    Conversation: { ar: 'محادثة', en: 'Chat', color: '#DB2777', bg: '#FCE7F3', icon: <ChatsIcon size={16} /> },
    File: { ar: 'ملف', en: 'File', color: '#D97706', bg: '#FEF3C7', icon: <ClipboardIcon size={16} /> },
  }

  const openResult = (item: BackendSearchResult) => {
    if (item.type === 'Task') onOpenTask(item.id)
    else if (item.type === 'Project') onOpenProject(item.id)
    else if (item.type === 'Person') onOpenPerson(item.id)
    else if (item.type === 'Conversation') onOpenConversation(item.id)
    // File results have no viewer screen in the app yet — left non-navigating on purpose
    // rather than wired to a dead destination.
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 16px 10px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackButton onBack={onBack} lang={lang} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#F5F7FA', borderRadius: 12, padding: '10px 14px' }}>
            <span style={{ color: '#9CA3AF', display: 'flex' }}><SearchIcon size={16} /></span>
            <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder={isRtl ? 'ابحث في المهام والمشاريع والأشخاص...' : 'Search tasks, projects, people...'}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }} />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}><CloseIcon size={15} /></button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingTop: 10 }}>
          {SEARCH_SCOPES.map(sc => (
            <button key={sc.key} onClick={() => setScope(sc.key)}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                border: `1.5px solid ${scope === sc.key ? '#2185C7' : '#E5E7EB'}`,
                background: scope === sc.key ? '#EBF5FF' : '#fff',
                color: scope === sc.key ? '#2185C7' : '#6B7280',
                fontSize: 12, fontWeight: 600, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
              }}>
              {isRtl ? sc.ar : sc.en}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        {query.trim().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><SearchIcon size={36} /></div>
            <div style={{ fontSize: 14 }}>{isRtl ? 'اكتب للبحث' : 'Type to search'}</div>
          </div>
        ) : loading && results === null ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 13 }}>
            {isRtl ? 'جارٍ البحث...' : 'Searching...'}
          </div>
        ) : error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px', color: '#B91C1C', fontSize: 13 }}>
            {isRtl ? 'تعذّر البحث' : 'Search failed'} — {error}
          </div>
        ) : results && results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><SearchIcon size={36} /></div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{isRtl ? 'لا توجد نتائج' : 'No results found'}</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {(results ?? []).map((item, i, arr) => {
              const meta = typeMeta[item.type]
              const clickable = item.type !== 'File'
              return (
                <div key={`${item.type}_${item.id}_${i}`} onClick={() => openResult(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none', cursor: clickable ? 'pointer' : 'default' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    {item.snippet && (
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.snippet}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, background: meta.bg, borderRadius: 8, padding: '3px 8px', flexShrink: 0 }}>
                    {isRtl ? meta.ar : meta.en}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectsScreen({ onProjectClick, onCreateClick, onTaskClick, lang, currentUserId, refreshKey }: { onProjectClick: (p: Project) => void; onCreateClick: () => void; onTaskClick: (t: Task) => void; lang: Lang; currentUserId: string | null; refreshKey: number }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loading, setLoading] = useState(true)
  // A task can exist without a project (ProjectId is optional on creation) — those tasks
  // don't belong to any project card above, so they're listed separately here rather than
  // being invisible everywhere in the app once they have no owner-based Home section either.
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([])

  useEffect(() => {
    if (!currentUserId) return
    setLoading(true)
    projectsApi.list().then(list => setProjects(list.map(mapBackendProject))).catch(() => setProjects([])).finally(() => setLoading(false))
    tasksApi.list({}).then(list => setUnassignedTasks(list.filter(t => !t.projectId).map(t => mapBackendTask(t, lang)))).catch(() => setUnassignedTasks([]))
  }, [currentUserId, refreshKey, lang])

  const displayed = projects ?? []

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{tr.projects}</div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 32px', color: '#9CA3AF', fontSize: 13 }}>
          {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 32px', gap: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2185C7', marginBottom: 8 }}>
            <ProjectsIcon size={28} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{isRtl ? 'لا توجد مشاريع بعد' : 'No projects yet'}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
            {isRtl ? 'أنشئ أول مشروع لتنظيم مهامك مع فريقك.' : 'Create your first project to organize tasks with your team.'}
          </div>
          <button onClick={onCreateClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2185C7', color: '#fff', border: 'none', borderRadius: 30, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
            <span style={{ fontSize: 18, fontWeight: 400 }}>+</span> {isRtl ? 'إنشاء مشروع' : 'Create project'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(p => <ProjectCard key={p.id} project={p} onClick={() => onProjectClick(p)} lang={lang} />)}
        </div>
      )}

      {unassignedTasks.length > 0 && (
        <div style={{ padding: '0 16px 20px' }}>
          <SectionHeader title={isRtl ? 'مهام بدون مشروع' : 'Tasks without a project'} count={unassignedTasks.length} lang={lang} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unassignedTasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Entity Actions (edit/delete) ──────────────────────────────────────────────
// Shared by TaskDetailScreen and ProjectDetailScreen — a bottom sheet listing Edit/
// Delete, with an inline delete-confirm step (matching ProfileScreen's account-delete
// pattern) instead of a separate confirm dialog.

function EntityActionsSheet({ lang, onClose, onEdit, onDelete, deleting, deleteError }: {
  lang: Lang
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
  deleteError: string | null
}) {
  const isRtl = lang === 'ar'
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '12px 20px 24px' }}>
        <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 14px' }} />
        {!confirming ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 8px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', fontSize: 15, fontWeight: 600, color: '#111827', cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              <EditIcon size={18} /> {isRtl ? 'تعديل' : 'Edit'}
            </button>
            <button onClick={() => setConfirming(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 8px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', fontSize: 15, fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              <TrashIcon size={18} /> {isRtl ? 'حذف' : 'Delete'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: '#991B1B', marginBottom: 12, lineHeight: 1.5 }}>
              {isRtl ? 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this? This cannot be undone.'}
            </div>
            {deleteError && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirming(false)} disabled={deleting} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={onDelete} disabled={deleting} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#DC2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {deleting ? (isRtl ? 'جارٍ الحذف...' : 'Deleting...') : (isRtl ? 'تأكيد الحذف' : 'Confirm delete')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditProjectSheet({ initialName, initialDescription, initialColor, lang, onClose, onSave, saving, error }: {
  initialName: string
  initialDescription: string
  initialColor: string
  lang: Lang
  onClose: () => void
  onSave: (patch: { name: string; description: string; color: string }) => void
  saving: boolean
  error: string | null
}) {
  const isRtl = lang === 'ar'
  const [name, setName] = useState(initialName)
  const [desc, setDesc] = useState(initialDescription)
  const [color, setColor] = useState(initialColor)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: desc.trim(), color })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '86%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{isRtl ? 'تعديل المشروع' : 'Edit project'}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}><CloseIcon size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 10 }}>{isRtl ? 'لون المشروع' : 'Project color'}</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PROJECT_COLORS.map(c => (
                <button key={c.hex} onClick={() => setColor(c.hex)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: c.hex, border: `3px solid ${color === c.hex ? '#111827' : 'transparent'}`, cursor: 'pointer', outline: color === c.hex ? `2px solid ${c.hex}` : 'none' }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{isRtl ? 'اسم المشروع' : 'Project name'}</label>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 15, fontWeight: 600, outline: 'none', color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', background: '#F5F7FA' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{isRtl ? 'الوصف' : 'Description'}</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#374151', resize: 'none', background: '#F5F7FA', outline: 'none', lineHeight: 1.6 }} />
          </div>
        </div>
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #F0F0F0' }}>
          {error && <div style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
          <button onClick={handleSave} disabled={!name.trim() || saving}
            style={{ width: '100%', padding: '14px', background: name.trim() && !saving ? '#2185C7' : '#E5E7EB', color: name.trim() && !saving ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: name.trim() && !saving ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
            {saving ? (isRtl ? 'جارٍ الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Project Detail ───────────────────────────────────────────────────

function ProjectDetailScreen({ project, onBack, onTaskClick, onCreateTask, onUpdated, onDeleted, lang }: { project: Project; onBack: () => void; onTaskClick: (t: Task) => void; onCreateTask: () => void; onUpdated: () => void; onDeleted: () => void; lang: Lang }) {
  const tr = t[lang]
  const isEn = lang === 'en'
  const isRtl = lang === 'ar'
  const isReal = !!project.realId
  const [displayName, setDisplayName] = useState(isEn ? project.nameEn : project.name)

  const [projectTasks, setProjectTasks] = useState<Task[] | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReal || !project.realId) return
    projectsApi.getTasks(project.realId).then(list => setProjectTasks(list.map(t => mapBackendTask(t, lang)))).catch(() => setProjectTasks([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.realId])

  // Real projects show a loading state while their tasks are in flight rather than
  // flashing unrelated demo tasks; non-real (mock) projects never fetch at all, so they
  // keep the demo fallback since there's no real data to wait for.
  const loadingProjectTasks = isReal && projectTasks === null
  const displayedTasks = projectTasks ?? (isReal ? [] : TASKS.slice(0, 3))

  const handleDelete = async () => {
    if (!isReal || !project.realId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await projectsApi.delete(project.realId)
      onDeleted()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e))
      setDeleting(false)
    }
  }

  const handleSaveEdit = async (patch: { name: string; description: string; color: string }) => {
    if (!isReal || !project.realId) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await projectsApi.update(project.realId, patch)
      setDisplayName(updated.name)
      setShowEdit(false)
      onUpdated()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton onBack={onBack} lang={lang} />
          {isReal && (
            <button onClick={() => setShowActions(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '0 4px', display: 'flex' }}><MoreIcon size={20} /></button>
          )}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 12 }}>{displayName}</div>
        <div style={{ background: '#EBF5FF', borderRadius: 14, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>{project.taskCount} {isEn ? `of ${project.progress > 0 ? Math.round(project.taskCount / (project.progress / 100)) : project.taskCount} ${tr.ofTasks}` : `من ${project.progress > 0 ? Math.round(project.taskCount / (project.progress / 100)) : project.taskCount} ${tr.ofTasks}`}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#2185C7' }}>{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {[{ val: project.taskCount, lbl: tr.tasks }, { val: project.lateTasks, lbl: tr.late, red: true }, { val: project.memberCount, lbl: tr.members }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.red ? '#EF4444' : '#111827' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{tr.tasksLabel}</div>
        {loadingProjectTasks ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13 }}>
            {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayedTasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} lang={lang} />)}
          </div>
        )}
      </div>

      {isReal && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 24px' }}>
          <button onClick={onCreateTask} style={{ position: 'sticky', bottom: 20, display: 'flex', alignItems: 'center', gap: 8, background: '#2185C7', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(33,133,199,0.35)', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
            <span style={{ fontSize: 18, fontWeight: 400 }}>+</span> {isRtl ? 'إضافة مهمة' : 'Add task'}
          </button>
        </div>
      )}

      {showActions && (
        <EntityActionsSheet
          lang={lang}
          onClose={() => setShowActions(false)}
          onEdit={() => { setShowActions(false); setShowEdit(true) }}
          onDelete={handleDelete}
          deleting={deleting}
          deleteError={deleteError}
        />
      )}
      {showEdit && (
        <EditProjectSheet
          initialName={displayName}
          initialDescription={project.description ?? ''}
          initialColor={project.color ?? PROJECT_COLORS[0].hex}
          lang={lang}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  )
}

function EditTaskSheet({ initialTitle, initialDescription, currentDueDateLabel, lang, onClose, onSave, saving, error }: {
  initialTitle: string
  initialDescription: string
  currentDueDateLabel: string
  lang: Lang
  onClose: () => void
  onSave: (patch: { title: string; description: string; dueDate?: string }) => void
  saving: boolean
  error: string | null
}) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [title, setTitle] = useState(initialTitle)
  const [details, setDetails] = useState(initialDescription)
  // Empty string = "leave the due date unchanged" — there's no absolute date picker
  // anywhere in this app, only these relative quick-picks (matches CreateTaskScreen).
  const [dueDate, setDueDate] = useState('')
  const DATES = [tr.today, tr.tomorrow, tr.thisWeek, tr.nextWeek]

  const handleSave = () => {
    if (!title.trim()) return
    const now = new Date()
    const dueIso = dueDate === tr.today ? now
      : dueDate === tr.tomorrow ? new Date(now.getTime() + 86400000)
      : dueDate === tr.thisWeek ? new Date(now.getTime() + 4 * 86400000)
      : dueDate === tr.nextWeek ? new Date(now.getTime() + 10 * 86400000)
      : null
    onSave({ title: title.trim(), description: details.trim(), dueDate: dueIso?.toISOString() })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '86%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{isRtl ? 'تعديل المهمة' : 'Edit task'}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}><CloseIcon size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{tr.taskTitleLabel}</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 15, fontWeight: 600, outline: 'none', color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', background: '#F5F7FA' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 10 }}>{tr.dueDateLabel}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DATES.map(d => (
                <button key={d} onClick={() => setDueDate(prev => prev === d ? '' : d)}
                  style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${dueDate === d ? '#2185C7' : '#E5E7EB'}`, background: dueDate === d ? '#EBF5FF' : '#F5F7FA', color: dueDate === d ? '#2185C7' : '#374151', fontSize: 13, fontWeight: dueDate === d ? 600 : 400, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{d}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{isRtl ? `التاريخ الحالي: ${currentDueDateLabel}` : `Current: ${currentDueDateLabel}`}</div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{tr.detailsLabel}</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#374151', resize: 'none', background: '#F5F7FA', outline: 'none', lineHeight: 1.6 }} />
          </div>
        </div>
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #F0F0F0' }}>
          {error && <div style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
          <button onClick={handleSave} disabled={!title.trim() || saving}
            style={{ width: '100%', padding: '14px', background: title.trim() && !saving ? '#2185C7' : '#E5E7EB', color: title.trim() && !saving ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: title.trim() && !saving ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
            {saving ? (isRtl ? 'جارٍ الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التغييرات' : 'Save changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Task Detail ──────────────────────────────────────────────────────

function TaskDetailScreen({ task, onBack, onReport, onUpdated, onDeleted, lang, currentUserId }: { task: Task; onBack: () => void; onReport: () => void; onUpdated: () => void; onDeleted: () => void; lang: Lang; currentUserId: string | null }) {
  const [text, setText] = useState('')
  const [updates, setUpdates] = useState(UPDATES)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const bottomRef = useRef<HTMLDivElement>(null)
  const tr = t[lang]
  const isEn = lang === 'en'
  const isRtl = lang === 'ar'

  // Real task (see mapBackendTask/mapBackendTaskDetail) — comments load/post through the
  // backend instead of the local UPDATES mock array.
  const isReal = !!task.realId
  const [detail, setDetail] = useState<Task>(task)
  const [showActions, setShowActions] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReal || !task.realId) return
    tasksApi.get(task.realId).then(d => setDetail(mapBackendTaskDetail(d, lang))).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.realId])

  const handleDelete = async () => {
    if (!isReal || !task.realId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await tasksApi.delete(task.realId)
      onDeleted()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e))
      setDeleting(false)
    }
  }

  const handleSaveEdit = async (patch: { title: string; description: string; dueDate?: string }) => {
    if (!isReal || !task.realId) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await tasksApi.update(task.realId, patch)
      setDetail(mapBackendTaskDetail(updated, lang))
      setShowEdit(false)
      onUpdated()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!isReal || !task.realId) return
    tasksApi.getUpdates(task.realId).then(({ items }) => {
      setUpdates(items.map(u => ({
        id: u.id, author: u.authorName, authorId: u.authorId, text: u.text ?? '', textEn: u.text ?? '',
        time: new Date(u.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      })))
    }).catch(() => setUpdates([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.realId])

  const sendUpdate = () => {
    if (!text.trim()) return

    if (isReal && task.realId) {
      const pending = text.trim()
      setText('')
      tasksApi.addUpdate(task.realId, pending).then(u => {
        setUpdates(prev => [...prev, {
          id: u.id, author: u.authorName, authorId: u.authorId, text: u.text ?? '', textEn: u.text ?? '',
          time: new Date(u.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        }])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      return
    }

    setUpdates(prev => [...prev, { id: `u${Date.now()}`, author: isEn ? 'Mohammed' : 'محمد', text: text.trim(), textEn: text.trim(), time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }])
    setText('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleMarkDone = () => {
    setStatus('done')
    if (isReal && task.realId) {
      tasksApi.changeStatus(task.realId, 'Done').catch(() => {})
    }
  }

  const myName = isEn ? 'Mohammed' : 'محمد'
  const title = isEn ? detail.titleEn : detail.title
  const dueDate = isEn ? detail.dueDateEn : detail.dueDate
  const description = isEn ? detail.descriptionEn : detail.description

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <BackButton onBack={onBack} lang={lang} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onReport} style={{ background: '#EBF5FF', color: '#2185C7', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.report}</button>
            {isReal && (
              <button onClick={() => setShowActions(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '0 4px', display: 'flex' }}><MoreIcon size={20} /></button>
            )}
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={status} lang={lang} />
          {status !== 'done' && (
            <button onClick={handleMarkDone} style={{ background: '#D1FAE5', color: '#059669', border: 'none', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.markDone}</button>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{tr.assignee}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={detail.assignee} size={22} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{detail.assignee}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{tr.dueDate}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: '#374151' }}><CalendarIcon size={14} /> {dueDate}</div>
          </div>
          {detail.participants.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{tr.sharedWith}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {detail.participants.map(p => <div key={p} style={{ padding: '2px 10px', background: '#EBF5FF', borderRadius: 20, fontSize: 12, color: '#2185C7', fontWeight: 500 }}>{p}</div>)}
              </div>
            </div>
          )}
        </div>
        {description && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#F5F7FA', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{tr.details}</div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{description}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7' }}>
        <div style={{ fontSize: 12, color: '#D97706', fontWeight: 600, marginBottom: 3 }}>{tr.aiSuggestion}</div>
        <div style={{ fontSize: 13, color: '#374151' }}>{tr.aiSuggestionText}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button style={{ padding: '4px 12px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.addAction}</button>
          <button style={{ padding: '4px 12px', background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tr.dismiss}</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F5F7FA', padding: '3px 12px', borderRadius: 20 }}>{isEn ? 'Today' : 'اليوم'}</span>
        </div>
        {updates.map(upd => {
          if (upd.isSystem) return <div key={upd.id} style={{ textAlign: 'center', marginBottom: 8 }}><span style={{ fontSize: 12, color: '#9CA3AF' }}>{isEn ? upd.textEn : upd.text}</span></div>
          const isMine = upd.authorId ? upd.authorId === currentUserId : (upd.author === myName || upd.author === 'محمد' || upd.author === 'Mohammed')
          return (
            <div key={upd.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
              {!isMine && <Avatar name={upd.author} size={28} />}
              <div style={{ maxWidth: '75%' }}>
                {!isMine && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>{upd.author}</div>}
                <div style={{ background: isMine ? '#2185C7' : '#F5F7FA', color: isMine ? '#fff' : '#111827', padding: '10px 12px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.5 }}>
                  {isEn ? upd.textEn : upd.text}
                  {upd.file && (
                    <div style={{ marginTop: 8, background: isMine ? 'rgba(255,255,255,0.15)' : '#fff', border: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : '#E5E7EB'}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'flex' }}><ClipboardIcon size={20} /></span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{upd.file.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>{upd.file.size}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div dir="ltr" style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: isMine ? 'left' : 'right' }}>{upd.time}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid #F0F0F0', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}><PaperclipIcon size={20} /></button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}><CameraIcon size={20} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendUpdate()} placeholder={tr.composerPlaceholder}
            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 24, fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', outline: 'none', color: '#111827', background: '#F5F7FA' }} />
          <button onClick={sendUpdate} style={{ width: 40, height: 40, borderRadius: '50%', background: text.trim() ? '#2185C7' : '#E5E7EB', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.trim() ? '#fff' : '#9CA3AF', transition: 'background 0.15s' }}>
            {text.trim() ? <SendIcon size={17} /> : <MicIcon size={18} />}
          </button>
        </div>
      </div>

      {showActions && (
        <EntityActionsSheet
          lang={lang}
          onClose={() => setShowActions(false)}
          onEdit={() => { setShowActions(false); setShowEdit(true) }}
          onDelete={handleDelete}
          deleting={deleting}
          deleteError={deleteError}
        />
      )}
      {showEdit && (
        <EditTaskSheet
          initialTitle={title}
          initialDescription={description ?? ''}
          currentDueDateLabel={dueDate}
          lang={lang}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  )
}

// ─── MemberPickerSheet ───────────────────────────────────────────────────────

interface ExternalInvite { id: string; label: string; phone: string; sent: boolean }

interface PickedPerson { id: string; name: string }

interface MemberPickerSheetProps {
  lang: Lang
  selected: string[]
  singleSelect?: boolean
  onClose: () => void
  /// `selected` carries real backend user IDs (from /people/search) alongside their display
  /// name, since the caller can no longer resolve a name from PEOPLE_LIST for a real GUID.
  onConfirm: (selected: PickedPerson[], externals: ExternalInvite[]) => void
}

function MemberPickerSheet({ lang, selected: initialSelected, singleSelect, onClose, onConfirm }: MemberPickerSheetProps) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [externals, setExternals] = useState<ExternalInvite[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [realResults, setRealResults] = useState<{ id: string; name: string; nameEn: string; phone: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({})

  // Real backend search (debounced) — replaces the PEOPLE_LIST mock. An empty query is
  // sent too (backend now returns a browsable page of registered users for it), so the
  // sheet shows real people immediately instead of an empty list before anyone types.
  useEffect(() => {
    setSearching(true)
    const handle = setTimeout(() => {
      peopleApi.search(query.trim())
        .then(people => setRealResults(people.map(p => ({ id: p.id, name: p.name, nameEn: p.name, phone: p.phone }))))
        .catch(() => setRealResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  const filtered = realResults
  const noResults = query.length > 0 && !searching && filtered.length === 0

  const toggle = (id: string, name: string) => {
    setSelectedNames(prev => ({ ...prev, [id]: name }))
    if (singleSelect) {
      setSelected([id])
    } else {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
  }

  const sendInvite = () => {
    if (!inviteInput.trim()) return
    const label = inviteName.trim() || inviteInput.trim()
    const newExternal: ExternalInvite = {
      id: `ext-${Date.now()}`,
      label,
      phone: inviteInput.trim(),
      sent: true,
    }
    setExternals(prev => [...prev, newExternal])
    setInviteInput('')
    setInviteName('')
    setShowInviteForm(false)
  }

  const removeExternal = (id: string) => setExternals(prev => prev.filter(e => e.id !== id))

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '82%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Handle */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{tr.addMember}</span>
            <button
              onClick={() => onConfirm(selected.map(id => ({ id, name: selectedNames[id] ?? id })), externals)}
              style={{ background: '#2185C7', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
            >
              {tr.confirmDone}
            </button>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#F5F7FA', borderRadius: 12, padding: '10px 14px', gap: 8, marginBottom: 4 }}>
            <span style={{ color: '#9CA3AF', display: 'flex' }}><SearchIcon size={15} /></span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tr.searchMember}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#111827' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex' }}><CloseIcon size={15} /></button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>

          {/* Selected externals */}
          {externals.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, paddingTop: 4 }}>{tr.inviteExternal}</div>
              {externals.map(ext => (
                <div key={ext.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}><PersonIcon size={19} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{ext.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span style={{ fontSize: 11, background: '#FEF3C7', color: '#D97706', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>{tr.pendingInvite}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter' }}>{ext.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeExternal(ext.id)}
                    style={{ background: '#FEF2F2', border: 'none', color: '#EF4444', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  ><CloseIcon size={13} /></button>
                </div>
              ))}
            </div>
          )}

          {/* TaskUp members */}
          {filtered.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, paddingTop: 4 }}>{tr.onTaskUp}</div>
              {filtered.map((person, i) => {
                const name = lang === 'en' ? person.nameEn : person.name
                const isSelected = selected.includes(person.id)
                return (
                  <div
                    key={person.id}
                    onClick={() => toggle(person.id, name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : 'none', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar name={person.name} size={40} />
                      {isSelected && (
                        <div style={{ position: 'absolute', bottom: -1, insetInlineEnd: -1, width: 16, height: 16, borderRadius: '50%', background: '#2185C7', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <CheckIcon size={9} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>{person.phone}</div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: singleSelect ? '50%' : 7,
                      border: `2px solid ${isSelected ? '#2185C7' : '#D1D5DB'}`,
                      background: isSelected ? '#2185C7' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: '#fff', display: 'flex' }}><CheckIcon size={13} /></span>}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* No results — suggest invite */}
          {noResults && (
            <div style={{ textAlign: 'center', padding: '28px 0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#C0C7D0', marginBottom: 10 }}><SearchIcon size={36} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
                "{query}" {isRtl ? 'ليس على TaskUp بعد' : 'is not on TaskUp yet'}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                {isRtl ? 'يمكنك إرسال دعوة للانضمام' : 'You can send them an invite to join'}
              </div>
              <button
                onClick={() => { setInviteInput(query); setShowInviteForm(true) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EBF5FF', color: '#2185C7', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
              >
                <MailIcon size={15} /> {tr.sendInvite}
              </button>
            </div>
          )}

          {/* Invite by phone button */}
          {!showInviteForm && !noResults && (
            <button
              onClick={() => setShowInviteForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #F0F0F0', marginTop: 8 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2185C7', flexShrink: 0 }}><MailIcon size={18} /></div>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#2185C7' }}>{tr.inviteByPhone}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{tr.notOnTaskUp}</div>
              </div>
            </button>
          )}

          {/* Invite form */}
          {showInviteForm && (
            <div style={{ marginTop: 12, background: '#F5F7FA', borderRadius: 16, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}><MailIcon size={15} /> {tr.inviteByPhone}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                <input
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder={isRtl ? 'الاسم (اختياري)' : 'Name (optional)'}
                  style={{ padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                />
                <input
                  data-ltr
                  value={inviteInput}
                  onChange={e => setInviteInput(e.target.value)}
                  placeholder={isRtl ? '+966 5XX XXX XXX' : '+1 XXX XXX XXXX'}
                  style={{ padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'Inter' }}
                />
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px' }}>{tr.inviteNote}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={sendInvite}
                  disabled={!inviteInput.trim()}
                  style={{ flex: 1, padding: '11px', background: inviteInput.trim() ? '#2185C7' : '#E5E7EB', color: inviteInput.trim() ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: inviteInput.trim() ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                >
                  {tr.sendInvite}
                </button>
                <button
                  onClick={() => { setShowInviteForm(false); setInviteInput(''); setInviteName('') }}
                  style={{ padding: '11px 18px', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Create Task ──────────────────────────────────────────────────────

function CreateTaskScreen({ onBack, onCreate, lang, defaultProjectId, currentUserId, currentUserName }: { onBack: () => void; onCreate: () => void; lang: Lang; defaultProjectId?: string; currentUserId: string | null; currentUserName: string }) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [details, setDetails] = useState('')
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [pickerMode, setPickerMode] = useState<'assignee' | 'participants' | null>(null)
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [externalParticipants, setExternalParticipants] = useState<ExternalInvite[]>([])
  const DATES = [tr.today, tr.tomorrow, tr.thisWeek, tr.nextWeek]

  const [creating, setCreating] = useState(false)
  // assigneeId/participantIds are now real backend user GUIDs (from MemberPickerSheet's
  // /people/search), and their display names are tracked separately since they can no
  // longer be resolved from PEOPLE_LIST.
  const [assigneeName, setAssigneeName] = useState('')
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({})
  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [realProjects, setRealProjects] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    projectsApi.list().then(list => setRealProjects(list.map(p => ({ id: p.id, name: p.name })))).catch(() => {})
  }, [])

  const getParticipantName = (id: string) => participantNames[id] ?? id
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!title.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const now = new Date()
      const dueIso = dueDate === tr.today ? now
        : dueDate === tr.tomorrow ? new Date(now.getTime() + 86400000)
        : dueDate === tr.thisWeek ? new Date(now.getTime() + 4 * 86400000)
        : dueDate === tr.nextWeek ? new Date(now.getTime() + 10 * 86400000)
        : null
      await tasksApi.create({
        title: title.trim(),
        description: details.trim() || undefined,
        dueDate: dueIso?.toISOString(),
        ownerId: assigneeId || undefined,
        participantIds: participantIds.length > 0 ? participantIds : undefined,
        projectId: projectId || undefined,
      })
      onCreate()
    } catch (e) {
      // Previously this silently fell through to onCreate() on failure, showing success
      // even when the task was never actually saved (e.g. during the CORS bug) — now the
      // failure is surfaced instead of hidden.
      setCreateError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA', position: 'relative' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{tr.newTask}</span>
        <div style={{ width: 38 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0' }}>
          <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{tr.taskTitleLabel}</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={tr.taskTitlePlaceholder} autoFocus
            style={{ width: '100%', fontSize: 16, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }} />
        </div>

        {/* Assignee */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0' }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 10 }}>{tr.assigneeLabel}</div>
            {assigneeId ? (
              <div onClick={() => setPickerMode('assignee')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Avatar name={assigneeName} size={32} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827' }}>{assigneeName}</span>
                <span style={{ fontSize: 12, color: '#2185C7', fontWeight: 500 }}>{isRtl ? 'تغيير' : 'Change'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { if (currentUserId) { setAssigneeId(currentUserId); setAssigneeName(currentUserName) } }}
                  disabled={!currentUserId}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #2185C7', background: '#EBF5FF', color: '#2185C7', fontSize: 13, fontWeight: 600, cursor: currentUserId ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                >
                  <PersonIcon size={15} /> {isRtl ? 'أنا المسؤول' : "I'm responsible"}
                </button>
                <button
                  onClick={() => setPickerMode('assignee')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F5F7FA', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                >
                  <PeopleIcon size={15} /> {isRtl ? 'شخص آخر' : 'Someone else'}
                </button>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: '#F5F5F5', marginInline: 16 }} />

          {/* Participants */}
          <div
            onClick={() => setPickerMode('participants')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2185C7', flexShrink: 0 }}><PeopleIcon size={18} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>{isRtl ? 'شارك مع' : 'Share with'}</div>
              {participantIds.length > 0 || externalParticipants.length > 0
                ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {participantIds.map(id => (
                      <span key={id} style={{ background: '#EBF5FF', color: '#2185C7', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}>{getParticipantName(id)}</span>
                    ))}
                    {externalParticipants.map(e => (
                      <span key={e.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', color: '#D97706', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}><MailIcon size={11} /> {e.label}</span>
                    ))}
                  </div>
                )
                : <span style={{ fontSize: 14, color: '#9CA3AF' }}>{isRtl ? 'أضف مشاركين' : 'Add participants'}</span>
              }
            </div>
            <span style={{ color: '#9CA3AF', fontSize: 18 }}>{isRtl ? '←' : '→'}</span>
          </div>
        </div>

        {/* Due date */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0' }}>
          <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 10 }}>{tr.dueDateLabel}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DATES.map(d => (
              <button key={d} onClick={() => setDueDate(d)} style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${dueDate === d ? '#2185C7' : '#E5E7EB'}`, background: dueDate === d ? '#EBF5FF' : '#F5F7FA', color: dueDate === d ? '#2185C7' : '#374151', fontSize: 13, fontWeight: dueDate === d ? 600 : 400, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0' }}>
          <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{tr.detailsLabel}</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder={tr.detailsPlaceholder} rows={3}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#374151', resize: 'none', background: 'transparent', lineHeight: 1.6 }} />
        </div>

        {/* Project */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0' }}>
          <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{tr.projectLabel}</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#374151', background: 'transparent', appearance: 'none' }}>
            <option value="">{tr.projectPlaceholder}</option>
            {realProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        {createError && <div style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 10 }}>{createError}</div>}
        <button onClick={handleCreate} disabled={!title.trim() || creating} style={{ width: '100%', padding: '16px', background: title.trim() && !creating ? '#2185C7' : '#E5E7EB', color: title.trim() && !creating ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: title.trim() && !creating ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
          {creating ? (isRtl ? 'جارٍ الإنشاء...' : 'Creating...') : tr.createBtn}
        </button>
      </div>

      {/* Assignee picker */}
      {pickerMode === 'assignee' && (
        <MemberPickerSheet
          lang={lang}
          selected={assigneeId ? [assigneeId] : []}
          singleSelect
          onClose={() => setPickerMode(null)}
          onConfirm={(sel) => {
            setAssigneeId(sel[0]?.id ?? '')
            setAssigneeName(sel[0]?.name ?? '')
            setPickerMode(null)
          }}
        />
      )}

      {/* Participants picker */}
      {pickerMode === 'participants' && (
        <MemberPickerSheet
          lang={lang}
          selected={participantIds}
          onClose={() => setPickerMode(null)}
          onConfirm={(sel, ext) => {
            setParticipantIds(sel.map(p => p.id))
            setParticipantNames(prev => ({ ...prev, ...Object.fromEntries(sel.map(p => [p.id, p.name])) }))
            setExternalParticipants(ext)
            setPickerMode(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Screen: Task Report ──────────────────────────────────────────────────────

function TaskReportScreen({ task, onBack, lang }: { task: Task; onBack: () => void; lang: Lang }) {
  const tr = t[lang]
  const isEn = lang === 'en'
  const isRtl = lang === 'ar'
  const title = isEn ? task.titleEn : task.title

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{tr.taskReport}</span>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</div>
          <StatusBadge status={task.status} lang={lang} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            {[{ label: tr.assignee, value: task.assignee }, { label: tr.dueDate, value: isEn ? task.dueDateEn : task.dueDate }, { label: tr.lastUpdate, value: tr.agoMinutes }, { label: tr.updateCount, value: `${task.updates} ${tr.updates}` }].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{tr.progress}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2185C7' }}>75%</span>
            </div>
            <ProgressBar value={75} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{tr.completed}</div>
          {(isEn ? ['Review terms', 'Update version'] : ['مراجعة البنود', 'تحديث النسخة']).map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><CheckIcon size={10} /></div>
              <span style={{ fontSize: 14, color: '#374151' }}>{item}</span>
            </div>
          ))}
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 14, marginBottom: 8 }}>{tr.remaining}</div>
          {(isEn ? ['Approve final version'] : ['اعتماد النسخة النهائية']).map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #D1D5DB' }} />
              <span style={{ fontSize: 14, color: '#374151' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '16px', border: '1px solid #FEF3C7' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#D97706', marginBottom: 8 }}>{tr.aiSummaryLabel}</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{tr.aiSummaryText}</p>
        </div>

        <div style={{ background: '#FEF2F2', borderRadius: 14, padding: '16px', border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>{tr.riskLabel}</div>
          <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{tr.riskText}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{tr.lastActivity}</div>
          {UPDATES.slice(-3).map(upd => (
            <div key={upd.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              {upd.author && <Avatar name={upd.author} size={28} />}
              <div style={{ flex: 1 }}>
                {upd.author && <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{upd.author}</div>}
                <div style={{ fontSize: 13, color: '#4B5563' }}>{isEn ? upd.textEn : upd.text}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{upd.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Notifications ────────────────────────────────────────────────────

const notificationCategoryIcon: Record<string, React.ReactNode> = {
  TaskAssigned: <CheckIcon size={15} />,
  TaskUpdated: <ChatsIcon size={15} />,
  Mention: <span style={{ fontWeight: 700 }}>@</span>,
  DueDateOverdue: <CalendarIcon size={15} />,
  ProjectUpdates: <ProjectsIcon size={15} />,
  NewMessage: <ChatsIcon size={15} />,
}

function timeAgo(iso: string, lang: Lang): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return lang === 'en' ? `${mins}m ago` : `منذ ${mins} د`
  const hours = Math.round(mins / 60)
  if (hours < 24) return lang === 'en' ? `${hours}h ago` : `منذ ${hours} س`
  const days = Math.round(hours / 24)
  return lang === 'en' ? `${days}d ago` : `منذ ${days} يوم`
}

function NotificationsScreen({ lang, currentUserId, onBack }: { lang: Lang; currentUserId: string | null; onBack: () => void }) {
  const tr = t[lang]
  const [realNotifs, setRealNotifs] = useState<{ id: string; icon: React.ReactNode; text: string; time: string; read: boolean }[] | null>(null)

  useEffect(() => {
    if (!currentUserId) return
    notificationsApi.list().then(items => {
      setRealNotifs(items.map(n => ({
        id: n.id,
        icon: notificationCategoryIcon[n.category] ?? <BellIcon size={15} />,
        text: n.title + (n.body ? ` — ${n.body}` : ''),
        time: timeAgo(n.createdAt, lang),
        read: n.readAt !== null,
      })))
    }).catch(() => setRealNotifs([]))
  }, [currentUserId, lang])

  const NOTIFS = realNotifs ?? (lang === 'en' ? NOTIFS_EN : NOTIFS_AR)
  const unread = NOTIFS.filter(n => !n.read)
  const read = NOTIFS.filter(n => n.read)

  const handleMarkAllRead = () => {
    if (!realNotifs) return
    notificationsApi.markAllRead().then(() => setRealNotifs(prev => prev?.map(n => ({ ...n, read: true })) ?? null)).catch(() => {})
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onBack={onBack} lang={lang} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{tr.notifications}</span>
        </div>
        <span onClick={handleMarkAllRead} style={{ fontSize: 13, color: '#2185C7', cursor: 'pointer', fontWeight: 500 }}>{tr.markAllRead}</span>
      </div>
      <div style={{ padding: '16px' }}>
        {unread.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>{tr.newSection}</div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: 20 }}>
              {unread.map((n, i) => (
                <div key={n.id} style={{ padding: '14px 16px', borderBottom: i < unread.length - 1 ? '1px solid #F5F5F5' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start', background: '#EBF5FF' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2185C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', flexShrink: 0, fontWeight: 600 }}>{n.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#111827', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{n.time}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2185C7', marginTop: 6, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </>
        )}
        {read.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>{tr.earlierSection}</div>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
              {read.map((n, i) => (
                <div key={n.id} style={{ padding: '14px 16px', borderBottom: i < read.length - 1 ? '1px solid #F5F5F5' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B7280', flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Profile ──────────────────────────────────────────────────────────

// ─── Screen: Notification Settings ───────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 46, height: 26, borderRadius: 13, background: on ? '#2185C7' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </div>
  )
}

// UI row ⇄ backend field mapping. "Tasks" covers two server-side categories (TaskAssigned
// and TaskUpdated) which the design only ever exposed as one row, so they toggle together.
// The original design also had two separate email rows ("Email Digest" and "Weekly Report")
// with only one backend field (WeeklyEmail) behind them — collapsed into the single row
// below rather than shipping two switches that silently fight over the same value.
type NotifSettingKey = 'tasks' | 'projects' | 'mentions' | 'deadlines' | 'chats' | 'sounds' | 'vibration' | 'preview' | 'weekly'
type NotifSettingsState = Record<NotifSettingKey, boolean>

const PREFERENCE_KEYS: NotifSettingKey[] = ['tasks', 'projects', 'mentions', 'deadlines', 'chats']

function preferencesPatchFor(key: NotifSettingKey, value: boolean): Partial<BackendNotificationPreferences> {
  switch (key) {
    case 'tasks': return { taskAssigned: value, taskUpdated: value }
    case 'projects': return { projectUpdates: value }
    case 'mentions': return { mention: value }
    case 'deadlines': return { dueDateOverdue: value }
    case 'chats': return { newMessage: value }
    default: return {}
  }
}

function deliveryPatchFor(key: NotifSettingKey, value: boolean): Partial<BackendNotificationDeliverySettings> {
  switch (key) {
    case 'sounds': return { sound: value }
    case 'vibration': return { vibration: value }
    case 'preview': return { preview: value }
    case 'weekly': return { weeklyEmail: value }
    default: return {}
  }
}

function NotifSettingsScreen({ onBack, lang }: { onBack: () => void; lang: Lang }) {
  const isRtl = lang === 'ar'
  // These toggles are real: NotificationPublisher checks the preference row before it
  // writes a notification at all, so switching one off actually stops the notification.
  const [settings, setSettings] = useState<NotifSettingsState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([notificationSettingsApi.getPreferences(), notificationSettingsApi.getDeliverySettings()])
      .then(([prefs, delivery]) => {
        setSettings({
          tasks: prefs.taskAssigned || prefs.taskUpdated,
          projects: prefs.projectUpdates,
          mentions: prefs.mention,
          deadlines: prefs.dueDateOverdue,
          chats: prefs.newMessage,
          sounds: delivery.sound,
          vibration: delivery.vibration,
          preview: delivery.preview,
          weekly: delivery.weeklyEmail,
        })
        setError(null)
      })
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : String(e)))
  }, [])

  // Optimistic: flip the switch immediately, roll the whole map back if the PATCH fails.
  const applyChanges = (changes: Partial<NotifSettingsState>) => {
    if (!settings) return
    const previous = settings
    const next = { ...settings, ...changes }
    setSettings(next)
    setError(null)

    let prefPatch: Partial<BackendNotificationPreferences> = {}
    let deliveryPatch: Partial<BackendNotificationDeliverySettings> = {}
    for (const [k, v] of Object.entries(changes) as [NotifSettingKey, boolean][]) {
      prefPatch = { ...prefPatch, ...preferencesPatchFor(k, v) }
      deliveryPatch = { ...deliveryPatch, ...deliveryPatchFor(k, v) }
    }

    const calls: Promise<unknown>[] = []
    if (Object.keys(prefPatch).length > 0) calls.push(notificationSettingsApi.updatePreferences(prefPatch))
    if (Object.keys(deliveryPatch).length > 0) calls.push(notificationSettingsApi.updateDeliverySettings(deliveryPatch))

    Promise.all(calls).catch((e: unknown) => {
      setSettings(previous)
      setError(e instanceof ApiError ? e.message : String(e))
    })
  }

  const toggle = (k: NotifSettingKey) => { if (settings) applyChanges({ [k]: !settings[k] } as Partial<NotifSettingsState>) }

  const sections = [
    {
      title: isRtl ? 'إشعارات التطبيق' : 'App Notifications',
      rows: [
        { key: 'tasks' as const, icon: <CheckCircleIcon size={16} />, iconColor: '#059669', iconBg: '#F0FDF4', label: isRtl ? 'المهام' : 'Tasks', sub: isRtl ? 'تحديثات وتعيينات المهام' : 'Task updates and assignments' },
        { key: 'projects' as const, icon: <ProjectsIcon size={16} />, iconColor: '#2185C7', iconBg: '#EBF5FF', label: isRtl ? 'المشاريع' : 'Projects', sub: isRtl ? 'أنشطة المشاريع' : 'Project activities' },
        { key: 'mentions' as const, icon: <span style={{ fontSize: 15, fontWeight: 700 }}>@</span>, iconColor: '#8B5CF6', iconBg: '#F3E8FF', label: isRtl ? 'الإشارات' : 'Mentions', sub: isRtl ? 'عند ذكرك في محادثة' : 'When someone mentions you' },
        { key: 'deadlines' as const, icon: <CalendarIcon size={16} />, iconColor: '#D97706', iconBg: '#FEF3C7', label: isRtl ? 'المواعيد النهائية' : 'Deadlines', sub: isRtl ? 'تذكير قبل انتهاء الموعد' : 'Reminder before due date' },
        { key: 'chats' as const, icon: <ChatsIcon size={16} />, iconColor: '#DB2777', iconBg: '#FCE7F3', label: isRtl ? 'المحادثات' : 'Chats', sub: isRtl ? 'الرسائل الجديدة' : 'New messages' },
      ],
    },
    {
      title: isRtl ? 'الصوت والاهتزاز' : 'Sound & Vibration',
      rows: [
        { key: 'sounds' as const, icon: <SpeakerIcon size={16} />, iconColor: '#D97706', iconBg: '#FEF3C7', label: isRtl ? 'الأصوات' : 'Sounds', sub: isRtl ? 'تشغيل صوت عند الإشعار' : 'Play sound on notification' },
        { key: 'vibration' as const, icon: <VibrationIcon size={16} />, iconColor: '#059669', iconBg: '#F0FDF4', label: isRtl ? 'الاهتزاز' : 'Vibration', sub: isRtl ? 'الاهتزاز عند الإشعار' : 'Vibrate on notification' },
        { key: 'preview' as const, icon: <EyeIcon size={16} />, iconColor: '#2185C7', iconBg: '#EBF5FF', label: isRtl ? 'معاينة الرسائل' : 'Message Preview', sub: isRtl ? 'إظهار محتوى الإشعار' : 'Show notification content' },
      ],
    },
    {
      title: isRtl ? 'إشعارات إضافية' : 'Additional',
      rows: [
        { key: 'weekly' as const, icon: <MailIcon size={16} />, iconColor: '#8B5CF6', iconBg: '#F3E8FF', label: isRtl ? 'التقرير الأسبوعي بالبريد' : 'Weekly Email Report', sub: isRtl ? 'ملخص إنجازاتك كل أسبوع' : 'Summary of your achievements each week' },
      ],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{isRtl ? 'الإشعارات' : 'Notifications'}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 24px' }}>
        {error && (
          <div style={{ margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', color: '#B91C1C', fontSize: 13 }}>
            {isRtl ? 'تعذّر حفظ الإعدادات' : 'Could not save settings'} — {error}
          </div>
        )}

        {settings === null ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3AF', fontSize: 13 }}>
            {isRtl ? 'جارٍ تحميل الإعدادات...' : 'Loading settings...'}
          </div>
        ) : (
        <>
        {/* Master toggle */}
        <div style={{ margin: '12px 16px', background: 'linear-gradient(135deg, #1a6fa8, #2185C7)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{isRtl ? 'تفعيل جميع إشعارات التطبيق' : 'Enable All App Notifications'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{isRtl ? 'تحكم سريع بإشعارات المهام والمشاريع والمحادثات' : 'Quick control for task, project and chat notifications'}</div>
          </div>
          {/* Scoped to the notification *categories* only — flipping sound/vibration/email
              from here would silently change unrelated delivery settings. */}
          <Toggle on={PREFERENCE_KEYS.some(k => settings[k])} onChange={() => {
            const allOn = PREFERENCE_KEYS.every(k => settings[k])
            applyChanges(Object.fromEntries(PREFERENCE_KEYS.map(k => [k, !allOn])) as Partial<NotifSettingsState>)
          }} />
        </div>

        {sections.map(sec => (
          <div key={sec.title} style={{ margin: '4px 16px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, padding: '14px 4px 8px' }}>{sec.title.toUpperCase()}</div>
            <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
              {sec.rows.map((row, i) => (
                <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: i < sec.rows.length - 1 ? '1px solid #F8F8F8' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: row.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: row.iconColor, flexShrink: 0 }}>{row.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{row.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{row.sub}</div>
                  </div>
                  <Toggle on={settings[row.key]} onChange={() => toggle(row.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ margin: '20px 16px 0', background: '#FEF3C7', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10 }}>
          <span style={{ color: '#D97706', flexShrink: 0, display: 'flex' }}><LightbulbIcon size={18} /></span>
          <span style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            {isRtl ? 'تأكد من تفعيل الإشعارات في إعدادات هاتفك للحصول على جميع التنبيهات.' : 'Make sure notifications are enabled in your device settings to receive all alerts.'}
          </span>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Contacts Settings ────────────────────────────────────────────────
// Formerly eight hardcoded fake contacts with a fake "Invite" button. There is no
// device address book to read in a browser build, so this is now the two real things
// the backend can actually answer: who is registered on TaskUp (GET /people/search —
// a blank query is a legitimate browse), and which invites this user has sent that are
// still pending (GET /contacts). Inviting a number posts a real Direct-context invite,
// which is reconciled into a real relationship if that number ever registers (D8).

function ContactsSettingsScreen({ onBack, lang, onMessage }: { onBack: () => void; lang: Lang; onMessage: (userId: string) => void }) {
  const isRtl = lang === 'ar'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'app' | 'invite'>('all')
  const [people, setPeople] = useState<BackendPerson[] | null>(null)
  const [invites, setInvites] = useState<BackendInvite[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteCountry, setInviteCountry] = useState('+966')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // People come back from the server already filtered by the query (and phone-masked for
  // anyone found by name rather than by exact number), so no client-side filtering here.
  useEffect(() => {
    const handle = setTimeout(() => {
      peopleApi.search(search.trim())
        .then(res => { setPeople(res); setError(null) })
        .catch((e: unknown) => { setPeople([]); setError(e instanceof ApiError ? e.message : String(e)) })
    }, search.trim() ? 300 : 0)
    return () => clearTimeout(handle)
  }, [search])

  const loadInvites = () => {
    invitesApi.listPending().then(setInvites).catch(() => setInvites([]))
  }
  useEffect(loadInvites, [])

  const selectedCountry = COUNTRY_CODES.find(c => c.code === inviteCountry)!
  const canInvite = invitePhone.trim().length >= 7

  const handleInvite = async () => {
    if (!canInvite || inviting) return
    setInviting(true); setInviteError(null)
    try {
      await invitesApi.create(`${inviteCountry}${invitePhone}`, inviteName.trim() || undefined)
      setInvitePhone(''); setInviteName(''); setShowInviteForm(false)
      loadInvites()
    } catch (e: unknown) {
      setInviteError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setInviting(false)
    }
  }

  const displayedPeople = people ?? []
  const q = search.trim().toLowerCase()
  const displayedInvites = (invites ?? []).filter(i =>
    !q || i.phone.includes(q) || (i.label ?? '').toLowerCase().includes(q))
  const totalKnown = displayedPeople.length + (invites?.length ?? 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827', flex: 1 }}>{isRtl ? 'جهات الاتصال' : 'Contacts'}</span>
        <div style={{ background: '#EBF5FF', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#2185C7' }}>{totalKnown}</div>
      </div>

      {/* Stats */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', gap: 12 }}>
        {[
          { label: isRtl ? 'على TaskUp' : 'On TaskUp', value: displayedPeople.length, color: '#2185C7', bg: '#EBF5FF', filt: 'app' as const },
          { label: isRtl ? 'دعوات معلّقة' : 'Pending invites', value: invites?.length ?? 0, color: '#D97706', bg: '#FEF3C7', filt: 'invite' as const },
        ].map(st => (
          <div key={st.filt} onClick={() => setFilter(f => f === st.filt ? 'all' : st.filt)}
            style={{ flex: 1, background: filter === st.filt ? st.bg : '#F5F7FA', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', border: `1.5px solid ${filter === st.filt ? st.color : 'transparent'}`, transition: 'all 0.15s' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: st.color }}>{st.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', padding: '10px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F7FA', borderRadius: 12, padding: '10px 14px' }}>
          <span style={{ color: '#9CA3AF', display: 'flex' }}><SearchIcon size={15} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRtl ? 'ابحث بالاسم أو الرقم...' : 'Search by name or number...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}><CloseIcon size={15} /></button>}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {error && (
          <div style={{ margin: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px', color: '#B91C1C', fontSize: 13 }}>
            {isRtl ? 'تعذّر تحميل جهات الاتصال' : 'Could not load contacts'} — {error}
          </div>
        )}

        {/* Invite by number */}
        {(filter === 'all' || filter === 'invite') && (
          <div style={{ margin: '14px 16px 0' }}>
            {showInviteForm ? (
              <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{isRtl ? 'دعوة برقم جوال' : 'Invite by phone number'}</div>
                <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder={isRtl ? 'الاسم (اختياري)' : 'Name (optional)'}
                  style={{ padding: '11px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }} />
                <div style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setShowCountryPicker(true)}
                    style={{ padding: '11px 12px', background: '#F8F9FA', border: 'none', borderInlineEnd: '1px solid #F0F0F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{selectedCountry.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: 'Inter' }} dir="ltr">{inviteCountry}</span>
                  </button>
                  <input value={invitePhone} onChange={e => setInvitePhone(normalizeLocalPhone(e.target.value, inviteCountry))} placeholder="5XXXXXXXX" data-ltr inputMode="numeric"
                    style={{ flex: 1, padding: '11px 12px', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'Inter', color: '#111827' }} />
                </div>
                {inviteError && <div style={{ fontSize: 12, color: '#B91C1C' }}>{inviteError}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleInvite} disabled={!canInvite || inviting}
                    style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: canInvite && !inviting ? '#2185C7' : '#E5E7EB', color: canInvite && !inviting ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: canInvite && !inviting ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                    {inviting ? (isRtl ? 'جارٍ الإرسال...' : 'Sending...') : (isRtl ? 'إرسال الدعوة' : 'Send invite')}
                  </button>
                  <button onClick={() => { setShowInviteForm(false); setInviteError(null) }}
                    style={{ padding: '11px 16px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowInviteForm(true)}
                style={{ width: '100%', background: '#fff', border: '1px dashed #C7D2DE', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#2185C7', fontSize: 14, fontWeight: 600, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                <span style={{ fontSize: 18, fontWeight: 400 }}>+</span>
                {isRtl ? 'دعوة شخص برقم جواله' : 'Invite someone by phone number'}
              </button>
            )}
          </div>
        )}

        {/* On TaskUp */}
        {(filter === 'all' || filter === 'app') && (
          <>
            <div style={{ padding: '16px 20px 6px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>
              {(isRtl ? 'على TaskUp' : 'ON TASKUP').toUpperCase()}
            </div>
            {people === null ? (
              <div style={{ textAlign: 'center', padding: '24px 20px', color: '#9CA3AF', fontSize: 13 }}>{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
            ) : displayedPeople.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 20px', color: '#9CA3AF', fontSize: 13 }}>{isRtl ? 'لا توجد نتائج' : 'No results'}</div>
            ) : displayedPeople.map((person, i, arr) => (
              <div key={person.id} style={{ background: '#fff', marginInline: 16, border: '1px solid #F0F0F0', borderTop: i === 0 ? undefined : 'none', borderRadius: i === 0 ? '14px 14px 0 0' : i === arr.length - 1 ? '0 0 14px 14px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                  <Avatar name={person.name} size={44} photo={person.avatarUrl ? absoluteStorageUrl(person.avatarUrl) : null} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{person.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1, fontFamily: 'Inter' }} dir="ltr">{person.phone}</div>
                  </div>
                  <button onClick={() => onMessage(person.id)}
                    style={{ background: '#EBF5FF', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#2185C7', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                    {isRtl ? 'مراسلة' : 'Message'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pending invites */}
        {(filter === 'all' || filter === 'invite') && displayedInvites.length > 0 && (
          <>
            <div style={{ padding: '16px 20px 6px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>
              {(isRtl ? 'دعوات معلّقة' : 'PENDING INVITES').toUpperCase()}
            </div>
            {displayedInvites.map((invite, i, arr) => (
              <div key={invite.id} style={{ background: '#fff', marginInline: 16, border: '1px solid #F0F0F0', borderTop: i === 0 ? undefined : 'none', borderRadius: i === 0 ? '14px 14px 0 0' : i === arr.length - 1 ? '0 0 14px 14px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F5F7FA', border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#9CA3AF', flexShrink: 0 }}>
                    {(invite.label ?? invite.phone).charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>{invite.label ?? (isRtl ? 'بدون اسم' : 'No name')}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1, fontFamily: 'Inter' }} dir="ltr">{invite.phone}</div>
                  </div>
                  <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '5px 12px', color: '#92400E', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {isRtl ? `أُرسلت ${timeAgo(invite.sentAt, lang)}` : `Sent ${timeAgo(invite.sentAt, lang)}`}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {people !== null && displayedPeople.length === 0 && displayedInvites.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><PeopleIcon size={40} /></div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{isRtl ? 'لا توجد نتائج' : 'No results found'}</div>
          </div>
        )}
      </div>

      {showCountryPicker && (
        <CountryPickerSheet lang={lang} selected={inviteCountry} onSelect={setInviteCountry} onClose={() => setShowCountryPicker(false)} />
      )}
    </div>
  )
}

// ─── Screen: Share App ────────────────────────────────────────────────────────

function ShareAppScreen({ onBack, lang }: { onBack: () => void; lang: Lang }) {
  const isRtl = lang === 'ar'
  const [copied, setCopied] = useState(false)
  const link = 'https://taskupapp.net/download'
  const shareMessage = isRtl ? 'جرّب TaskUp لتنظيم مهامك وفريقك!' : 'Try TaskUp to organize your tasks and team!'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to the classic textarea trick.
      const el = document.createElement('textarea')
      el.value = link
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const platforms = [
    { icon: <ChatsIcon size={22} />, label: 'WhatsApp', color: '#25D366', bg: '#F0FFF4', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${link}`)}`, '_blank') },
    { icon: <TelegramIcon size={22} />, label: 'Telegram', color: '#0088CC', bg: '#EBF5FF', action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareMessage)}`, '_blank') },
    { icon: <MailIcon size={22} />, label: isRtl ? 'البريد' : 'Email', color: '#EA4335', bg: '#FEF2F2', action: () => { window.location.href = `mailto:?subject=${encodeURIComponent('TaskUp')}&body=${encodeURIComponent(`${shareMessage}\n${link}`)}` } },
    { icon: <XLogoIcon size={20} />, label: 'X / Twitter', color: '#000', bg: '#F5F7FA', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(link)}`, '_blank') },
    { icon: <BriefcaseIcon size={22} />, label: 'LinkedIn', color: '#0A66C2', bg: '#EBF5FF', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank') },
    { icon: <ClipboardIcon size={22} />, label: isRtl ? 'نسخ الرابط' : 'Copy Link', color: '#6B7280', bg: '#F5F7FA', action: copyLink },
  ]

  const reasons = [
    { icon: <BoltIcon size={18} />, text: isRtl ? 'تنظيم المهام بسهولة' : 'Organize tasks effortlessly' },
    { icon: <PeopleIcon size={18} />, text: isRtl ? 'تعاون مع الفريق' : 'Collaborate with your team' },
    { icon: <ClipboardIcon size={18} />, text: isRtl ? 'تقارير وإحصائيات' : 'Reports & analytics' },
    { icon: <BellIcon size={18} />, text: isRtl ? 'إشعارات فورية' : 'Instant notifications' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{isRtl ? 'مشاركة التطبيق' : 'Share App'}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #1a6fa8 0%, #2185C7 60%, #4BA8E8 100%)', padding: '32px 24px', textAlign: 'center', margin: '16px 16px 0', borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <img src="/logo.png" alt="TaskUp" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 12 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontSize: 28, fontWeight: 900, color: '#2185C7', display: 'none' }}>t</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>TaskUp</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
            {isRtl ? 'شارك TaskUp مع زملائك واجعل العمل الجماعي أسهل!' : 'Share TaskUp with your colleagues and make teamwork easier!'}
          </div>
          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, marginTop: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: '#FCD34D', display: 'flex' }}><StarIcon size={15} /></span>)}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginInlineStart: 6 }}>4.9 (2,400+)</span>
          </div>
        </div>

        {/* Features */}
        <div style={{ margin: '12px 16px 0', background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>{isRtl ? 'لماذا TaskUp؟' : 'Why TaskUp?'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {reasons.map(r => (
              <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F7FA', borderRadius: 10, padding: '10px 12px' }}>
                <span style={{ color: '#2185C7', display: 'flex', flexShrink: 0 }}>{r.icon}</span>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500, lineHeight: 1.3 }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link box */}
        <div style={{ margin: '12px 16px 0', background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', marginBottom: 8 }}>{isRtl ? 'رابط التحميل' : 'Download Link'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F7FA', borderRadius: 10, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
            <span style={{ flex: 1, fontSize: 13, color: '#6B7280', fontFamily: 'Inter', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="ltr">{link}</span>
            <button onClick={copyLink}
              style={{ background: copied ? '#10B981' : '#2185C7', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', transition: 'background 0.2s' }}>
              {copied ? (isRtl ? 'تم النسخ ✓' : 'Copied ✓') : (isRtl ? 'نسخ' : 'Copy')}
            </button>
          </div>
        </div>

        {/* Share via */}
        <div style={{ margin: '12px 16px 0', background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>{isRtl ? 'مشاركة عبر' : 'Share via'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {platforms.map(p => (
              <button key={p.label} onClick={p.action}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 14, background: p.bg, border: 'none', cursor: 'pointer' }}>
                <span style={{ color: p.color, display: 'flex' }}>{p.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: p.color, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', textAlign: 'center' }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* QR-style prompt */}
        <div style={{ margin: '12px 16px 0', background: '#F8FAFF', borderRadius: 14, padding: '14px 16px', border: '1px dashed #C0D8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" fill="#2185C7"/>
              <rect x="18" y="2" width="12" height="12" rx="2" fill="#2185C7"/>
              <rect x="2" y="18" width="12" height="12" rx="2" fill="#2185C7"/>
              <rect x="5" y="5" width="6" height="6" rx="1" fill="#fff"/>
              <rect x="21" y="5" width="6" height="6" rx="1" fill="#fff"/>
              <rect x="5" y="21" width="6" height="6" rx="1" fill="#fff"/>
              <rect x="18" y="18" width="4" height="4" rx="1" fill="#2185C7"/>
              <rect x="24" y="18" width="6" height="4" rx="1" fill="#2185C7"/>
              <rect x="18" y="24" width="6" height="6" rx="1" fill="#2185C7"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{isRtl ? 'امسح رمز QR' : 'Scan QR Code'}</div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{isRtl ? 'اطلب من صديقك مسح الرمز لتحميل التطبيق' : 'Ask your friend to scan this code to download'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Help ───────────────────────────────────────────────────────────
// Static FAQ + contact — previously a "المساعدة" row that did nothing on press.

function HelpScreen({ onBack, lang }: { onBack: () => void; lang: Lang }) {
  const isRtl = lang === 'ar'
  const supportEmail = 'support@taskupapp.net'

  const faqs = isRtl
    ? [
        { q: 'كيف أنشئ مشروعاً جديداً؟', a: 'من تبويب المشاريع، اضغط على زر "+" ثم أدخل اسم المشروع.' },
        { q: 'كيف أدعو شخصاً إلى مهمة أو مشروع؟', a: 'من داخل المهمة أو المشروع، افتح قائمة الأعضاء واختر "إضافة" لدعوة شخص برقم جواله.' },
        { q: 'كيف أستعيد ملاحظة محذوفة؟', a: 'الملاحظات المحذوفة تبقى في سلة المحذوفات لمدة 30 يوماً قبل حذفها نهائياً، ويمكن استعادتها منها.' },
        { q: 'كيف أحذف حسابي؟', a: 'من الملف الشخصي، مرّر للأسفل واضغط "حذف الحساب".' },
      ]
    : [
        { q: 'How do I create a new project?', a: 'From the Projects tab, tap the "+" button and enter the project name.' },
        { q: 'How do I invite someone to a task or project?', a: 'Open the task or project, then use the members list to invite someone by phone number.' },
        { q: 'How do I restore a deleted note?', a: 'Deleted notes stay in Trash for 30 days before permanent deletion, and can be restored from there.' },
        { q: 'How do I delete my account?', a: 'From your Profile, scroll down and tap "Delete account".' },
      ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{isRtl ? 'المساعدة' : 'Help'}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>{isRtl ? 'الأسئلة الشائعة' : 'Frequently asked questions'}</div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: 20 }}>
          {faqs.map((f, i) => (
            <div key={f.q} style={{ padding: '14px 16px', borderBottom: i < faqs.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>{isRtl ? 'لم تجد ما تبحث عنه؟' : "Didn't find what you needed?"}</div>
        <a
          href={`mailto:${supportEmail}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', padding: '14px 16px', textDecoration: 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EBF5FF', color: '#2185C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MailIcon size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{isRtl ? 'تواصل مع الدعم' : 'Contact support'}</div>
            <div style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Inter' }} dir="ltr">{supportEmail}</div>
          </div>
        </a>
      </div>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '0 16px 4px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, padding: '14px 4px 8px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

function ProfileRow({ icon, iconBg, iconColor = '#2185C7', label, value, badge, onPress, danger, last }: {
  icon: React.ReactNode; iconBg: string; iconColor?: string; label: string; value?: string; badge?: string
  onPress?: () => void; danger?: boolean; last?: boolean
}) {
  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid #F5F5F5',
        cursor: onPress ? 'pointer' : 'default',
        background: '#fff',
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 15, color: danger ? '#DC2626' : '#111827', fontWeight: 400 }}>{label}</span>
      {badge && <span style={{ background: '#EBF5FF', color: '#2185C7', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{badge}</span>}
      {value && <span style={{ fontSize: 13, color: '#6B7280' }}>{value}</span>}
      {onPress && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#C0C7D0', flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  )
}

// Strips a country code the user re-typed inside the local-number field (e.g. pasting
// "966501234567" or "0501234567" while +966 is already selected), which would otherwise
// be sent as a double-prefixed, malformed number. Same normalization the admin panel's
// login field needed after that exact bug created a ghost account.
function normalizeLocalPhone(raw: string, countryCode: string): string {
  const digits = raw.replace(/\D/g, '')
  const cc = countryCode.replace(/\D/g, '')
  let local = digits
  if (cc && local.startsWith(cc)) local = local.slice(cc.length)
  local = local.replace(/^0+/, '')
  return local.slice(0, 12)
}

function ChangePhoneSheet({ lang, onClose, onChanged }: { lang: Lang; onClose: () => void; onChanged: (profile: BackendUserProfile) => void }) {
  const isRtl = lang === 'ar'
  const [countryCode, setCountryCode] = useState('+966')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'enter' | 'otp'>('enter')
  const [otp, setOtp] = useState('')
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode)!
  const canSend = phone.trim().length >= 7

  // Two real round trips: /users/me/phone/change/request sends an OTP to the NEW number,
  // /verify swaps User.Phone + PhoneHash once the code matches.
  const handleSend = async () => {
    if (!canSend || busy) return
    setBusy(true); setError(null)
    try {
      const res = await usersApi.requestPhoneChange(countryCode, phone)
      setRequestId(res.requestId)
      setStep('otp')
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6 || busy) return
    setBusy(true); setError(null)
    try {
      const profile = await usersApi.verifyPhoneChange(requestId, otp)
      onChanged(profile)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>
        <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{isRtl ? 'تغيير رقم الجوال' : 'Change Phone Number'}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5F7FA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}><CloseIcon size={13} /></button>
        </div>

        {step === 'enter' ? (
          <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              {isRtl ? 'أدخل رقمك الجديد وسنرسل لك رمز تحقق.' : 'Enter your new number and we\'ll send a verification code.'}
            </div>

            {/* Country */}
            <div>
              <label style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{isRtl ? 'مفتاح الدولة' : 'Country Code'}</label>
              <button onClick={() => setShowCountryPicker(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>{selectedCountry.flag}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#111827', textAlign: isRtl ? 'right' : 'left', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{isRtl ? selectedCountry.name : selectedCountry.nameEn}</span>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Inter' }} dir="ltr">{countryCode}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: '#9CA3AF' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{isRtl ? 'رقم الجوال' : 'Phone Number'}</label>
              <div style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                <div style={{ padding: '13px 12px', background: '#F8F9FA', borderInlineEnd: '1px solid #F0F0F0', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', fontFamily: 'Inter' }} dir="ltr">{countryCode}</span>
                </div>
                <input value={phone} onChange={e => setPhone(normalizeLocalPhone(e.target.value, countryCode))} placeholder="5XXXXXXXX" data-ltr inputMode="numeric"
                  autoFocus style={{ flex: 1, padding: '13px 12px', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'Inter', color: '#111827', background: 'transparent', letterSpacing: 0.5 }} />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '11px 13px', color: '#B91C1C', fontSize: 13 }}>{error}</div>
            )}

            <button onClick={handleSend} disabled={!canSend || busy}
              style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: canSend && !busy ? '#2185C7' : '#E5E7EB', color: canSend && !busy ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 600, cursor: canSend && !busy ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              {busy ? (isRtl ? 'جارٍ الإرسال...' : 'Sending...') : (isRtl ? 'إرسال رمز التحقق' : 'Send Code')}
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              {isRtl ? `تم إرسال رمز التحقق إلى ${countryCode}${phone}` : `Code sent to ${countryCode}${phone}`}
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, display: 'block', marginBottom: 6 }}>{isRtl ? 'رمز التحقق' : 'Verification Code'}</label>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="• • • • • •" data-ltr inputMode="numeric"
                autoFocus style={{ width: '100%', padding: '14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 20, fontFamily: 'Inter', textAlign: 'center', letterSpacing: 8, color: '#111827', outline: 'none', background: '#fff' }} />
            </div>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '11px 13px', color: '#B91C1C', fontSize: 13 }}>{error}</div>
            )}
            <button onClick={handleVerify} disabled={otp.length < 6 || busy}
              style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: otp.length === 6 && !busy ? '#10B981' : '#E5E7EB', color: otp.length === 6 && !busy ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 600, cursor: otp.length === 6 && !busy ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              {busy ? (isRtl ? 'جارٍ التأكيد...' : 'Confirming...') : (isRtl ? 'تأكيد وحفظ' : 'Confirm & Save')}
            </button>
            <button onClick={() => { setStep('enter'); setError(null) }} style={{ background: 'none', border: 'none', color: '#2185C7', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              {isRtl ? 'تغيير الرقم' : 'Change number'}
            </button>
          </div>
        )}

        {showCountryPicker && (
          <CountryPickerSheet lang={lang} selected={countryCode} onSelect={setCountryCode} onClose={() => setShowCountryPicker(false)} />
        )}
      </div>
    </div>
  )
}

function ProfileScreen({ onLogout, lang, onChangeLang, onTerms, onPrivacy, onNotifSettings, onContacts, onShareApp, onHelp, onPhoneChanged, currentUser }: { onLogout: () => void; lang: Lang; onChangeLang: () => void; onTerms: () => void; onPrivacy: () => void; onNotifSettings: () => void; onContacts: () => void; onShareApp: () => void; onHelp: () => void; onPhoneChanged: (profile: BackendUserProfile) => void; currentUser: CurrentUser }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [showChangePhone, setShowChangePhone] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const displayName = currentUser.name ?? (isRtl ? 'محمد العتيبي' : 'Mohammed Al-Otaibi')
  const displayPhone = currentUser.phone ?? '+966 5XXXXXXXX'

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await usersApi.deleteMe()
      onLogout()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e))
      setDeleting(false)
    }
  }

  const chev = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#C0C7D0', flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F7FA', position: 'relative' }}>
      {/* Hero */}
      <div style={{ background: '#fff', padding: '28px 20px 24px', textAlign: 'center', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Avatar name={displayName} size={80} photo={currentUser.photo} /></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{displayName}</div>
        <div style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Inter' }} dir="ltr">{displayPhone}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20 }}>
          {[{ label: tr.myTasks, value: TASKS.length + LATE_TASKS.length + UPCOMING_TASKS.length }, { label: tr.myProjects, value: PROJECTS.length }, { label: tr.completedTasks, value: 12 }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2185C7' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settings ─────────────────────────────────────────────── */}
      <ProfileSection title={isRtl ? 'الإعدادات' : 'Settings'}>
        <ProfileRow icon={<GlobeIcon size={17} />} iconBg="#EBF5FF" iconColor="#2185C7" label={tr.language} value={lang === 'ar' ? 'العربية' : 'English'} onPress={onChangeLang} />
        <ProfileRow icon={<PhoneIcon size={17} />} iconBg="#F0FDF4" iconColor="#059669" label={isRtl ? 'تغيير رقم الجوال' : 'Change Phone Number'} onPress={() => setShowChangePhone(true)} />
        <ProfileRow icon={<BellIcon size={17} />} iconBg="#FEF3C7" iconColor="#D97706" label={tr.notifSettings} onPress={onNotifSettings} last />
      </ProfileSection>

      {/* ── Account ──────────────────────────────────────────────── */}
      <ProfileSection title={isRtl ? 'الحساب' : 'Account'}>
        <ProfileRow icon={<PeopleIcon size={17} />} iconBg="#F3E8FF" iconColor="#8B5CF6" label={tr.contactsSettings} onPress={onContacts} />
        <ProfileRow icon={<ClipboardIcon size={17} />} iconBg="#F0FDF4" iconColor="#059669" label={tr.termsOfUse} onPress={onTerms} />
        <ProfileRow icon={<LockIcon size={17} />} iconBg="#FEF3C7" iconColor="#D97706" label={tr.privacyPolicy} onPress={onPrivacy} last />
      </ProfileSection>

      {/* ── More ─────────────────────────────────────────────────── */}
      <ProfileSection title={isRtl ? 'المزيد' : 'More'}>
        <ProfileRow icon={<OutboxIcon size={17} />} iconBg="#F0FDF4" iconColor="#059669" label={isRtl ? 'مشاركة التطبيق' : 'Share App'} onPress={onShareApp} />
        <ProfileRow icon={<HelpCircleIcon size={17} />} iconBg="#F5F7FA" iconColor="#6B7280" label={tr.help} onPress={onHelp} last />
      </ProfileSection>

      {/* Logout */}
      <div style={{ margin: '16px 16px 8px' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
          {tr.logout}
        </button>
      </div>

      {/* Delete account — self-service deletion (SECURITY.md); anonymizes name/phone and
          blocks login server-side rather than a hard delete, since other users' tasks and
          messages reference this account via FK-Restrict relationships. */}
      <div style={{ margin: '0 16px' }}>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{ width: '100%', padding: '12px', background: 'none', color: '#9CA3AF', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
            {isRtl ? 'حذف الحساب' : 'Delete account'}
          </button>
        ) : (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, color: '#991B1B', marginBottom: 10, lineHeight: 1.5 }}>
              {isRtl
                ? 'سيتم حذف بياناتك الشخصية وتعطيل حسابك نهائياً. هذا الإجراء لا يمكن التراجع عنه.'
                : 'Your personal data will be removed and your account permanently disabled. This cannot be undone.'}
            </div>
            {deleteError && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{deleteError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {deleting ? (isRtl ? 'جارٍ الحذف...' : 'Deleting...') : (isRtl ? 'تأكيد الحذف' : 'Confirm delete')}
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: 24 }} />

      {showChangePhone && <ChangePhoneSheet lang={lang} onClose={() => setShowChangePhone(false)} onChanged={onPhoneChanged} />}
    </div>
  )
}

// ─── Conversations Data ───────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  textEn: string
  time: string
}

interface Conversation {
  id: string
  personId: string
  unread: number
  lastMsg: string
  lastMsgEn: string
  lastTime: string
  messages: ChatMessage[]
  displayPhone?: string
  /// Set only when this conversation was started against a real backend user (see the
  /// "New Number" flow in NewChatSheet) — enables real message send/receive and the
  /// block/report menu in ChatScreen. Conversations from the seeded CONVERSATIONS mock
  /// data never have these set, and stay purely local like the rest of the prototype.
  realUserId?: string
  realConversationId?: string
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', personId: 'p1', unread: 2,
    lastMsg: 'هل انتهيت من تصميم الشاشة الرئيسية؟',
    lastMsgEn: 'Did you finish the main screen design?',
    lastTime: '10:24',
    messages: [
      { id: 'm1', from: 'them', text: 'صباح الخير!', textEn: 'Good morning!', time: '10:00' },
      { id: 'm2', from: 'me', text: 'صباح النور، كيف حالك؟', textEn: 'Good morning! How are you?', time: '10:01' },
      { id: 'm3', from: 'them', text: 'بخير الحمد لله. كيف سير المشروع؟', textEn: 'Fine thanks. How\'s the project going?', time: '10:05' },
      { id: 'm4', from: 'me', text: 'ماشي الحال، عندي بعض التحديثات', textEn: 'Going well, I have some updates', time: '10:10' },
      { id: 'm5', from: 'them', text: 'هل انتهيت من تصميم الشاشة الرئيسية؟', textEn: 'Did you finish the main screen design?', time: '10:24' },
    ],
  },
  {
    id: 'c2', personId: 'p3', unread: 0,
    lastMsg: 'تمام، سأرسل التقرير اليوم',
    lastMsgEn: 'Sure, I\'ll send the report today',
    lastTime: 'أمس',
    messages: [
      { id: 'm1', from: 'me', text: 'سارة، متى موعد تسليم التقرير؟', textEn: 'Sara, when is the report due?', time: '14:00' },
      { id: 'm2', from: 'them', text: 'الموعد النهائي غداً الساعة 5', textEn: 'Deadline is tomorrow at 5', time: '14:10' },
      { id: 'm3', from: 'me', text: 'هل تحتاجين مساعدة؟', textEn: 'Do you need help?', time: '14:12' },
      { id: 'm4', from: 'them', text: 'تمام، سأرسل التقرير اليوم', textEn: 'Sure, I\'ll send the report today', time: '14:45' },
    ],
  },
  {
    id: 'c3', personId: 'p2', unread: 1,
    lastMsg: 'راجعت المهمة وعندي تعليق بسيط',
    lastMsgEn: 'I reviewed the task and have a small comment',
    lastTime: '09:15',
    messages: [
      { id: 'm1', from: 'them', text: 'محمد أرسل لي ملف التصاميم', textEn: 'Mohammed send me the design file', time: '08:30' },
      { id: 'm2', from: 'me', text: 'حاضر، إرسلته الآن', textEn: 'Sure, sent it now', time: '08:35' },
      { id: 'm3', from: 'them', text: 'راجعت المهمة وعندي تعليق بسيط', textEn: 'I reviewed the task and have a small comment', time: '09:15' },
    ],
  },
  {
    id: 'c4', personId: 'p4', unread: 0,
    lastMsg: 'أوكي نتحدث غداً',
    lastMsgEn: 'OK let\'s talk tomorrow',
    lastTime: 'أمس',
    messages: [
      { id: 'm1', from: 'me', text: 'خالد، هل رأيت التعليقات على التقرير النهائي؟', textEn: 'Khaled, did you see the comments on the final report?', time: '18:00' },
      { id: 'm2', from: 'them', text: 'لا لم أشوفها بعد', textEn: 'No not yet', time: '18:20' },
      { id: 'm3', from: 'me', text: 'لا يهم وقت فراغك راجعها', textEn: 'No rush, check when you have time', time: '18:21' },
      { id: 'm4', from: 'them', text: 'أوكي نتحدث غداً', textEn: 'OK let\'s talk tomorrow', time: '18:22' },
    ],
  },
]

// keywords → task IDs for smart link suggestion
const TASK_KEYWORDS: { keywords: string[]; taskId: string }[] = [
  { keywords: ['تصميم', 'شاشة', 'design', 'screen', 'ui'], taskId: 't1' },
  { keywords: ['تقرير', 'report', 'final'], taskId: 't2' },
  { keywords: ['api', 'backend', 'server'], taskId: 't3' },
]

function detectTaskSuggestion(text: string): string | null {
  const lower = text.toLowerCase()
  for (const entry of TASK_KEYWORDS) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.taskId
    }
  }
  return null
}

// ─── Screen: Conversations List ───────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات', nameEn: 'UAE' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت', nameEn: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', name: 'قطر', nameEn: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين', nameEn: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان', nameEn: 'Oman' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن', nameEn: 'Jordan' },
  { code: '+20', flag: '🇪🇬', name: 'مصر', nameEn: 'Egypt' },
  { code: '+1', flag: '🇺🇸', name: 'الولايات المتحدة', nameEn: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'المملكة المتحدة', nameEn: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'ألمانيا', nameEn: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'فرنسا', nameEn: 'France' },
  { code: '+90', flag: '🇹🇷', name: 'تركيا', nameEn: 'Turkey' },
  { code: '+92', flag: '🇵🇰', name: 'باكستان', nameEn: 'Pakistan' },
  { code: '+91', flag: '🇮🇳', name: 'الهند', nameEn: 'India' },
  { code: '+63', flag: '🇵🇭', name: 'الفلبين', nameEn: 'Philippines' },
  { code: '+880', flag: '🇧🇩', name: 'بنغلاديش', nameEn: 'Bangladesh' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب', nameEn: 'Morocco' },
  { code: '+216', flag: '🇹🇳', name: 'تونس', nameEn: 'Tunisia' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر', nameEn: 'Algeria' },
]

function CountryPickerSheet({ lang, selected, onSelect, onClose }: {
  lang: Lang; selected: string; onSelect: (code: string) => void; onClose: () => void
}) {
  const isRtl = lang === 'ar'
  const [search, setSearch] = useState('')
  const filtered = COUNTRY_CODES.filter(c => {
    const name = (isRtl ? c.name : c.nameEn).toLowerCase()
    return name.includes(search.toLowerCase()) || c.code.includes(search)
  })
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '75%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>
        <div style={{ padding: '8px 20px 12px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{isRtl ? 'مفتاح الدولة' : 'Country Code'}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5F7FA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}><CloseIcon size={13} /></button>
        </div>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F7FA', borderRadius: 12, padding: '10px 14px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: '#9CA3AF', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRtl ? 'ابحث عن دولة...' : 'Search country...'}
              autoFocus style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(c => (
            <div key={c.code} onClick={() => { onSelect(c.code); onClose() }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid #F8F8F8', cursor: 'pointer', background: selected === c.code ? '#EBF5FF' : '#fff' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{c.flag}</span>
              <span style={{ flex: 1, fontSize: 14, color: '#111827', fontWeight: selected === c.code ? 600 : 400 }}>{isRtl ? c.name : c.nameEn}</span>
              <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, fontFamily: 'Inter' }} dir="ltr">{c.code}</span>
              {selected === c.code && <span style={{ color: '#2185C7', display: 'flex' }}><CheckIcon size={16} /></span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NewChatSheet({ lang, existingPersonIds, onSelect, onStartWithPhone, onClose }: {
  lang: Lang
  existingPersonIds: string[]
  onSelect: (personId: string) => void
  onStartWithPhone: (displayName: string) => Promise<boolean>
  onClose: () => void
}) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [search, setSearch] = useState('')
  const [phoneMode, setPhoneMode] = useState(false)
  const [countryCode, setCountryCode] = useState('+966')
  const [phoneNum, setPhoneNum] = useState('')
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [realPeople, setRealPeople] = useState<BackendPerson[] | null>(null)
  const [starting, setStarting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!canStart || starting) return
    setStarting(true)
    setPhoneError(null)
    const ok = await onStartWithPhone(fullPhone)
    if (!ok) {
      setStarting(false)
      setPhoneError(isRtl ? 'هذا الرقم غير مسجّل في TaskUp.' : "This number isn't registered on TaskUp.")
    }
    // On success the parent screen navigates away (unmounting this sheet), so there's
    // nothing left to reset here.
  }

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode)!
  const fullPhone = `${countryCode}${phoneNum}`
  const canStart = phoneNum.trim().length >= 7

  // Always a real /people/search lookup, debounced — an empty query is a legitimate
  // "browse registered users" call (PeopleService no longer short-circuits on a blank q),
  // so this list is never the mock PEOPLE_LIST any more. Selecting a result is prefixed
  // "real:" so ConversationsScreen/App can route it to the live conversation flow.
  useEffect(() => {
    if (phoneMode) return
    const handle = setTimeout(() => {
      peopleApi.search(search.trim()).then(setRealPeople).catch(() => setRealPeople([]))
    }, search.trim() ? 300 : 0)
    return () => clearTimeout(handle)
  }, [search, phoneMode])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />

      {/* Sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '80%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {isRtl ? 'محادثة جديدة' : 'New Message'}
          </span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5F7FA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}><CloseIcon size={13} /></button>
        </div>

        {/* Tabs: contacts / phone number */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
          {[false, true].map(isPhone => (
            <button
              key={String(isPhone)}
              onClick={() => setPhoneMode(isPhone)}
              style={{
                flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: phoneMode === isPhone ? 700 : 400,
                color: phoneMode === isPhone ? '#2185C7' : '#6B7280',
                fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
                borderBottom: `2.5px solid ${phoneMode === isPhone ? '#2185C7' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              {isPhone
                ? (isRtl ? 'رقم جديد' : 'New Number')
                : (isRtl ? 'جهات الاتصال' : 'Contacts')}
            </button>
          ))}
        </div>

        {!phoneMode ? (
          <>
            {/* Search */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F5F7FA', borderRadius: 12, padding: '10px 14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#9CA3AF' }}>
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن شخص...' : 'Search people...'}
                  autoFocus
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
                />
              </div>
            </div>

            {/* People list — always real /people/search results (blank query = browse) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {realPeople === null ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 14 }}>
                  {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
                </div>
              ) : realPeople.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 14 }}>
                  {isRtl ? 'لا توجد نتائج' : 'No results'}
                </div>
              ) : realPeople.map(person => {
                const hasConv = existingPersonIds.includes(`real:${person.id}`)
                return (
                  <div key={person.id} onClick={() => onSelect(`real:${person.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', cursor: 'pointer', background: '#fff' }}>
                    <Avatar name={person.name} size={46} photo={person.avatarUrl ? absoluteStorageUrl(person.avatarUrl) : null} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{person.name}</div>
                      {hasConv
                        ? <div style={{ fontSize: 12, color: '#9CA3AF' }}>{isRtl ? 'محادثة موجودة' : 'Existing conversation'}</div>
                        : <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>{person.phone}</div>}
                    </div>
                    {hasConv
                      ? <div style={{ fontSize: 12, color: '#2185C7', fontWeight: 500 }}>{isRtl ? 'فتح' : 'Open'}</div>
                      : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#2185C7" strokeWidth="2" strokeLinejoin="round"/>
                          </svg>
                        </div>
                    }
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* Phone number entry */
          <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Country code row */}
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {isRtl ? 'مفتاح الدولة' : 'Country Code'}
              </label>
              <button
                onClick={() => setShowCountryPicker(true)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 14,
                  border: '1.5px solid #E5E7EB', background: '#fff',
                  cursor: 'pointer', textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <span style={{ fontSize: 22 }}>{selectedCountry.flag}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                  {isRtl ? selectedCountry.name : selectedCountry.nameEn}
                </span>
                <span style={{ fontSize: 15, color: '#6B7280', fontFamily: 'Inter', fontWeight: 600 }} dir="ltr">{countryCode}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#9CA3AF', flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Phone number input */}
            <div>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                {isRtl ? 'رقم الجوال' : 'Phone Number'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
                <div style={{ padding: '14px 14px', borderInlineEnd: '1px solid #F0F0F0', background: '#F8F9FA', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', fontFamily: 'Inter' }} dir="ltr">{countryCode}</span>
                </div>
                <input
                  value={phoneNum}
                  onChange={e => setPhoneNum(e.target.value.replace(/\D/g, ''))}
                  placeholder={isRtl ? '5XXXXXXXX' : '5XXXXXXXX'}
                  data-ltr
                  inputMode="numeric"
                  style={{
                    flex: 1, padding: '14px 14px', border: 'none', outline: 'none',
                    fontSize: 16, fontWeight: 500, color: '#111827',
                    fontFamily: 'Inter', letterSpacing: 1, background: 'transparent',
                  }}
                />
              </div>
              {phoneNum.length > 0 && phoneNum.length < 7 && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>
                  {isRtl ? 'الرقم قصير جداً' : 'Number too short'}
                </div>
              )}
            </div>

            {/* Preview */}
            {canStart && (
              <div style={{ background: '#F0F7FF', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#2185C7', display: 'flex' }}><PhoneIcon size={18} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{isRtl ? 'سيتم الإرسال إلى' : 'Will send to'}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: 'Inter' }} dir="ltr">{fullPhone}</div>
                </div>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Start chat button */}
            {phoneError && (
              <div style={{ fontSize: 13, color: '#EF4444', textAlign: 'center' }}>{phoneError}</div>
            )}
            <button
              onClick={handleStart}
              disabled={!canStart || starting}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: canStart && !starting ? '#2185C7' : '#E5E7EB',
                color: canStart && !starting ? '#fff' : '#9CA3AF',
                fontSize: 16, fontWeight: 600, cursor: canStart && !starting ? 'pointer' : 'default',
                fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
                transition: 'background 0.15s',
              }}
            >
              {starting ? (isRtl ? 'جارٍ البدء...' : 'Starting...') : (isRtl ? 'بدء المحادثة' : 'Start Chat')}
            </button>
          </div>
        )}
      </div>

      {/* Country picker sub-sheet */}
      {showCountryPicker && (
        <CountryPickerSheet
          lang={lang}
          selected={countryCode}
          onSelect={setCountryCode}
          onClose={() => setShowCountryPicker(false)}
        />
      )}
    </div>
  )
}

// A real backend conversation, in the local mock-shaped Conversation interface the chat
// UI already speaks. `displayPhone` doubles as the chat title (ChatScreen prefers it over
// a PEOPLE_LIST lookup), which is how the existing "New Number" flow already labels a real
// conversation. The backend list carries no per-conversation unread count, so unread is 0.
function mapBackendConversation(c: BackendConversation, lang: Lang): Conversation {
  const lastText = c.lastMessageText ?? ''
  return {
    id: c.id,
    personId: '',
    unread: 0,
    lastMsg: lastText,
    lastMsgEn: lastText,
    lastTime: c.lastMessageAt
      ? new Date(c.lastMessageAt).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-SA', { hour: '2-digit', minute: '2-digit' })
      : '',
    messages: [],
    displayPhone: c.otherParticipant.name,
    realUserId: c.otherParticipant.userId,
    realConversationId: c.id,
  }
}

function ConversationsScreen({ onOpenChat, onNewChat, lang, currentUserId, refreshKey }: { onOpenChat: (conv: Conversation) => void; onNewChat: (personId: string) => Promise<boolean>; lang: Lang; currentUserId: string | null; refreshKey: number }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const [showNewChat, setShowNewChat] = useState(false)
  // Real conversations from GET /conversations. This list used to render the seeded
  // CONVERSATIONS mock only, so a chat you actually started disappeared the moment you
  // navigated back to this screen. null = still loading (don't render an empty state yet).
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUserId) { setConversations([]); return }
    conversationsApi.list()
      .then(items => { setConversations(items.map(c => mapBackendConversation(c, lang))); setLoadError(null) })
      // Surfaced, not swallowed — an empty list and a failed request looked identical before.
      .catch((e: unknown) => { setConversations([]); setLoadError(e instanceof ApiError ? e.message : String(e)) })
  }, [currentUserId, lang, refreshKey])

  const displayed = conversations ?? []
  const totalUnread = displayed.reduce((s, c) => s + c.unread, 0)
  const existingPersonIds = displayed.filter(c => c.realUserId).map(c => `real:${c.realUserId}`)

  const handleSelect = (personId: string) => {
    setShowNewChat(false)
    // A "real:{userId}" selection that already has a conversation opens it directly
    // instead of round-tripping through POST /conversations again.
    const existing = displayed.find(c => c.realUserId && `real:${c.realUserId}` === personId)
    if (existing) {
      onOpenChat(existing)
    } else {
      onNewChat(personId)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{tr.chatsTitle}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {totalUnread > 0 && (
              <div style={{ background: '#EBF5FF', color: '#2185C7', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
                {totalUnread}
              </div>
            )}
            {/* + button */}
            <button
              onClick={() => setShowNewChat(true)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#2185C7', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(33,133,199,0.35)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations === null && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 13 }}>
            {isRtl ? 'جارٍ تحميل المحادثات...' : 'Loading conversations...'}
          </div>
        )}

        {loadError && (
          <div style={{ margin: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px', color: '#B91C1C', fontSize: 13 }}>
            {isRtl ? 'تعذّر تحميل المحادثات' : 'Could not load conversations'} — {loadError}
          </div>
        )}

        {conversations !== null && !loadError && displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9CA3AF' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><ChatsIcon size={40} /></div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#6B7280' }}>{isRtl ? 'لا توجد محادثات بعد' : 'No conversations yet'}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{isRtl ? 'ابدأ محادثة جديدة من زر +' : 'Start one with the + button'}</div>
          </div>
        )}

        {displayed.map(conv => {
          const name = conv.displayPhone ?? ''
          const lastMsg = lang === 'en' ? conv.lastMsgEn : conv.lastMsg
          return (
            <div
              key={conv.id}
              onClick={() => onOpenChat(conv)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                background: '#fff',
                borderBottom: '1px solid #F5F5F5',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar name={name} size={48} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: conv.unread > 0 ? 700 : 500, color: '#111827' }}>{name}</span>
                  <span style={{ fontSize: 11, color: conv.unread > 0 ? '#2185C7' : '#9CA3AF', fontWeight: conv.unread > 0 ? 600 : 400, flexShrink: 0, marginInlineStart: 8 }}>{conv.lastTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: lastMsg ? (conv.unread > 0 ? '#374151' : '#6B7280') : '#C0C7D0', fontWeight: conv.unread > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {lastMsg || (isRtl ? 'لا توجد رسائل بعد' : 'No messages yet')}
                  </span>
                  {conv.unread > 0 && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2185C7', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showNewChat && (
        <NewChatSheet
          lang={lang}
          existingPersonIds={existingPersonIds}
          onSelect={handleSelect}
          onStartWithPhone={onNewChat}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  )
}

// ─── Screen: Chat ─────────────────────────────────────────────────────────────

function ChatScreen({ conv, onBack, lang, currentUserId }: { conv: Conversation; onBack: () => void; lang: Lang; currentUserId: string | null }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const person = PEOPLE_LIST.find(p => p.id === conv.personId)
  const personName = conv.displayPhone
    ? conv.displayPhone
    : person ? (lang === 'en' ? person.nameEn : person.name) : '?'
  const avatarName = person ? person.name : (conv.displayPhone ?? '?')

  // A conversation started via the real "New Number" flow (see App's onNewChat) — messages
  // are sent/received through the live backend (AES-256-GCM encrypted at rest) instead of
  // local mock state, and the block/report menu below becomes available.
  const isReal = !!(conv.realConversationId && conv.realUserId)

  const [messages, setMessages] = useState<ChatMessage[]>(conv.messages)
  const [text, setText] = useState('')
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)
  const [justLinked, setJustLinked] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [pollMode, setPollMode] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [showMenu, setShowMenu] = useState(false)
  const [reportPrompt, setReportPrompt] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const linkedTask = linkedTaskId ? TASKS.find(t => t.id === linkedTaskId) : null

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  useEffect(() => {
    if (!isReal || !conv.realConversationId) return
    conversationsApi.getMessages(conv.realConversationId).then(({ items }) => {
      setMessages(items.map(m => ({
        id: m.id,
        from: m.senderId === currentUserId ? 'me' : 'them',
        text: m.text ?? '',
        textEn: m.text ?? '',
        time: formatTime(m.createdAt),
      })))
      setTimeout(() => bottomRef.current?.scrollIntoView(), 60)
    }).catch(() => { /* leave the (empty) local list as-is on failure */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.realConversationId])

  const handleBlock = async () => {
    if (!conv.realUserId) return
    try {
      await peopleApi.block(conv.realUserId)
      onBack()
    } catch (e) {
      setActionNotice(e instanceof Error ? e.message : String(e))
    }
  }

  const submitReport = async () => {
    if (!conv.realUserId || !reportReason.trim()) return
    try {
      await peopleApi.report(conv.realUserId, reportReason.trim())
      setReportPrompt(false)
      setReportReason('')
      setActionNotice(isRtl ? 'تم إرسال البلاغ' : 'Report submitted')
    } catch (e) {
      setActionNotice(e instanceof Error ? e.message : String(e))
    }
  }

  const sendMessage = () => {
    if (!text.trim()) return

    if (isReal && conv.realConversationId) {
      const pending = text.trim()
      setText('')
      conversationsApi.sendMessage(conv.realConversationId, pending).then(m => {
        setMessages(prev => [...prev, { id: m.id, from: 'me', text: m.text ?? '', textEn: m.text ?? '', time: formatTime(m.createdAt) }])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      }).catch(e => setActionNotice(e instanceof Error ? e.message : String(e)))
      return
    }

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      from: 'me',
      text: text.trim(),
      textEn: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
    setMessages(prev => [...prev, newMsg])
    // smart task suggestion
    if (!linkedTaskId && !suggestionDismissed) {
      const suggested = detectTaskSuggestion(text)
      if (suggested) setSuggestion(suggested)
    }
    setText('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  const handleLink = () => {
    if (!suggestion) return
    setLinkedTaskId(suggestion)
    setSuggestion(null)
    setJustLinked(true)
    setTimeout(() => setJustLinked(false), 2500)
  }

  const suggestedTask = suggestion ? TASKS.find(tk => tk.id === suggestion) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onBack={onBack} lang={lang} />
        <div style={{ position: 'relative' }}>
          <Avatar name={avatarName} size={40} />
          {person && <div style={{ position: 'absolute', bottom: 0, insetInlineEnd: 0, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{personName}</div>
          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 500 }}>{tr.online}</div>
        </div>
        {isReal && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F7FA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
            {showMenu && (
              <>
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
                <div style={{ position: 'absolute', insetInlineEnd: 0, top: 38, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #F0F0F0', zIndex: 21, minWidth: 170, overflow: 'hidden' }}>
                  <button onClick={() => { setShowMenu(false); setReportPrompt(true) }}
                    style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontSize: 13, color: '#111827', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                    {isRtl ? 'الإبلاغ عن المستخدم' : 'Report user'}
                  </button>
                  <button onClick={() => { setShowMenu(false); handleBlock() }}
                    style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderTop: '1px solid #F0F0F0', cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontSize: 13, color: '#EF4444', fontWeight: 600, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                    {isRtl ? 'حظر المستخدم' : 'Block user'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {linkedTask && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF5FF', borderRadius: 10, padding: '4px 10px', maxWidth: 120 }}>
            <span style={{ color: '#2185C7', display: 'flex' }}><LinkIcon size={11} /></span>
            <span style={{ fontSize: 11, color: '#2185C7', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lang === 'en' ? linkedTask.titleEn : linkedTask.title}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map(msg => {
          const isMe = msg.from === 'me'
          const msgText = lang === 'en' ? msg.textEn : msg.text
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '74%',
                background: isMe ? '#2185C7' : '#fff',
                color: isMe ? '#fff' : '#111827',
                borderRadius: isMe
                  ? (isRtl ? '18px 18px 18px 4px' : '18px 18px 4px 18px')
                  : (isRtl ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                padding: '10px 14px',
                boxShadow: isMe ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
                border: isMe ? 'none' : '1px solid #F0F0F0',
              }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msgText}</div>
                <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : '#9CA3AF', marginTop: 4, textAlign: isMe ? (isRtl ? 'left' : 'right') : (isRtl ? 'right' : 'left') }}>
                  {msg.time} {isMe && '✓✓'}
                </div>
              </div>
            </div>
          )
        })}

        {/* Task link suggestion banner */}
        {suggestedTask && !suggestionDismissed && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#92400E', display: 'flex' }}><LinkIcon size={16} /></span>
              <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
                {tr.suggestLink}: «{lang === 'en' ? suggestedTask.titleEn : suggestedTask.title}»؟
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setSuggestion(null); setSuggestionDismissed(true) }} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #D1D5DB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {tr.skipLink}
              </button>
              <button onClick={handleLink} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: '#F97316', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {tr.linkBtn}
              </button>
            </div>
          </div>
        )}

        {/* Just linked toast */}
        {justLinked && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '10px 14px', textAlign: 'center', fontSize: 13, color: '#065F46', fontWeight: 600 }}>
            {tr.taskLinked}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Poll composer */}
      {pollMode && (
        <div style={{ background: '#F8FAFF', borderTop: '1px solid #E8EFFF', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2185C7' }}><ClipboardIcon size={14} /> {isRtl ? 'تصويت جديد' : 'New Poll'}</span>
            <button onClick={() => { setPollMode(false); setPollQuestion(''); setPollOptions(['', '']) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><CloseIcon size={16} /></button>
          </div>
          <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder={isRtl ? 'اكتب سؤال التصويت...' : 'Poll question...'}
            style={{ padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#111827' }} />
          {pollOptions.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input value={opt} onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n) }}
                placeholder={`${isRtl ? 'خيار' : 'Option'} ${i + 1}`}
                style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#111827' }} />
              {pollOptions.length > 2 && (
                <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                  style={{ width: 34, background: '#FEF2F2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CloseIcon size={14} /></button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            {pollOptions.length < 5 && (
              <button onClick={() => setPollOptions([...pollOptions, ''])}
                style={{ flex: 1, padding: '9px', border: '1.5px dashed #C0D8F0', borderRadius: 10, background: 'none', cursor: 'pointer', color: '#2185C7', fontSize: 13, fontWeight: 500, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                + {isRtl ? 'إضافة خيار' : 'Add option'}
              </button>
            )}
            <button
              onClick={() => {
                if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return
                const msg: ChatMessage = {
                  id: `m${Date.now()}`, from: 'me',
                  text: `📊 ${pollQuestion}\n${pollOptions.filter(o => o.trim()).map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
                  textEn: `📊 ${pollQuestion}\n${pollOptions.filter(o => o.trim()).map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
                  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                }
                setMessages(prev => [...prev, msg])
                setPollMode(false); setPollQuestion(''); setPollOptions(['', ''])
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
              }}
              style={{ padding: '9px 20px', border: 'none', borderRadius: 10, background: '#2185C7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
              {isRtl ? 'إرسال' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Attach menu */}
      {showAttach && (
        <>
          <div onClick={() => setShowAttach(false)} style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', bottom: 70, left: 12, right: 12, zIndex: 11,
            background: '#fff', borderRadius: 18, padding: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #F0F0F0',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2,
          }}>
            {[
              { icon: <ImageIcon size={24} />, iconColor: '#2185C7', label: isRtl ? 'صورة' : 'Image', color: '#EBF5FF', action: () => { const m: ChatMessage = { id: `m${Date.now()}`, from: 'me', text: '🖼️ [صورة]', textEn: '🖼️ [Image]', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }; setMessages(p => [...p, m]); setShowAttach(false); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) } },
              { icon: <PaperclipIcon size={24} />, iconColor: '#D97706', label: isRtl ? 'ملف' : 'File', color: '#FEF3C7', action: () => { const m: ChatMessage = { id: `m${Date.now()}`, from: 'me', text: '📎 [ملف.pdf]', textEn: '📎 [document.pdf]', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }; setMessages(p => [...p, m]); setShowAttach(false); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) } },
              { icon: <PinIcon size={24} />, iconColor: '#DB2777', label: isRtl ? 'الموقع' : 'Location', color: '#FCE7F3', action: () => { const m: ChatMessage = { id: `m${Date.now()}`, from: 'me', text: '📍 [مشاركة الموقع]', textEn: '📍 [Location shared]', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }; setMessages(p => [...p, m]); setShowAttach(false); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) } },
              { icon: <CameraIcon size={24} />, iconColor: '#059669', label: isRtl ? 'الكاميرا' : 'Camera', color: '#F0FDF4', action: () => { const m: ChatMessage = { id: `m${Date.now()}`, from: 'me', text: '📷 [صورة من الكاميرا]', textEn: '📷 [Camera photo]', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }; setMessages(p => [...p, m]); setShowAttach(false); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) } },
              { icon: <ClipboardIcon size={24} />, iconColor: '#8B5CF6', label: isRtl ? 'تصويت' : 'Poll', color: '#F3E8FF', action: () => { setShowAttach(false); setPollMode(true) } },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 14, background: item.color, border: 'none', cursor: 'pointer' }}>
                <span style={{ color: item.iconColor, display: 'flex' }}>{item.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Input bar */}
      <div style={{ background: '#fff', padding: '10px 12px', borderTop: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Attach button */}
        <button
          onClick={() => { setShowAttach(v => !v); setPollMode(false) }}
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: showAttach ? '#2185C7' : '#F5F7FA',
            border: `1.5px solid ${showAttach ? '#2185C7' : '#E5E7EB'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
              stroke={showAttach ? '#fff' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={tr.typeMessage}
          style={{
            flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 22, fontSize: 14,
            outline: 'none', background: '#F5F7FA', color: '#111827',
            fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: text.trim() ? '#2185C7' : '#E5E7EB',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            {isRtl
              ? <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke={text.trim() ? '#fff' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke={text.trim() ? '#fff' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Report prompt */}
      {reportPrompt && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={() => setReportPrompt(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'relative', width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{isRtl ? 'الإبلاغ عن المستخدم' : 'Report user'}</span>
            <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
              placeholder={isRtl ? 'وضّح سبب البلاغ...' : 'Describe the reason...'} rows={3}
              style={{ padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, outline: 'none', resize: 'none', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', color: '#111827' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReportPrompt(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={submitReport} disabled={!reportReason.trim()}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: reportReason.trim() ? '#EF4444' : '#E5E7EB', color: reportReason.trim() ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 600, cursor: reportReason.trim() ? 'pointer' : 'default', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
                {isRtl ? 'إرسال البلاغ' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action notice (block/report result) */}
      {actionNotice && (
        <div onClick={() => setActionNotice(null)} style={{ position: 'absolute', bottom: 80, left: 16, right: 16, background: '#111827', color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 13, textAlign: 'center', cursor: 'pointer', zIndex: 25 }}>
          {actionNotice}
        </div>
      )}
    </div>
  )
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────

type Tab = 'home' | 'projects' | 'notifications' | 'profile' | 'conversations' | 'notes'

function BottomNav({ active, onChange, lang }: { active: Tab; onChange: (t: Tab) => void; lang: Lang }) {
  const tr = t[lang]
  // Notifications moved out of the bottom bar (into a bell icon in Home's header) —
  // not listed here, but 'notifications' stays a valid Screen/Tab so the bar still
  // renders while viewing that screen (see showBottomNav) and users can navigate away.
  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'home', icon: <HomeIcon />, label: tr.navHome },
    { key: 'projects', icon: <ProjectsIcon />, label: tr.navProjects },
    { key: 'notes', icon: <NoteIcon />, label: tr.navNotes },
    { key: 'conversations', icon: <ChatsIcon />, label: tr.navChats },
    { key: 'profile', icon: <PersonIcon />, label: tr.navProfile },
  ]
  const isRtl = lang === 'ar'
  const orderedTabs = isRtl ? tabs : [...tabs].reverse()

  // The Chats tab used to carry an unread badge summed from the seeded CONVERSATIONS mock,
  // so a brand-new account with zero chats still showed a red "5". GET /conversations
  // returns no per-conversation unread count, and there's no count endpoint to derive a
  // real one from, so the badge is gone rather than faked.
  return (
    <div style={{ display: 'flex', background: '#fff', borderTop: '1px solid #F0F0F0', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
      {orderedTabs.map(tab => {
        const isActive = active === tab.key
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} style={{ flex: 1, padding: '10px 0 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
            <div style={{ color: isActive ? '#2185C7' : '#9CA3AF', transition: 'color 0.15s', position: 'relative' }}>
              {tab.icon}
            </div>
            <span style={{ fontSize: 9, color: isActive ? '#2185C7' : '#9CA3AF', fontWeight: isActive ? 600 : 400, fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>{tab.label}</span>
            {isActive && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, background: '#2185C7', borderRadius: '0 0 2px 2px' }} />}
          </button>
        )
      })}
    </div>
  )
}

// ─── Screen: Create Project ───────────────────────────────────────────────────

const PROJECT_COLORS = [
  { hex: '#2185C7', name: 'أزرق' },
  { hex: '#10B981', name: 'أخضر' },
  { hex: '#8B5CF6', name: 'بنفسجي' },
  { hex: '#F59E0B', name: 'ذهبي' },
  { hex: '#EF4444', name: 'أحمر' },
  { hex: '#06B6D4', name: 'سماوي' },
  { hex: '#EC4899', name: 'وردي' },
  { hex: '#374151', name: 'رمادي' },
]

const PEOPLE_LIST = [
  { id: 'p1', name: 'أحمد', nameEn: 'Ahmed' },
  { id: 'p2', name: 'محمد', nameEn: 'Mohammed' },
  { id: 'p3', name: 'سارة', nameEn: 'Sara' },
  { id: 'p4', name: 'خالد', nameEn: 'Khaled' },
  { id: 'p5', name: 'فاطمة', nameEn: 'Fatima' },
  { id: 'p6', name: 'عمر', nameEn: 'Omar' },
]

function CreateProjectScreen({ onBack, onCreate, lang }: { onBack: () => void; onCreate: (name: string) => void; lang: Lang }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0].hex)
  const [members, setMembers] = useState<string[]>([])
  const [memberNames, setMemberNames] = useState<Record<string, string>>({})
  const [externalMembers, setExternalMembers] = useState<ExternalInvite[]>([])
  const [showMemberPicker, setShowMemberPicker] = useState(false)
  const [done, setDone] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const tr = t[lang]
  const isRtl = lang === 'ar'

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await projectsApi.create({
        name: name.trim(), description: desc.trim() || undefined, color,
        memberIds: members.length > 0 ? members : undefined,
      })
      setDone(true)
    } catch (e) {
      // Previously this always showed the success screen even when the project was never
      // actually saved (e.g. during the CORS bug) — now the failure is surfaced instead.
      setCreateError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 24 }}>
        {/* Success animation */}
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
          <CheckCircleIcon size={44} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{tr.projectCreatedTitle}</div>
          <div style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>{tr.projectCreatedSub}</div>
        </div>

        {/* Project preview card */}
        <div style={{ width: '100%', background: '#F5F7FA', borderRadius: 16, padding: '16px', border: `2px solid ${color}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <ProjectsIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{name}</div>
              {desc && <div style={{ fontSize: 13, color: '#6B7280' }}>{desc}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: -6 }}>
            {members.slice(0, 4).map(id => (
              <Avatar key={id} name={memberNames[id] ?? id} size={28} />
            ))}
            {members.length === 0 && <span style={{ fontSize: 13, color: '#9CA3AF' }}>{isRtl ? 'لا يوجد أعضاء بعد' : 'No members yet'}</span>}
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => onCreate(name)}
            style={{ width: '100%', padding: '16px', background: color, color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
          >
            {tr.addFirstTask}
          </button>
          <button
            onClick={() => onCreate(name)}
            style={{ width: '100%', padding: '14px', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 14, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
          >
            {isRtl ? 'لاحقاً' : 'Later'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton onBack={onBack} lang={lang} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{tr.newProject}</span>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Color + Name row */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: '1px solid #F0F0F0' }}>
          {/* Color picker */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 10 }}>{tr.projectColorLabel}</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PROJECT_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: c.hex,
                    border: `3px solid ${color === c.hex ? '#111827' : 'transparent'}`,
                    cursor: 'pointer',
                    outline: color === c.hex ? `2px solid ${c.hex}` : 'none',
                    outlineOffset: 2,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {color === c.hex && <span style={{ color: '#fff', display: 'flex' }}><CheckIcon size={14} /></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Preview icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, transition: 'background 0.2s' }}>
              <ProjectsIcon size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={tr.projectNamePlaceholder}
                autoFocus
                style={{ width: '100%', fontSize: 17, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: name ? '#111827' : '#9CA3AF', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}
              />
              <div style={{ height: 2, background: name ? color : '#E5E7EB', borderRadius: 1, marginTop: 4, transition: 'background 0.2s' }} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #F0F0F0' }}>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 8 }}>{tr.projectDescLabel}</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={tr.projectDescPlaceholder}
            rows={3}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#374151', background: 'transparent', resize: 'none', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter', lineHeight: 1.6 }}
          />
        </div>

        {/* Members */}
        <div
          onClick={() => setShowMemberPicker(true)}
          style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #F0F0F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}><PeopleIcon size={22} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>{tr.projectMembersLabel}</div>
            {(members.length > 0 || externalMembers.length > 0) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {members.slice(0, 4).map(id => (
                    <div key={id} style={{ marginInlineEnd: -6 }}><Avatar name={memberNames[id] ?? id} size={26} /></div>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#374151', marginInlineStart: 10, fontWeight: 500 }}>
                  {members.length + externalMembers.length} {isRtl ? 'أعضاء' : 'members'}
                </span>
                {externalMembers.length > 0 && (
                  <span style={{ fontSize: 12, color: '#D97706', background: '#FEF3C7', borderRadius: 20, padding: '2px 8px' }}>
                    {externalMembers.length} {isRtl ? 'دعوة خارجية' : 'invite'}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 14, color: '#9CA3AF' }}>{tr.addMember}</span>
            )}
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 20 }}>{isRtl ? '←' : '→'}</span>
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        {createError && <div style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 10 }}>{createError}</div>}
        <button
          onClick={handleCreate}
          disabled={!name.trim() || creating}
          style={{
            width: '100%', padding: '16px',
            background: name.trim() ? color : '#E5E7EB',
            color: name.trim() ? '#fff' : '#9CA3AF',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 600,
            cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
            transition: 'background 0.2s',
          }}
        >
          {tr.createProjectBtn}
        </button>
      </div>

      {showMemberPicker && (
        <MemberPickerSheet
          lang={lang}
          selected={members}
          onClose={() => setShowMemberPicker(false)}
          onConfirm={(sel, ext) => {
            setMembers(sel.map(p => p.id))
            setMemberNames(prev => ({ ...prev, ...Object.fromEntries(sel.map(p => [p.id, p.name])) }))
            setExternalMembers(ext)
            setShowMemberPicker(false)
          }}
        />
      )}
    </div>
  )
}

// ─── Create Sheet ─────────────────────────────────────────────────────────────

function CreateSheet({ onClose, onTask, onProject, lang }: { onClose: () => void; onTask: () => void; onProject: () => void; lang: Lang }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px' }}>
        <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>{tr.createWhat}</div>
        {[
          { icon: <CheckCircleIcon size={20} />, title: tr.createTask, subtitle: tr.createTaskDesc, action: onTask },
          { icon: <ProjectsIcon size={20} />, title: tr.createProject, subtitle: tr.createProjectDesc, action: onProject },
        ].map(opt => (
          <div key={opt.title} onClick={opt.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', border: '1.5px solid #E5E7EB', borderRadius: 14, marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2185C7' }}>{opt.icon}</div>
            <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{opt.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Legal Screen (shared for Terms & Privacy) ───────────────────────────────

function LegalScreen({ type, lang, onBack, fromWelcome, onAgree }: {
  type: 'terms' | 'privacy'
  lang: Lang
  onBack: () => void
  fromWelcome?: boolean
  onAgree?: () => void
}) {
  const tr = t[lang]
  const isRtl = lang === 'ar'
  const data = type === 'terms' ? tr.terms : tr.privacy
  const acceptText = type === 'terms' ? tr.termsAccept : tr.privacyAccept

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F7FA' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '14px 20px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <BackButton onBack={onBack} lang={lang} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{data.title}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{tr.lastUpdated}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: type === 'terms' ? '#EBF5FF' : '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: type === 'terms' ? '#2185C7' : '#059669',
        }}>
          {type === 'terms' ? <ClipboardIcon size={18} /> : <LockIcon size={18} />}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Intro card */}
        <div style={{
          background: type === 'terms' ? '#EBF5FF' : '#F0FDF4',
          borderRadius: 14,
          padding: '16px',
          marginBottom: 20,
          borderRight: isRtl ? `4px solid ${type === 'terms' ? '#2185C7' : '#10B981'}` : 'none',
          borderLeft: !isRtl ? `4px solid ${type === 'terms' ? '#2185C7' : '#10B981'}` : 'none',
        }}>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: 0 }}>{data.intro}</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.sections.map((section, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '16px',
                border: '1px solid #F0F0F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: type === 'terms' ? '#2185C7' : '#059669',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: type === 'terms' ? '#EBF5FF' : '#F0FDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: type === 'terms' ? '#2185C7' : '#059669',
                  flexShrink: 0,
                  fontFamily: 'Inter',
                }}>
                  {i + 1}
                </div>
                {section.heading.replace(/^\d+\.\s/, '')}
              </div>
              <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8, margin: 0 }}>{section.body}</p>
            </div>
          ))}
        </div>

        <div style={{ height: fromWelcome ? 100 : 24 }} />
      </div>

      {/* Footer CTA — only when opened from welcome flow */}
      {fromWelcome && (
        <div style={{
          padding: '16px',
          background: '#fff',
          borderTop: '1px solid #F0F0F0',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 12, lineHeight: 1.5 }}>{acceptText}</p>
          <button
            onClick={onAgree ?? onBack}
            style={{
              width: '100%', padding: '15px',
              background: type === 'terms' ? '#2185C7' : '#10B981',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter',
            }}
          >
            {tr.iAgree}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Screen: Notes Workspace ────────────────────────────────────────────────
// The only part of this app that isn't confined to the 390×844 phone-frame mockup —
// see App's root render below. 3 columns (sidebar/list/editor) at >=900px, collapsing
// to single-column hierarchical navigation below that (real breakpoint, not a demo).

type NotesFilter = { type: 'all' } | { type: 'trash' }

function detectTextDir(text: string): 'rtl' | 'ltr' {
  const match = text.match(/[A-Za-z؀-ۿ]/)
  if (!match) return 'ltr'
  return /[؀-ۿ]/.test(match[0]) ? 'rtl' : 'ltr'
}

function buildLocalPreview(content: string): string {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const preview = lines.slice(0, 2).join(' · ')
  return preview.length > 160 ? preview.slice(0, 160) + '…' : preview
}

function NotesWorkspace({ lang, currentUserId, onExit }: { lang: Lang; currentUserId: string | null; onExit: () => void }) {
  const tr = t[lang]
  const isRtl = lang === 'ar'

  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 900)
  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [filter, setFilter] = useState<NotesFilter>({ type: 'all' })
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState<BackendNoteListItem[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BackendNoteDetail | null>(null)
  const [mobilePane, setMobilePane] = useState<'sidebar' | 'list' | 'editor'>('editor')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [creatingNote, setCreatingNote] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const skipNextAutosave = useRef(false)

  // List (debounced, same idiom as MemberPickerSheet's search). Errors are surfaced
  // instead of silently falling back to an empty list — an empty list and "the request
  // failed" must never look identical, the same silent-failure bug fixed earlier
  // elsewhere in this app (see SECURITY.md's CreateTaskScreen/CreateProjectScreen entry).
  useEffect(() => {
    if (!currentUserId) return
    const handle = setTimeout(() => {
      setListError(null)
      notesApi.list({
        q: searchQuery.trim() || undefined,
        includeDeleted: filter.type === 'trash',
      }).then(setNotes).catch(e => { setNotes([]); setListError(e instanceof Error ? e.message : String(e)) })
    }, 300)
    return () => clearTimeout(handle)
  }, [currentUserId, filter, searchQuery, retryKey])

  // The Notes "home" page is note creation itself — landing here starts a fresh note
  // immediately instead of an empty "pick a note" placeholder (requested by the user).
  const startedInitialNote = useRef(false)
  useEffect(() => {
    if (!currentUserId || startedInitialNote.current) return
    startedInitialNote.current = true
    handleNewNote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    notesApi.get(selectedId).then(d => {
      setDetail(d)
      skipNextAutosave.current = true
      setTitle(d.title)
      setContent(d.content)
      setSaveStatus('idle')
    }).catch(() => {})
  }, [selectedId])

  // Autosave (800ms debounce, per spec) — skipped once right after a fresh load so
  // switching notes doesn't immediately re-PATCH the note it just fetched.
  useEffect(() => {
    if (!selectedId || !detail || filter.type === 'trash') return
    if (skipNextAutosave.current) { skipNextAutosave.current = false; return }
    setSaveStatus('saving')
    const handle = setTimeout(() => {
      notesApi.update(selectedId, { title: title.trim() || tr.untitledNote, content })
        .then(updated => {
          setSaveStatus('saved')
          setNotes(prev => prev?.map(n => n.id === selectedId
            ? { ...n, title: updated.title, contentPreview: buildLocalPreview(content), updatedAt: updated.updatedAt }
            : n) ?? prev)
        })
        .catch(() => setSaveStatus('idle'))
    }, 800)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  const handleNewNote = async () => {
    if (!creatingNote) {
      setCreatingNote(true)
      try {
        const created = await notesApi.create({ title: tr.untitledNote, content: '' })
        setNotes(prev => [{ id: created.id, title: created.title, contentPreview: '', isPinned: false, taskId: null, taskTitle: null, updatedAt: created.updatedAt }, ...(prev ?? [])])
        setFilter({ type: 'all' })
        setSelectedId(created.id)
        if (!isWide) setMobilePane('editor')
      } catch {
        // Leave the list as-is — nothing to roll back since we never added an optimistic row.
      } finally {
        setCreatingNote(false)
      }
    }
  }

  const handleTogglePin = async () => {
    if (!selectedId || !detail) return
    const next = !detail.isPinned
    setDetail({ ...detail, isPinned: next })
    try {
      await notesApi.update(selectedId, { isPinned: next })
      setNotes(prev => prev?.map(n => n.id === selectedId ? { ...n, isPinned: next } : n) ?? prev)
    } catch {
      setDetail(d => d ? { ...d, isPinned: !next } : d)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    try {
      await notesApi.delete(selectedId)
      setNotes(prev => prev?.filter(n => n.id !== selectedId) ?? prev)
      setSelectedId(null)
      setConfirmingDelete(false)
      if (!isWide) setMobilePane('list')
    } catch {
      // Leave the note selected so the user can see the error state and retry.
    }
  }

  const handleRestore = async () => {
    if (!selectedId) return
    try {
      await notesApi.restore(selectedId)
      setNotes(prev => prev?.filter(n => n.id !== selectedId) ?? prev)
      setSelectedId(null)
      if (!isWide) setMobilePane('list')
    } catch {
      // Leave the note selected so the user can see the error state and retry.
    }
  }

  const fontFamily = isRtl ? 'IBM Plex Sans Arabic' : 'Inter'

  const renderSidebar = () => (
    <div style={{ width: isWide ? 240 : '100%', height: '100%', background: '#F5F7FA', borderInlineEnd: isWide ? '1px solid #E5E7EB' : 'none', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#2185C7', display: 'flex' }}><NoteIcon size={22} /></span>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827', fontFamily }}>{tr.notesTitle}</span>
        </div>
        <button onClick={onExit} title={isRtl ? 'رجوع إلى التطبيق' : 'Back to app'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
          <CloseIcon size={16} />
        </button>
      </div>

      <button onClick={handleNewNote} disabled={creatingNote}
        style={{ margin: '4px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#2185C7', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily }}>
        <span style={{ fontSize: 16, fontWeight: 400 }}>+</span> {tr.newNote}
      </button>

      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => { setFilter({ type: 'all' }); setSelectedId(null); if (!isWide) setMobilePane('list') }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: filter.type === 'all' ? '#EBF5FF' : 'transparent', color: filter.type === 'all' ? '#2185C7' : '#374151', fontSize: 14, fontWeight: filter.type === 'all' ? 600 : 500, cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontFamily }}>
          <NoteIcon size={16} /> {tr.allNotes}
        </button>
        <button onClick={() => { setFilter({ type: 'trash' }); setSelectedId(null); if (!isWide) setMobilePane('list') }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: filter.type === 'trash' ? '#EBF5FF' : 'transparent', color: filter.type === 'trash' ? '#2185C7' : '#374151', fontSize: 14, fontWeight: filter.type === 'trash' ? 600 : 500, cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', fontFamily }}>
          <TrashIcon size={16} /> {tr.trash}
        </button>
      </div>
    </div>
  )

  const renderList = () => (
    <div style={{ width: isWide ? 320 : '100%', height: '100%', borderInlineEnd: isWide ? '1px solid #E5E7EB' : 'none', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isWide && <BackButton onBack={() => setMobilePane('sidebar')} lang={lang} />}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F5F7FA', borderRadius: 10, padding: '8px 12px', gap: 8 }}>
          <span style={{ color: '#9CA3AF', display: 'flex' }}><SearchIcon size={15} /></span>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tr.searchNotes}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily, color: '#111827' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {listError ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#DC2626' }}>{isRtl ? 'تعذّر تحميل الملاحظات' : 'Couldn’t load notes'}</div>
            <div style={{ fontSize: 12, marginBottom: 12 }}>{listError}</div>
            <button onClick={() => setRetryKey(k => k + 1)} style={{ padding: '8px 16px', background: '#2185C7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily }}>
              {isRtl ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : notes !== null && notes.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{filter.type === 'trash' ? tr.noNotesInTrash : tr.noNotes}</div>
            {filter.type !== 'trash' && <div style={{ fontSize: 12 }}>{tr.noNotesHint}</div>}
          </div>
        ) : notes?.map(note => {
          const isActive = note.id === selectedId
          return (
            <button key={note.id} onClick={() => { setSelectedId(note.id); setConfirmingDelete(false); if (!isWide) setMobilePane('editor') }}
              style={{ display: 'block', width: '100%', textAlign: isRtl ? 'right' : 'left', padding: '14px 16px', borderBottom: '1px solid #F5F5F5', background: isActive ? '#EBF5FF' : 'transparent', border: 'none', borderInlineStart: isActive ? '3px solid #2185C7' : '3px solid transparent', cursor: 'pointer', fontFamily }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {note.isPinned && <span style={{ color: '#D97706', display: 'flex', flexShrink: 0 }}><ThumbtackIcon size={12} /></span>}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} dir={detectTextDir(note.title)}>{note.title || tr.untitledNote}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{new Date(note.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</div>
              {note.contentPreview && (
                <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} dir={detectTextDir(note.contentPreview)}>{note.contentPreview}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderEditor = () => {
    if (!selectedId || !detail) {
      return (
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14, background: '#FAFAFA', padding: 24, textAlign: 'center' }}>
          {tr.selectNotePrompt}
        </div>
      )
    }

    const isTrashed = detail.deletedAt !== null

    return (
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isWide && <BackButton onBack={() => setMobilePane('list')} lang={lang} />}
            <span style={{ fontSize: 12, color: saveStatus === 'saving' ? '#D97706' : '#9CA3AF' }}>
              {saveStatus === 'saving' ? tr.saving : saveStatus === 'saved' ? tr.savedNote : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isTrashed && (
              <button onClick={handleTogglePin} title={detail.isPinned ? tr.unpin : tr.pin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: detail.isPinned ? '#D97706' : '#9CA3AF', display: 'flex' }}>
                <ThumbtackIcon size={17} />
              </button>
            )}
            {isTrashed ? (
              <button onClick={handleRestore} style={{ background: '#EBF5FF', color: '#2185C7', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily }}>{tr.restoreNote}</button>
            ) : !confirmingDelete ? (
              <button onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><TrashIcon size={17} /></button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#DC2626' }}>{tr.deleteNoteConfirm}</span>
                <button onClick={handleDelete} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily }}>{tr.deleteNote}</button>
                <button onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#6B7280', fontFamily }}>{isRtl ? 'إلغاء' : 'Cancel'}</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} disabled={isTrashed} placeholder={tr.notePlaceholderTitle} dir={detectTextDir(title)}
            style={{ border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12, fontFamily, background: 'transparent' }} />
          <textarea value={content} onChange={e => setContent(e.target.value)} disabled={isTrashed} placeholder={tr.notePlaceholderContent} dir={detectTextDir(content)}
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 15, lineHeight: 1.7, color: '#374151', fontFamily, background: 'transparent', minHeight: 200 }} />
        </div>
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100vw', height: '100vh', display: 'flex', background: '#fff', fontFamily, overflow: 'hidden' }}>
      {isWide ? (
        <>
          {renderSidebar()}
          {renderList()}
          {renderEditor()}
        </>
      ) : (
        mobilePane === 'sidebar' ? renderSidebar() : mobilePane === 'list' ? renderList() : renderEditor()
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<Lang>('ar')
  const [screen, setScreen] = useState<Screen>('langSelect')
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedTask, setSelectedTask] = useState<Task>(TASKS[0])
  const [selectedProject, setSelectedProject] = useState<Project>(PROJECTS[0])
  const [showCreate, setShowCreate] = useState(false)
  const [legalSource, setLegalSource] = useState<'welcome' | 'profile'>('profile')
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')
  const [selectedConv, setSelectedConv] = useState<Conversation>(CONVERSATIONS[0])
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ id: null, name: null, phone: null, photo: null })
  const [otpRequestId, setOtpRequestId] = useState('')
  const [dataVersion, setDataVersion] = useState(0)
  // Set when "Add task" is tapped from inside a project (ProjectDetailScreen), so
  // CreateTaskScreen opens with that project pre-selected and returns here afterward
  // instead of Home — null means the task was started from the generic "+" create flow.
  const [taskCreationProjectId, setTaskCreationProjectId] = useState<string | null>(null)
  // Backing state for Home's "View all" — set right before navigating to 'taskList'.
  const [taskListTitle, setTaskListTitle] = useState('')
  const [taskListTasks, setTaskListTasks] = useState<Task[]>([])
  // Real back-navigation stack for the home/projects/taskList/taskDetail/projectDetail
  // subgraph — replaces guessing the back destination from activeTab, which broke as
  // soon as a detail screen was reached via more than one path (e.g. Home → "View all"
  // → task list → task detail used to pop straight back to Home, skipping the list).
  const [screenHistory, setScreenHistory] = useState<Screen[]>([])
  const goTo = (next: Screen) => { setScreenHistory(h => [...h, screen]); setScreen(next) }
  const goBack = (fallback: Screen = 'home') => {
    setScreenHistory(h => {
      if (h.length === 0) { setScreen(fallback); return h }
      setScreen(h[h.length - 1])
      return h.slice(0, -1)
    })
  }

  // Real unread count — this badge used to be derived from the NOTIFS_AR/NOTIFS_EN mock
  // arrays, so it showed 3 unread on a brand-new account with no notifications at all.
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  useEffect(() => {
    if (!currentUser.id) { setUnreadNotifs(0); return }
    notificationsApi.list('unread').then(items => setUnreadNotifs(items.length)).catch(() => setUnreadNotifs(0))
  }, [currentUser.id, screen, dataVersion])

  const isRtl = lang === 'ar'

  // Shared "open this entity by id" helpers — search results and the Home activity feed
  // only carry an id, not the fully-shaped local Task/Project the detail screens expect.
  const openTaskById = async (taskId: string) => {
    try {
      const detail = await tasksApi.get(taskId)
      setSelectedTask(mapBackendTaskDetail(detail, lang))
      goTo('taskDetail')
    } catch {
      // Deleted, or no longer visible to this user — stay put rather than opening a
      // detail screen filled with whichever task happened to be selected before.
    }
  }

  const openProjectById = async (projectId: string) => {
    try {
      const detail = await projectsApi.get(projectId)
      setSelectedProject({
        id: detail.id, realId: detail.id,
        name: detail.name, nameEn: detail.name,
        progress: detail.progress ?? 0,
        taskCount: detail.taskCount,
        memberCount: detail.members.length,
        lateTasks: 0,
        description: detail.description ?? undefined,
        color: detail.color,
      })
      goTo('projectDetail')
    } catch {
      // Same as above — silently ignore an unreachable project.
    }
  }

  const openChatWithUser = async (userId: string) => {
    try {
      const real = await conversationsApi.getOrCreate({ userId })
      setSelectedConv(mapBackendConversation(real, lang))
      setActiveTab('conversations')
      setScreen('chat')
    } catch {
      // Blocked in either direction, or the user is gone — no chat to open.
    }
  }

  const openConversationById = async (conversationId: string) => {
    try {
      const all = await conversationsApi.list()
      const match = all.find(c => c.id === conversationId)
      if (!match) return
      setSelectedConv(mapBackendConversation(match, lang))
      setActiveTab('conversations')
      setScreen('chat')
    } catch {
      // Ignore — the search result simply doesn't open.
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setScreen(tab as Screen)
    setScreenHistory([])
  }

  const renderScreen = () => {
    switch (screen) {
      case 'langSelect': return <LangSelectScreen onSelect={l => { setLang(l); setScreen('welcome') }} />
      case 'welcome': return (
        <WelcomeScreen
          onRegister={() => { setAuthMode('register'); setScreen('phone') }}
          onLogin={() => { setAuthMode('login'); setScreen('phone') }}
          lang={lang}
          onBack={() => setScreen('langSelect')}
          onTerms={() => { setLegalSource('welcome'); setScreen('terms') }}
          onPrivacy={() => { setLegalSource('welcome'); setScreen('privacy') }}
        />
      )
      case 'phone': return (
        <PhoneScreen
          onNext={(phone, countryCode, requestId) => {
            setCurrentUser(u => ({ ...u, phone: `${countryCode} ${phone}` }))
            setOtpRequestId(requestId)
            setScreen('otp')
          }}
          onBack={() => setScreen('welcome')}
          onNotRegistered={() => setAuthMode('register')}
          lang={lang}
          mode={authMode}
        />
      )
      case 'otp': return (
        <OTPScreen
          requestId={otpRequestId}
          onNext={(profile, isNewUser) => {
            setCurrentUser({ id: profile.id, name: profile.name || null, phone: profile.phone, photo: null })
            if (isNewUser) {
              setScreen('profileSetup')
            } else {
              setScreen('home'); setActiveTab('home')
            }
          }}
          onBack={() => setScreen('phone')}
          lang={lang}
          mode={authMode}
        />
      )
      case 'profileSetup': return <ProfileSetupScreen onNext={(name, photo) => { setCurrentUser(u => ({ ...u, name, photo })); setScreen('contacts') }} onBack={() => setScreen('otp')} lang={lang} />
      case 'contacts': return <ContactsScreen onNext={() => setScreen('notifPerm')} onBack={() => setScreen('profileSetup')} lang={lang} />
      case 'notifPerm': return <NotifPermScreen onNext={() => { setScreen('home'); setActiveTab('home') }} onBack={() => setScreen('contacts')} lang={lang} />
      case 'home': return (
        <HomeScreen
          onTaskClick={tk => { setSelectedTask(tk); goTo('taskDetail') }}
          onProjectClick={p => { setSelectedProject(p); goTo('projectDetail') }}
          onCreateClick={() => setShowCreate(true)}
          onViewAll={(title, tasks) => { setTaskListTitle(title); setTaskListTasks(tasks); goTo('taskList') }}
          onNotifClick={() => setScreen('notifications')}
          onSearch={() => goTo('search')}
          onOpenTaskById={openTaskById}
          unreadNotifCount={unreadNotifs}
          lang={lang}
          currentUser={currentUser}
          dataVersion={dataVersion}
        />
      )
      case 'taskList': return (
        <TaskListScreen
          title={taskListTitle}
          tasks={taskListTasks}
          onBack={() => goBack('home')}
          onTaskClick={tk => { setSelectedTask(tk); goTo('taskDetail') }}
          lang={lang}
        />
      )
      case 'projects': return (
        <ProjectsScreen
          onProjectClick={p => { setSelectedProject(p); goTo('projectDetail') }}
          onCreateClick={() => setShowCreate(true)}
          onTaskClick={tk => { setSelectedTask(tk); goTo('taskDetail') }}
          lang={lang}
          currentUserId={currentUser.id}
          refreshKey={dataVersion}
        />
      )
      case 'projectDetail': return (
        <ProjectDetailScreen
          project={selectedProject}
          onBack={() => goBack('projects')}
          onTaskClick={tk => { setSelectedTask(tk); goTo('taskDetail') }}
          onCreateTask={() => { setTaskCreationProjectId(selectedProject.realId ?? null); setScreen('createTask') }}
          onUpdated={() => setDataVersion(v => v + 1)}
          onDeleted={() => { setDataVersion(v => v + 1); goBack('projects') }}
          lang={lang}
        />
      )
      case 'taskDetail': return (
        <TaskDetailScreen
          task={selectedTask}
          onBack={() => goBack()}
          onReport={() => setScreen('taskReport')}
          onUpdated={() => setDataVersion(v => v + 1)}
          onDeleted={() => { setDataVersion(v => v + 1); goBack() }}
          lang={lang}
          currentUserId={currentUser.id}
        />
      )
      case 'taskReport': return <TaskReportScreen task={selectedTask} onBack={() => setScreen('taskDetail')} lang={lang} />
      case 'createTask': return (
        <CreateTaskScreen
          defaultProjectId={taskCreationProjectId ?? undefined}
          onBack={() => { setScreen(taskCreationProjectId ? 'projectDetail' : 'home'); setTaskCreationProjectId(null) }}
          onCreate={() => { setDataVersion(v => v + 1); setScreen(taskCreationProjectId ? 'projectDetail' : 'home'); setTaskCreationProjectId(null) }}
          lang={lang}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name ?? (lang === 'en' ? 'Me' : 'أنا')}
        />
      )
      case 'createProject': return <CreateProjectScreen onBack={() => setScreen('home')} onCreate={() => { setDataVersion(v => v + 1); setActiveTab('projects'); setScreen('projects') }} lang={lang} />
      case 'conversations': return (
        <ConversationsScreen
          lang={lang}
          currentUserId={currentUser.id}
          refreshKey={dataVersion}
          onOpenChat={conv => { setSelectedConv(conv); setScreen('chat') }}
          onNewChat={async idOrPhone => {
            const isPhone = idOrPhone.startsWith('+')
            // "real:{userId}" comes from a live /people/search selection in NewChatSheet's
            // Contacts tab — the user is already known, no phone lookup needed.
            const isRealPerson = idOrPhone.startsWith('real:')
            const newConv: Conversation = {
              id: `c_${idOrPhone}`,
              personId: isPhone || isRealPerson ? '' : idOrPhone,
              unread: 0,
              lastMsg: '',
              lastMsgEn: '',
              lastTime: '',
              messages: [],
              displayPhone: isPhone ? idOrPhone : undefined,
            }

            if (isRealPerson && currentUser.id) {
              try {
                const real = await conversationsApi.getOrCreate({ userId: idOrPhone.slice('real:'.length) })
                newConv.realUserId = real.otherParticipant.userId
                newConv.realConversationId = real.id
                newConv.displayPhone = real.otherParticipant.name
              } catch {
                // Leave newConv without realUserId/realConversationId — ChatScreen falls
                // back to its local-only mode, which still lets the screen render.
              }
            } else if (isPhone && currentUser.id) {
              // A real login session exists and a real phone was typed (the "New Number"
              // tab) — try starting a real backend conversation with whoever is registered
              // under that number.
              try {
                // idOrPhone here is already "{countryCode}{digits}" with no separator
                // (see NewChatSheet's fullPhone), matching PhoneNumberNormalizer's output.
                const real = await conversationsApi.getOrCreate({ phone: idOrPhone })
                newConv.realUserId = real.otherParticipant.userId
                newConv.realConversationId = real.id
                newConv.displayPhone = real.otherParticipant.name || idOrPhone
              } catch {
                // No matching registered user for this phone — surfaced explicitly to
                // NewChatSheet instead of silently opening a chat UI that looks real but
                // can never actually deliver anything.
                return false
              }
            }
            setSelectedConv(newConv)
            setScreen('chat')
            return true
          }}
        />
      )
      case 'chat': return (
        <ChatScreen
          conv={selectedConv}
          onBack={() => setScreen('conversations')}
          lang={lang}
          currentUserId={currentUser.id}
        />
      )
      case 'notifications': return <NotificationsScreen lang={lang} currentUserId={currentUser.id} onBack={() => setScreen('home')} />
      case 'profile': return (
        <ProfileScreen
          onLogout={() => {
            setSession(null, null)
            setLang('ar'); setScreen('langSelect'); setCurrentUser({ id: null, name: null, phone: null, photo: null })
            setScreenHistory([])
          }}
          lang={lang} onChangeLang={() => setScreen('langChange')} onTerms={() => { setLegalSource('profile'); setScreen('terms') }} onPrivacy={() => { setLegalSource('profile'); setScreen('privacy') }} onNotifSettings={() => setScreen('notifSettings')} onContacts={() => setScreen('contactsSettings')} onShareApp={() => setScreen('shareApp')} onHelp={() => setScreen('help')} onPhoneChanged={profile => setCurrentUser(u => ({ ...u, phone: profile.phone }))} currentUser={currentUser}
        />
      )
      case 'search': return (
        <SearchScreen
          onBack={() => goBack('home')}
          onOpenTask={openTaskById}
          onOpenProject={openProjectById}
          onOpenPerson={openChatWithUser}
          onOpenConversation={openConversationById}
          lang={lang}
        />
      )
      case 'notifSettings': return <NotifSettingsScreen onBack={() => setScreen('profile')} lang={lang} />
      case 'contactsSettings': return <ContactsSettingsScreen onBack={() => setScreen('profile')} lang={lang} onMessage={openChatWithUser} />
      case 'shareApp': return <ShareAppScreen onBack={() => setScreen('profile')} lang={lang} />
      case 'help': return <HelpScreen onBack={() => setScreen('profile')} lang={lang} />
      case 'langChange': return <LangChangeScreen current={lang} onBack={() => setScreen('profile')} onSelect={l => { setLang(l); setScreen('profile') }} />
      case 'terms': return (
        <LegalScreen
          type="terms" lang={lang}
          onBack={() => setScreen(legalSource === 'welcome' ? 'welcome' : 'profile')}
          fromWelcome={legalSource === 'welcome'}
          onAgree={() => setScreen('welcome')}
        />
      )
      case 'privacy': return (
        <LegalScreen
          type="privacy" lang={lang}
          onBack={() => setScreen(legalSource === 'welcome' ? 'welcome' : 'profile')}
          fromWelcome={legalSource === 'welcome'}
          onAgree={() => setScreen('welcome')}
        />
      )
      default: return null
    }
  }

  const showBottomNav = ['home', 'projects', 'notifications', 'profile', 'conversations'].includes(screen)

  // The only screen that isn't confined to the phone-frame mockup below — Notes needs a
  // real 3-column desktop layout that a 390px frame can't render, so it takes over the
  // whole viewport instead (see NotesWorkspace).
  if (screen === 'notes') {
    return (
      <NotesWorkspace
        lang={lang}
        currentUserId={currentUser.id}
        onExit={() => { setScreen('home'); setActiveTab('home') }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a6fa8 0%, #2185C7 50%, #4BA8E8 100%)', padding: '10px' }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: 390, height: 844, background: '#fff', borderRadius: 48, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: isRtl ? 'IBM Plex Sans Arabic' : 'Inter' }}>
        {/* Status Bar */}
        <div dir="ltr" style={{ background: '#fff', padding: '12px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: 'Inter' }}>9:41</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#111827' }}>
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{renderScreen()}</div>
          {showBottomNav && <BottomNav active={activeTab} onChange={handleTabChange} lang={lang} />}
          {showCreate && <CreateSheet onClose={() => setShowCreate(false)} onTask={() => { setShowCreate(false); setScreen('createTask') }} onProject={() => { setShowCreate(false); setScreen('createProject') }} lang={lang} />}
        </div>

        <div style={{ height: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 120, height: 4, background: '#E5E7EB', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}
