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

## Screenshots

**Sign in**

![Login](https://github.com/user-attachments/assets/9a15dabd-d6e9-45ea-8f27-88a592a95200)

Sign in with email, Google, or GitHub. Sessions are tied to your account so your history and weakness data follow you across devices.

---

**Dashboard**

![Dashboard](https://github.com/user-attachments/assets/ee814454-14df-4dd4-984b-39165823a686)

Pick a mode from the dashboard. Prep mode lets you paste any problem — or just type a name like "Two Sum" — and starts a guided session. Your session history stays in the sidebar so you can jump back to anything.

---

**Prep mode — complexity analysis**

![Prep Mode with Complexity](https://github.com/user-attachments/assets/806a7228-2afe-4a4e-af4f-f20d62d88eef)

The context panel on the right automatically extracts any code blocks and complexity notation from the conversation as you go.

---

**Interview setup**

![Interview Setup](https://github.com/user-attachments/assets/700b07b5-0833-4435-bf8a-538e10bd5f00)

Pick your difficulty level and optionally filter by up to 3 patterns. Junior targets easy LeetCode problems, Mid goes to medium, Senior is hard. The AI generates a fresh problem every time.

---

**Live interview**

![Live Interview](https://github.com/user-attachments/assets/f25896b8-0f79-41c4-b1db-17adf7d87226)

The moment you start, the clock is running. Problem is on the right, chat on the left. The AI acts like a real interviewer — asks questions, never gives hints, and pushes back if your answer is vague.

---

**Code editor**

![Code Editor](https://github.com/user-attachments/assets/42f19ab7-b432-4e70-9dcf-6a7e2ebd6c82)

Switch to the code tab mid-conversation to write your solution. Submit it and the AI evaluates it silently — if it's correct, you move on. If not, it walks you through the exact step where it breaks.

---

**Multi-problem session**

![Next Problem](https://github.com/user-attachments/assets/2c164504-4343-4cb9-b079-25bd08b398fd)

If time allows, the interviewer gives you a second problem. Sessions are tracked individually so each one contributes to your weakness profile.

---

**Feedback scorecard**

![Scorecard](https://github.com/user-attachments/assets/e154f2dc-0cb7-445f-9057-90c3c5b6177f)

When the session ends you get a scorecard with scores across communication, problem solving, and code quality, a Ready / Getting Close / Not Ready verdict, specific observations from the session, and one suggested problem to try next.

---

**Weakness profile**

![Weakness Profile](https://github.com/user-attachments/assets/76a1618e-2634-42fc-ba18-0df20af7fdd3)

After each session the app updates your weakness profile automatically. The radar chart shows relative strength across patterns. The top weaknesses section shows where you keep getting stuck and what stage you break down at.

---

**All patterns**

![All Patterns](https://github.com/user-attachments/assets/5fce97eb-ecae-4a0c-a438-9262cab2dce1)

The full breakdown shows every pattern you've touched, how many sessions you've done, how many you abandoned, average hints needed, and whether you're improving or regressing over time.

---

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
