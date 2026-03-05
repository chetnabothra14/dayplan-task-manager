import { sb } from '../supabase.js'
import { showToast } from './reminders.js'
import { updateProgress } from './battleplan.js'
import { escHtml, formatTime } from './utils.js'

export let tasks   = []
let sortMode       = 'priority'
let currentUserId  = null

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export function setUserId(id) {
  currentUserId = id
}

export async function loadTasks() {
  document.getElementById('task-list').innerHTML =
    '<div class="app-loading"><div class="bp-spinner"></div> Loading tasks...</div>'

  const { data, error } = await sb.from('tasks').select('*').order('created_at')
  if (error) { showToast('high', 'Error', error.message); return }
  tasks = data || []
  render()
}

export async function addTask() {
  const name = document.getElementById('task-input').value.trim()
  if (!name) { document.getElementById('task-input').focus(); return }

  const time     = document.getElementById('task-time').value
  const priority = document.getElementById('task-priority').value

  const { data, error } = await sb.from('tasks').insert({
    name,
    priority,
    time: time || null,
    done: false,
    user_id: currentUserId
  }).select().single()

  if (error) { showToast('high', 'Error', 'Could not save task.'); return }

  document.getElementById('task-input').value = ''
  tasks.push(data)
  render()
}

export async function toggleDone(id) {
  const t = tasks.find(t => t.id === id)
  if (!t) return
  const { error } = await sb.from('tasks').update({ done: !t.done }).eq('id', id)
  if (error) return
  t.done = !t.done
  updateProgress()
  render()
}

export async function deleteTask(id) {
  const { error } = await sb.from('tasks').delete().eq('id', id)
  if (error) return
  tasks = tasks.filter(t => t.id !== id)
  render()
}

export function setSort(mode) {
  sortMode = mode
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('sort-' + mode).classList.add('active')
  render()
}

export function subscribeRealtime(userId) {
  sb.channel('tasks-changes')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'tasks',
      filter: `user_id=eq.${userId}`
    }, payload => {
      if (payload.eventType === 'INSERT') {
        if (!tasks.find(t => t.id === payload.new.id)) tasks.push(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const i = tasks.findIndex(t => t.id === payload.new.id)
        if (i > -1) tasks[i] = payload.new
      } else if (payload.eventType === 'DELETE') {
        tasks = tasks.filter(t => t.id !== payload.old.id)
      }
      render()
      updateProgress()
    })
    .subscribe()
}

function getSorted() {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (sortMode === 'priority') {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    }
    if (sortMode === 'time') {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    }
    return new Date(a.created_at) - new Date(b.created_at)
  })
}

export function render() {
  const total = tasks.length
  const done  = tasks.filter(t => t.done).length
  const high  = tasks.filter(t => t.priority === 'high' && !t.done).length

  document.getElementById('stat-total').textContent   = total
  document.getElementById('stat-done').textContent    = done
  document.getElementById('stat-pending').textContent = total - done
  document.getElementById('stat-high').textContent    = high

  const list   = document.getElementById('task-list')
  const sorted = getSorted()

  if (!sorted.length) {
    list.innerHTML = '<div class="empty-state">No tasks yet — add your first one above</div>'
    return
  }

  list.innerHTML = sorted.map(t => `
    <div class="task-item ${t.priority} ${t.done ? 'done' : ''}">
      <div class="task-check" data-id="${t.id}"></div>
      <div class="task-body">
        <div class="task-name">${escHtml(t.name)}</div>
        <div class="task-meta">
          <span class="priority-badge">${t.priority}</span>
          ${t.time ? `<span>⏰ ${formatTime(t.time)}</span>` : '<span>no time set</span>'}
        </div>
      </div>
      <button class="reminder-btn" data-id="${t.id}" title="Reminder">🔔</button>
      <button class="delete-btn"   data-id="${t.id}" title="Delete">✕</button>
    </div>
  `).join('')

  // Event delegation — clean, no inline onclick
  list.querySelectorAll('.task-check').forEach(el =>
    el.addEventListener('click', () => toggleDone(el.dataset.id)))
  list.querySelectorAll('.delete-btn').forEach(el =>
    el.addEventListener('click', () => deleteTask(el.dataset.id)))
  list.querySelectorAll('.reminder-btn').forEach(el =>
    el.addEventListener('click', () => flashReminder(el.dataset.id)))
}

function flashReminder(id) {
  const t = tasks.find(t => t.id === id)
  if (!t || !t.time) {
    showToast('medium', 'No Time Set', 'Add a time to this task first.')
    return
  }
  showToast(t.priority, 'Reminder Set', `"${t.name}" — ${formatTime(t.time)}`)
}
