
# DAYPLAN — AI-Powered Task Manager



A full-stack daily task manager with AI-powered productivity coaching.

## Features
- Task management with priority levels (High, Medium, Low)
- Priority-based browser notifications and reminders
- AI Battle Plan — generates a personalized daily plan via Claude API
- Three coaching modes: Drill Sergeant , Zen Coach , Hype Beast 
- User authentication via Supabase (email/password + Google OAuth)
- Real-time sync across devices via Supabase WebSockets
- Responsive dark-mode UI

## Tech Stack
- **Frontend:** Vite + Vanilla JS (ES Modules)
- **Auth + DB:** Supabase (PostgreSQL + Row Level Security + Realtime)
- **AI:** Anthropic Claude API
- **Hosting:** Netlify

## Setup

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/dayplan.git
cd dayplan
npm install



