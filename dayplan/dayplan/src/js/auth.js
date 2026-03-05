import { sb } from '../supabase.js'

export let currentUser = null
let authMode = 'login'

export function switchTab(mode) {
  authMode = mode
  document.getElementById('tab-login').classList.toggle('active', mode === 'login')
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup')
  document.getElementById('auth-btn').textContent = mode === 'login' ? 'Sign In' : 'Create Account'
  setAuthMsg('', '')
}

export function setAuthMsg(msg, type) {
  const el = document.getElementById('auth-msg')
  el.textContent = msg
  el.className = 'auth-msg' + (type ? ' ' + type : '')
}

export async function authSubmit() {
  const email    = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  const btn      = document.getElementById('auth-btn')

  if (!email || !password) {
    setAuthMsg('Please fill in all fields.', 'error')
    return
  }

  btn.disabled    = true
  btn.textContent = 'Please wait...'
  setAuthMsg('', '')

  if (authMode === 'signup') {
    const { error } = await sb.auth.signUp({ email, password })
    if (error) setAuthMsg(error.message, 'error')
    else       setAuthMsg('Check your email to confirm your account!', 'success')
  } else {
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) setAuthMsg(error.message, 'error')
  }

  btn.disabled    = false
  btn.textContent = authMode === 'login' ? 'Sign In' : 'Create Account'
}

export async function googleLogin() {
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  })
}

export async function signOut() {
  await sb.auth.signOut()
  currentUser = null
  document.getElementById('app').style.display          = 'none'
  document.getElementById('auth-screen').style.display  = 'flex'
}

// Called from main.js once on startup
export function initAuth(onLogin) {
  sb.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      currentUser = session.user
      document.getElementById('auth-screen').style.display = 'none'
      document.getElementById('app').style.display         = 'block'
      document.getElementById('user-email').textContent    = currentUser.email
      onLogin(currentUser)
    }
  })
}
