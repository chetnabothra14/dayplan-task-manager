import { tasks } from './tasks.js'
import { escHtml } from './utils.js'

let bpOpen      = false
let currentMode = 'drill'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

const MODE_PROMPTS = {
  drill: 'You are a no-nonsense drill sergeant productivity coach. Be direct, commanding, intense. Short sharp sentences. No sympathy — just results.',
  coach: 'You are a calm, wise zen productivity coach. Be warm, measured, and mindful. Help the user focus without panic. Use gentle, grounding language.',
  hype:  'You are an over-the-top hype beast productivity coach. Be LOUD, enthusiastic, use caps for emphasis. Sports metaphors. Make them feel unstoppable.'
}

export function toggleBattlePlan() {
  bpOpen = !bpOpen
  document.getElementById('bp-body').classList.toggle('open', bpOpen)
  document.getElementById('bp-toggle').classList.toggle('open', bpOpen)
  if (bpOpen) updateProgress()
}

export function updateProgress() {
  const total = tasks.length
  const done  = tasks.filter(t => t.done).length
  const pct   = total ? Math.round((done / total) * 100) : 0
  document.getElementById('progress-fill').style.width = pct + '%'
  document.getElementById('progress-pct').textContent  = pct + '%'
}

export function setMode(mode) {
  currentMode = mode
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('mode-' + mode).classList.add('active')
}

export async function generatePlan() {
  const pending = tasks.filter(t => !t.done)

  if (!pending.length) {
    document.getElementById('bp-content').innerHTML =
      '<div class="bp-quote">🎉 Everything done! You crushed it today. Take a break.</div>'
    document.getElementById('bp-content').classList.add('visible')
    return
  }

  const btn     = document.getElementById('bp-btn')
  const content = document.getElementById('bp-content')
  btn.disabled  = true
  btn.innerHTML = '<span>⚡</span> Generating...'
  content.innerHTML = '<div class="bp-loading"><div class="bp-spinner"></div><span>Building your plan...</span></div>'
  content.classList.add('visible')

  const taskList = pending.map(t =>
    `- [${t.priority.toUpperCase()}] "${t.name}"${t.time ? ' at ' + t.time : ' (no time)'}`
  ).join('\n')

  const done = tasks.filter(t => t.done).length
  const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const userPrompt = `Tasks for today:\n${taskList}\n\nCompleted ${done}/${tasks.length} (${pct}%).\n\nReturn ONLY valid JSON, no markdown:\n{\n  "mood": "one sentence in your coaching voice (max 12 words)",\n  "moodEmoji": "one emoji",\n  "steps": [\n    {\n      "taskName": "exact task name",\n      "priority": "high|medium|low",\n      "tip": "one actionable sentence in your voice (max 20 words)",\n      "order": 1\n    }\n  ],\n  "quote": "original motivational quote in your voice (max 20 words)"\n}\nSort steps high priority first. Stay in character.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     MODE_PROMPTS[currentMode],
        messages:   [{ role: 'user', content: userPrompt }]
      })
    })

    const data  = await res.json()
    const text  = data.content?.map(c => c.text || '').join('') || ''
    const plan  = JSON.parse(text.replace(/```json|```/g, '').trim())
    renderPlan(plan)
  } catch (e) {
    content.innerHTML = `
      <div class="bp-error">
        ⚠️ Could not generate plan. Check your Anthropic API key in .env<br>
        <small style="opacity:.6">${e.message}</small>
      </div>`
  }

  btn.disabled = false
  btn.innerHTML = '<span>⚡</span> Regenerate Battle Plan'
}

function renderPlan(plan) {
  const content   = document.getElementById('bp-content')
  const stepsHtml = plan.steps.map((s, i) => `
    <div class="bp-step ${s.priority}-step" style="animation-delay:${i * .07}s">
      <div class="bp-step-num">${s.order || i + 1}</div>
      <div class="bp-step-content">
        <div class="bp-step-name">${escHtml(s.taskName)}</div>
        <div class="bp-step-tip">${escHtml(s.tip)}</div>
      </div>
    </div>`).join('')

  content.innerHTML = `
    <div class="bp-mood-bar">
      <div class="bp-mood-emoji">${plan.moodEmoji}</div>
      <div class="bp-mood-text">${escHtml(plan.mood)}</div>
    </div>
    <div class="bp-steps">${stepsHtml}</div>
    <div class="bp-quote">"${escHtml(plan.quote)}"</div>`
  content.classList.add('visible')
}
