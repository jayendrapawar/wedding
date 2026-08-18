'use client'

import { useState, useEffect } from 'react'
import {
  getGuests, saveGuests, getRSVPs, saveRSVPs, getExpenses, saveExpenses, getTasks, saveTasks,
  toSlug, uid, EXPENSE_CATEGORIES, TASK_CATEGORIES,
  type Guest, type RSVP, type Expense, type Task
} from '@/lib/store'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'wedding2027'

export default function AdminUI() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'guests' | 'rsvps' | 'expenses' | 'tasks'>('guests')
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvps, setRSVPs] = useState<RSVP[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (sessionStorage.getItem('admin_unlocked') === 'true') setUnlocked(true)
  }, [])

  useEffect(() => {
    if (!unlocked) return
    setGuests(getGuests())
    setRSVPs(getRSVPs())
    setExpenses(getExpenses())
    setTasks(getTasks())
  }, [unlocked])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true)
      sessionStorage.setItem('admin_unlocked', 'true')
    } else {
      alert('Incorrect password')
    }
  }

  const handleClearAll = () => {
    if (!confirm('Clear ALL data — guests, RSVPs, expenses and tasks? This cannot be undone.')) return
    localStorage.removeItem('wg_guests')
    localStorage.removeItem('wg_rsvps')
    localStorage.removeItem('wg_expenses')
    localStorage.removeItem('wg_tasks')
    setGuests([])
    setRSVPs([])
    setExpenses([])
    setTasks([])
  }

  const handleLogout = () => {
    setUnlocked(false)
    sessionStorage.removeItem('admin_unlocked')
  }

  if (!unlocked) {
    return (
      <div className="adm-lock">
        <div className="adm-lock-card">
          <h1 className="adm-lock-title">Admin Dashboard</h1>
          <p className="adm-lock-sub">Enter password to access wedding management tools</p>
          <form onSubmit={handleUnlock}>
            <input
              className="adm-lock-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            <button className="adm-lock-btn" type="submit">Unlock</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="adm">
      <header className="adm-header">
        <div>
          <div className="adm-header-title">Wedding Admin</div>
          <div className="adm-header-sub">Sonalika &amp; Jayendra · 14 March 2027</div>
        </div>
        <div className="adm-header-actions">
          <button className="adm-btn-ghost adm-btn-red" onClick={handleClearAll}>Clear all data</button>
          <button className="adm-btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="adm-tabs">
        {(['guests', 'rsvps', 'expenses', 'tasks'] as const).map(t => (
          <button key={t} className={`adm-tab${tab === t ? ' adm-tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'guests' && `Guests (${guests.length})`}
            {t === 'rsvps' && `RSVPs (${rsvps.length})`}
            {t === 'expenses' && 'Expenses'}
            {t === 'tasks' && `Tasks (${tasks.filter(x => !x.done).length} pending)`}
          </button>
        ))}
      </nav>

      <main className="adm-content">
        {tab === 'guests'   && <GuestsTab   guests={guests}   setGuests={setGuests}   rsvps={rsvps}     setRSVPs={setRSVPs} />}
        {tab === 'rsvps'    && <RSVPsTab    rsvps={rsvps}     guests={guests} />}
        {tab === 'expenses' && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
        {tab === 'tasks'    && <TasksTab    tasks={tasks}     setTasks={setTasks} />}
      </main>
    </div>
  )
}

// ─── GUESTS ───────────────────────────────────────────────────────────────────
function GuestsTab({ guests, setGuests, rsvps, setRSVPs }: {
  guests: Guest[]; setGuests: (g: Guest[]) => void
  rsvps: RSVP[];   setRSVPs: (r: RSVP[]) => void
}) {
  const [editing, setEditing] = useState<Guest | null>(null)
  const blank = (): Guest => ({ id: uid(), name: '', phone: '', persons: 1, notes: '', createdAt: new Date().toISOString() })

  const save = () => {
    if (!editing) return
    const updated = [...guests.filter(g => g.id !== editing.id), editing]
    setGuests(updated); saveGuests(updated); setEditing(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete this guest? Their RSVP will also be removed.')) return
    const ug = guests.filter(g => g.id !== id); setGuests(ug); saveGuests(ug)
    const ur = rsvps.filter(r => r.guestId !== id); setRSVPs(ur); saveRSVPs(ur)
  }
  const copyLink = (g: Guest) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${toSlug(g.name)}`)
    alert('Invite link copied!')
  }

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-section-title">Guest List</h2>
        <button className="adm-btn-primary" onClick={() => setEditing(blank())}>+ Add Guest</button>
      </div>
      {editing && (
        <Modal title={editing.name ? 'Edit Guest' : 'New Guest'} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Full Name"><input className="adm-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Priya Sharma" /></Field>
          <Field label="Phone"><input className="adm-input" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
          <Field label="Number of Persons"><input className="adm-input" type="number" min={1} max={20} value={editing.persons} onChange={e => setEditing({ ...editing, persons: Math.max(1, +e.target.value) })} /></Field>
          <Field label="Notes"><textarea className="adm-input" value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} placeholder="Any notes…" rows={3} /></Field>
        </Modal>
      )}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Persons</th><th>Invite Link</th><th>Actions</th></tr></thead>
          <tbody>
            {guests.length === 0 && <tr><td colSpan={5} className="adm-empty">No guests yet. Add your first guest to generate invite links.</td></tr>}
            {guests.map(g => (
              <tr key={g.id}>
                <td><strong>{g.name}</strong>{g.notes && <span className="adm-note">{g.notes}</span>}</td>
                <td>{g.phone || '—'}</td>
                <td>{g.persons}</td>
                <td><code className="adm-code">/invite/{toSlug(g.name)}</code><button className="adm-btn-sm" onClick={() => copyLink(g)}>Copy</button></td>
                <td><button className="adm-btn-sm" onClick={() => setEditing(g)}>Edit</button><button className="adm-btn-sm adm-btn-sm-danger" onClick={() => del(g.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── RSVPs ────────────────────────────────────────────────────────────────────
function RSVPsTab({ rsvps, guests }: { rsvps: RSVP[]; guests: Guest[] }) {
  const accepted = rsvps.filter(r => r.attendance === 'yes')
  const declined = rsvps.filter(r => r.attendance === 'no')
  const pending  = guests.filter(g => !rsvps.find(r => r.guestId === g.id))
  return (
    <section className="adm-section">
      <div className="adm-section-head"><h2 className="adm-section-title">RSVP Summary</h2></div>
      <div className="adm-stats">
        <Stat value={accepted.length} label="Accepted" />
        <Stat value={declined.length} label="Declined" />
        <Stat value={pending.length}  label="Pending" />
        <Stat value={accepted.reduce((s, r) => s + (guests.find(g => g.id === r.guestId)?.persons ?? 1), 0)} label="Total Persons" />
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Guest</th><th>Status</th><th>Persons</th><th>Message</th><th>Submitted</th></tr></thead>
          <tbody>
            {rsvps.length === 0 && <tr><td colSpan={5} className="adm-empty">No RSVPs yet.</td></tr>}
            {rsvps.map((r, i) => (
              <tr key={i}>
                <td><strong>{r.guestName}</strong></td>
                <td><span className={`adm-badge ${r.attendance === 'yes' ? 'adm-badge-ok' : 'adm-badge-no'}`}>{r.attendance === 'yes' ? 'Accepted' : 'Declined'}</span></td>
                <td>{r.attendance === 'yes' ? (guests.find(g => g.id === r.guestId)?.persons ?? '—') : '—'}</td>
                <td>{r.message || '—'}</td>
                <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending.length > 0 && (
        <>
          <h3 className="adm-sub-heading">Pending ({pending.length})</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <tbody>{pending.map(g => <tr key={g.id}><td>{g.name}</td><td>{g.phone || '—'}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
function ExpensesTab({ expenses, setExpenses }: { expenses: Expense[]; setExpenses: (e: Expense[]) => void }) {
  const [editing, setEditing] = useState<Expense | null>(null)
  const blank = (): Expense => ({ id: uid(), category: 'Venue', description: '', estimated: 0, actual: 0, paid: false, createdAt: new Date().toISOString() })

  const save = () => {
    if (!editing) return
    const updated = [...expenses.filter(e => e.id !== editing.id), editing]
    setExpenses(updated); saveExpenses(updated); setEditing(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete this expense?')) return
    const updated = expenses.filter(e => e.id !== id); setExpenses(updated); saveExpenses(updated)
  }

  const totalEst  = expenses.reduce((s, e) => s + e.estimated, 0)
  const totalAct  = expenses.reduce((s, e) => s + e.actual, 0)
  const totalPaid = expenses.filter(e => e.paid).reduce((s, e) => s + e.actual, 0)

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-section-title">Expense Planner</h2>
        <button className="adm-btn-primary" onClick={() => setEditing(blank())}>+ Add Expense</button>
      </div>
      {editing && (
        <Modal title={editing.description ? 'Edit Expense' : 'New Expense'} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Category"><select className="adm-input" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>{EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Description"><input className="adm-input" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="e.g. Venue deposit" /></Field>
          <Field label="Estimated (₹)"><input className="adm-input" type="number" value={editing.estimated} onChange={e => setEditing({ ...editing, estimated: +e.target.value })} /></Field>
          <Field label="Actual (₹)"><input className="adm-input" type="number" value={editing.actual} onChange={e => setEditing({ ...editing, actual: +e.target.value })} /></Field>
          <label className="adm-checkbox"><input type="checkbox" checked={editing.paid} onChange={e => setEditing({ ...editing, paid: e.target.checked })} /><span>Mark as paid</span></label>
        </Modal>
      )}
      <div className="adm-stats">
        <Stat value={`₹${totalEst.toLocaleString()}`}  label="Est. Budget" />
        <Stat value={`₹${totalAct.toLocaleString()}`}  label="Actual" />
        <Stat value={`₹${totalPaid.toLocaleString()}`} label="Paid" />
        <Stat value={`₹${(totalAct - totalPaid).toLocaleString()}`} label="Outstanding" />
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Category</th><th>Description</th><th>Estimated</th><th>Actual</th><th>Paid</th><th>Actions</th></tr></thead>
          <tbody>
            {expenses.length === 0 && <tr><td colSpan={6} className="adm-empty">No expenses added yet.</td></tr>}
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.category}</td>
                <td><strong>{e.description}</strong></td>
                <td>₹{e.estimated.toLocaleString()}</td>
                <td>₹{e.actual.toLocaleString()}</td>
                <td>{e.paid ? <span className="adm-badge adm-badge-ok">Paid</span> : <span className="adm-badge adm-badge-no">Pending</span>}</td>
                <td><button className="adm-btn-sm" onClick={() => setEditing(e)}>Edit</button><button className="adm-btn-sm adm-btn-sm-danger" onClick={() => del(e.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function TasksTab({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const [editing, setEditing] = useState<Task | null>(null)
  const blank = (): Task => ({ id: uid(), category: 'Venue', title: '', dueDate: '', done: false, createdAt: new Date().toISOString() })

  const save = () => {
    if (!editing) return
    const updated = [...tasks.filter(t => t.id !== editing.id), editing]
    setTasks(updated); saveTasks(updated); setEditing(null)
  }
  const del = (id: string) => {
    if (!confirm('Delete this task?')) return
    const updated = tasks.filter(t => t.id !== id); setTasks(updated); saveTasks(updated)
  }
  const toggle = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTasks(updated); saveTasks(updated)
  }

  const pending   = tasks.filter(t => !t.done)
  const completed = tasks.filter(t => t.done)

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-section-title">Wedding Planner</h2>
        <button className="adm-btn-primary" onClick={() => setEditing(blank())}>+ Add Task</button>
      </div>
      {editing && (
        <Modal title={editing.title ? 'Edit Task' : 'New Task'} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Category"><select className="adm-input" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>{TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Task Title"><input className="adm-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Book photographer" /></Field>
          <Field label="Due Date"><input className="adm-input" type="date" value={editing.dueDate} onChange={e => setEditing({ ...editing, dueDate: e.target.value })} /></Field>
          <label className="adm-checkbox"><input type="checkbox" checked={editing.done} onChange={e => setEditing({ ...editing, done: e.target.checked })} /><span>Mark as complete</span></label>
        </Modal>
      )}
      <div className="adm-stats">
        <Stat value={pending.length} label="Pending" />
        <Stat value={completed.length} label="Completed" />
      </div>
      {pending.length > 0 && (
        <>
          <h3 className="adm-sub-heading">To Do</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th style={{ width: 40 }}></th><th>Task</th><th>Category</th><th>Due Date</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.map(t => (
                  <tr key={t.id}>
                    <td><input type="checkbox" checked={false} onChange={() => toggle(t.id)} /></td>
                    <td><strong>{t.title}</strong></td>
                    <td>{t.category}</td>
                    <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><button className="adm-btn-sm" onClick={() => setEditing(t)}>Edit</button><button className="adm-btn-sm adm-btn-sm-danger" onClick={() => del(t.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {completed.length > 0 && (
        <>
          <h3 className="adm-sub-heading">Completed ({completed.length})</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <tbody>
                {completed.map(t => (
                  <tr key={t.id} className="adm-row-done">
                    <td style={{ width: 40 }}><input type="checkbox" checked onChange={() => toggle(t.id)} /></td>
                    <td><strong>{t.title}</strong></td>
                    <td>{t.category}</td>
                    <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><button className="adm-btn-sm adm-btn-sm-danger" onClick={() => del(t.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="adm-stat">
      <span className="adm-stat-val">{value}</span>
      <span className="adm-stat-lbl">{label}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="adm-field"><label className="adm-label">{label}</label>{children}</div>
}

function Modal({ title, children, onClose, onSave }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void }) {
  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3 className="adm-modal-title">{title}</h3>
        {children}
        <div className="adm-modal-actions">
          <button className="adm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
