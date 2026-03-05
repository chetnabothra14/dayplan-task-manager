export function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
