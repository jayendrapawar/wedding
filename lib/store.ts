// ---------------------------------------------------------------------------
// Shared localStorage data store — used by both admin and invite pages
// ---------------------------------------------------------------------------

export interface Guest {
  id: string
  name: string
  phone: string
  persons: number
  notes: string
  createdAt: string
}

export interface RSVP {
  guestId: string
  guestName: string
  attendance: 'yes' | 'no'
  message: string
  submittedAt: string
}

export interface Expense {
  id: string
  category: string
  description: string
  estimated: number
  actual: number
  paid: boolean
  createdAt: string
}

export interface Task {
  id: string
  category: string
  title: string
  dueDate: string
  done: boolean
  createdAt: string
}

// ---------------------------------------------------------------------------
// Guests
// ---------------------------------------------------------------------------
export function getGuests(): Guest[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('wg_guests') || '[]') } catch { return [] }
}
export function saveGuests(guests: Guest[]) {
  localStorage.setItem('wg_guests', JSON.stringify(guests))
}
export function getGuestBySlug(slug: string): Guest | undefined {
  return getGuests().find(g => toSlug(g.name) === slug || g.id === slug)
}

// ---------------------------------------------------------------------------
// RSVPs
// ---------------------------------------------------------------------------
export function getRSVPs(): RSVP[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('wg_rsvps') || '[]') } catch { return [] }
}
export function saveRSVP(rsvp: RSVP) {
  const all = getRSVPs().filter(r => r.guestId !== rsvp.guestId)
  localStorage.setItem('wg_rsvps', JSON.stringify([...all, rsvp]))
}
export function saveRSVPs(rsvps: RSVP[]) {
  localStorage.setItem('wg_rsvps', JSON.stringify(rsvps))
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('wg_expenses') || '[]') } catch { return [] }
}
export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem('wg_expenses', JSON.stringify(expenses))
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('wg_tasks') || '[]') } catch { return [] }
}
export function saveTasks(tasks: Task[]) {
  localStorage.setItem('wg_tasks', JSON.stringify(tasks))
}
export function clearAllData() {
  localStorage.removeItem('wg_guests')
  localStorage.removeItem('wg_rsvps')
  localStorage.removeItem('wg_expenses')
  localStorage.removeItem('wg_tasks')
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const EXPENSE_CATEGORIES = [
  'Venue', 'Catering', 'Decoration', 'Photography', 'Videography',
  'Music & DJ', 'Attire & Jewelry', 'Invitations', 'Transport',
  'Accommodation', 'Mehendi & Beauty', 'Gifts & Favours', 'Other'
]

export const TASK_CATEGORIES = [
  'Venue', 'Catering', 'Guest Management', 'Decoration', 'Photography',
  'Music', 'Attire', 'Legal & Admin', 'Travel', 'Other'
]
