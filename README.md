<<<<<<< HEAD
# DAYPLAN — AI-Powered Task Manager
=======
# dayplan# DAYPLAN — AI Task Manager
>>>>>>> d1fb591480be6a84648eb25c9cb28595f6a20fa0

A full-stack daily task manager with AI-powered productivity coaching.

## Features
- Task management with priority levels (High, Medium, Low)
- Priority-based browser notifications and reminders
<<<<<<< HEAD
- AI Battle Plan — generates a personalized daily plan via Claude API
- Three coaching modes: Drill Sergeant 🪖, Zen Coach 🧘, Hype Beast 🔥
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
```

### 2. Create your .env file
```bash
cp .env.example .env
```
Fill in your keys:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from supabase.com → Settings → API
- `VITE_ANTHROPIC_KEY` from console.anthropic.com → API Keys

### 3. Set up the database
Run this in Supabase SQL Editor:
```sql
CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  priority text CHECK (priority IN ('high', 'medium', 'low')),
  time text,
  done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own tasks only" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Netlify
1. Push to GitHub
2. Connect repo on netlify.com
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add your 3 env vars in Netlify → Site Settings → Environment Variables
=======
- AI Battle Plan — generates a personalized daily plan powered by Claude API
- Three coaching modes: Drill Sergeant, Zen Coach, Hype Beast
- User authentication via Supabase (email + Google OAuth)
- Real-time sync across devices via Supabase WebSockets
- Responsive dark-mode UI built from scratch

## Tech Stack
- Frontend: Vanilla HTML, CSS, JavaScript
- Backend/Auth/DB: Supabase (PostgreSQL + Row Level Security)
- AI: Anthropic Claude API (claude-sonnet)


>>>>>>> d1fb591480be6a84648eb25c9cb28595f6a20fa0
