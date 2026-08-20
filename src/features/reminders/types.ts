export type RecurrenceType = 'none' | 'interval' | 'weekly' | 'monthly'

export interface Recurrence {
  type: RecurrenceType
  every_days?: number
  days_of_week?: string[]
  days_of_month?: number[]
}

export type OccurrenceStatus = 'pending' | 'done' | 'skipped'

export interface ReminderOccurrence {
  id: number
  reminder_id: number
  scheduled_at: string
  advance_notify_at: string | null
  advance_notified_at: string | null
  notified_at: string | null
  status: OccurrenceStatus
  completed_at: string | null
}

export interface ReminderTarget {
  id: number
  targetable?: { id: number; name: string }
}

export interface Reminder {
  id: number
  farm_id: number
  farm?: { id: number; name: string }
  title: string
  body: string
  starts_at: string
  recurrence: Recurrence | null
  advance_notify_minutes: number | null
  is_active: boolean
  targets?: ReminderTarget[]
  occurrences?: ReminderOccurrence[]
}

export interface CreateReminderInput {
  farm_id: number
  title: string
  body: string
  starts_at: string
  target_mode: 'self' | 'all' | 'specific'
  target_ids?: string[]
  recurrence?: Recurrence
  advance_notify_minutes?: number
}

export interface UpdateReminderInput {
  title: string
  body: string
  starts_at: string
  recurrence?: Recurrence
  advance_notify_minutes?: number
}
