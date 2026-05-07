# FlowState

FlowState is an AI-powered coding interview prep tool. Instead of grinding problems alone with no feedback, you work through them with an AI coach that asks questions instead of giving answers. There's also a full interview simulator with a timer, AI-generated problems, and a scorecard at the end.

## Features

- **Prep mode** - paste any coding problem and work through it with a Socratic AI coach. It never gives you the solution, it just asks the right questions. Supports open questions, MCQ, true/false, and fill-in-the-blank formats.
- **Interview mode** - 30-minute timed interview with a fresh AI-generated problem. Pick Junior, Mid, or Senior difficulty and optionally filter by pattern. The AI behaves like a real interviewer, gives multiple problems if time allows, and never gives hints.
- **Feedback scorecard** - after every interview you get a Not Ready / Getting Close / Ready verdict with scores across communication, problem solving, and code quality, plus specific things to work on before your next session.
- **Weakness profile** - tracks patterns across all your sessions and shows where you keep getting stuck. Radar chart, per-pattern bar charts, and trend indicators.
- **Code editor** - switch between chat and a full code editor mid-session. Supports Python, JavaScript, TypeScript, Java, and C++.
- **Auth** - email/password, Google, and GitHub sign-in.

## How it works

You paste a problem and pick your confidence level. The AI breaks the problem down mentally and guides you to each insight one question at a time. When you submit code it evaluates it silently and either confirms it or walks you through a specific test case that exposes the bug. After the session, your pattern strengths and weaknesses get updated automatically.

## Stack

- Next.js 16 (App Router)
- Supabase (auth + database)
- Anthropic Claude API
- Tailwind CSS
- Vercel

## Getting Started

```bash
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
