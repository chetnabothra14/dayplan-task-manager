import { tasks } from './tasks.js'

export function updateClock() {
  const now = new Date()
  const el  = document.getElementById('date-display')
  if (!el) return
  el.innerHTML =
    now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
    '<br>' +
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function requestNotifPermission() {
  if (!('Notification' in window)) return
  Notification.requestPermission().then(p => {
    if (p === 'granted') {
      document.getElementById('perm-bar').style.display = 'none'
      showToast('low', 'Reminders On', "You'll be notified when tasks are due.")
    }
  })
}

export function checkReminders() {
  if (Notification.permission !== 'granted') return
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const offsets = { high: 5, medium: 15, low: 0 }

  tasks.forEach(t => {
    if (t.done || !t.time || t.reminded) return
    const [h, m]   = t.time.split(':')
    const taskMins = +h * 60 + +m
    const diff     = taskMins - nowMins
    const offset   = offsets[t.priority] || 0

    if (diff <= offset && diff > offset - 2) {
      new Notification('DAYPLAN — ' + t.name, {
        body: {
          high:   '🟠 High Priority — get on it!',
          medium: '🟡 Time to start this.',
          low:    '🟢 Low priority reminder.'
        }[t.priority]
      })
      showToast(t.priority, diff <= 0 ? 'Task Due!' : 'Due Soon', t.name)
      t.reminded = true
    }
  })
}

export function showToast(priority, title, body) {
  const c     = document.getElementById('toast-container')
  const toast = document.createElement('div')
  const icons = { high: '🟠', medium: '🟡', low: '🟢', info: 'ℹ️' }

  toast.className = `toast ${priority}`
  toast.innerHTML = `
    <div class="toast-icon">${icons[priority] || '🔔'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
    <button class="toast-close">×</button>`

  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast))
  c.appendChild(toast)
  setTimeout(() => dismissToast(toast), 5000)
}

function dismissToast(el) {
  el.classList.add('hide')
  setTimeout(() => el.remove(), 300)
}
