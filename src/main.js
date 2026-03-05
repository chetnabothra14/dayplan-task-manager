// CSS imports
import './css/base.css'
import './css/auth.css'
import './css/layout.css'
import './css/tasks.css'
import './css/battleplan.css'
import './css/toast.css'

// JS imports
import { initAuth, authSubmit, switchTab, googleLogin, signOut } from './js/auth.js'
import { loadTasks, addTask, setSort, setUserId, subscribeRealtime } from './js/tasks.js'
import { updateClock, requestNotifPermission, checkReminders } from './js/reminders.js'
import { toggleBattlePlan, setMode, generatePlan } from './js/battleplan.js'

// ── Expose to HTML (needed since we use onclick in HTML) ──
window.switchTab             = switchTab
window.authSubmit            = authSubmit
window.googleLogin           = googleLogin
window.signOut               = signOut
window.addTask               = addTask
window.setSort               = setSort
window.requestNotifPermission = requestNotifPermission
window.toggleBattlePlan      = toggleBattlePlan
window.setMode               = setMode
window.generatePlan          = generatePlan

// ── Init ──
updateClock()
setInterval(updateClock, 1000)

// Enter key on task input
document.getElementById('task-input')
  .addEventListener('keydown', e => { if (e.key === 'Enter') addTask() })

// Hide notification bar if already granted
if (Notification.permission === 'granted') {
  document.getElementById('perm-bar').style.display = 'none'
}

// Start auth — fires onLogin when a session exists
initAuth(async (user) => {
  setUserId(user.id)
  await loadTasks()
  subscribeRealtime(user.id)
  setInterval(checkReminders, 60000)
  checkReminders()
})
