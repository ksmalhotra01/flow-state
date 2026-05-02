'use client'

import { useActionState, useOptimistic, useEffect, useRef, startTransition, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { sendMessage, type Message, type MessagesState } from '@/app/actions/messages'
import Nav from '@/app/components/Nav'
import SessionSidebar, { type SessionSummary } from '@/app/components/SessionSidebar'
import ContextPanel from '@/app/components/ContextPanel'
import InterviewTimer from '@/app/components/InterviewTimer'

const CodeEditor = dynamic(() => import('@/app/components/CodeEditor'), { ssr: false })

type MCQQuestion = { type: 'mcq'; question: string; options: string[] }
type TFQuestion = { type: 'tf'; statement: string }
type FillQuestion = { type: 'fill'; template: string }
type ParsedQuestion = MCQQuestion | TFQuestion | FillQuestion

function fixExponents(text: string): string {
  return text.replace(/\^(\d+)/g, (_, n) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(n)] ?? `^${n}`)
}

function parseQuestion(content: string): ParsedQuestion | null {
  const match = content.match(/```question\n([\s\S]*?)```/)
  if (!match) return null
  try {
    return JSON.parse(match[1].trim()) as ParsedQuestion
  } catch {
    return null
  }
}

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className } = props
          const match = /language-(\w+)/.exec(className || '')
          const isBlock = match || String(children).includes('\n')

          if (isBlock) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] ?? 'text'}
                PreTag="div"
                customStyle={{ borderRadius: '0.5rem', fontSize: '0.8rem', margin: '0.75rem 0' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }

          return (
            <code className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-indigo-300">
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-3 list-inside list-disc space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-3 list-inside list-decimal space-y-1">{children}</ol>
        },
        strong({ children }) {
          return <strong className="font-semibold text-slate-100">{children}</strong>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function FillQuestion({
  question,
  onSubmit,
  disabled,
}: {
  question: FillQuestion
  onSubmit: (answer: string) => void
  disabled: boolean
}) {
  const parts = question.template
    .replace(/type your answer in the box below\.?/gi, '')
    .trim()
    .split('___')
  const [answers, setAnswers] = useState<string[]>(new Array(parts.length - 1).fill(''))

  function handleSubmit() {
    const filled = parts.map((part, i) => part + (i < answers.length ? answers[i] : '')).join('')
    onSubmit(filled.trim())
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-loose text-slate-300">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers]
                  next[i] = e.target.value
                  setAnswers(next)
                }}
                disabled={disabled}
                placeholder="..."
                className="inline-block mx-1.5 w-28 rounded border border-indigo-500 bg-slate-800 px-2 py-0.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
              />
            )}
          </span>
        ))}
      </p>
      <button
        onClick={handleSubmit}
        disabled={disabled || answers.some(a => !a.trim())}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>
    </div>
  )
}

function InteractiveQuestion({
  question,
  onSubmit,
  disabled,
}: {
  question: ParsedQuestion
  onSubmit: (answer: string) => void
  disabled: boolean
}) {
  if (question.type === 'mcq') {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-300">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onSubmit(option)}
              disabled={disabled}
              className="w-full text-left rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-indigo-500 hover:bg-indigo-950 hover:text-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-indigo-400 mr-2">{String.fromCharCode(65 + i)})</span>
              {fixExponents(option)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (question.type === 'tf') {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-300">{fixExponents(question.statement)}</p>
        <div className="flex gap-3">
          <button
            onClick={() => onSubmit('True')}
            disabled={disabled}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-green-500 hover:bg-green-950 hover:text-green-300 transition-colors disabled:opacity-50"
          >
            True
          </button>
          <button
            onClick={() => onSubmit('False')}
            disabled={disabled}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-red-500 hover:bg-red-950 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            False
          </button>
        </div>
      </div>
    )
  }

  if (question.type === 'fill') {
    return <FillQuestion question={question} onSubmit={onSubmit} disabled={disabled} />
  }

  return null
}

export default function ThinkingPad({
  sessionId,
  problem,
  initialMessages,
  allSessions,
  mode = 'prep',
}: {
  sessionId: string
  problem: string
  initialMessages: Message[]
  allSessions: SessionSummary[]
  mode?: 'prep' | 'interview'
}) {
  const [state, serverAction, pending] = useActionState<MessagesState, FormData>(sendMessage, {
    messages: initialMessages,
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const confirmedMessages = state?.messages ?? initialMessages

  const [optimisticMessages, addOptimistic] = useOptimistic(
    confirmedMessages,
    (current: Message[], newMessage: Message) => [...current, newMessage]
  )

  const [codeMode, setCodeMode] = useState(false)
  const [inputHeight, setInputHeight] = useState(240)
  const [timeUp, setTimeUp] = useState(false)
  const isInputResizing = useRef(false)
  const startInputY = useRef(0)
  const startInputHeight = useRef(240)

  // Both panels persisted in localStorage — toggle without touching the database
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('flowstate-sidebar') !== 'false'
  })

  const [showContext, setShowContext] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('flowstate-context') !== 'false'
  })

  function toggleSidebar() {
    const next = !showSidebar
    setShowSidebar(next)
    localStorage.setItem('flowstate-sidebar', String(next))
  }

  function toggleContext() {
    const next = !showContext
    setShowContext(next)
    localStorage.setItem('flowstate-context', String(next))
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [optimisticMessages])

  const prevPendingRef = useRef(false)
  useEffect(() => {
    if (prevPendingRef.current && !pending) {
      textareaRef.current?.focus()
    }
    prevPendingRef.current = pending
  }, [pending])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isInputResizing.current) return
      const delta = startInputY.current - e.clientY
      setInputHeight(Math.max(120, Math.min(560, startInputHeight.current + delta)))
    }
    function onMouseUp() {
      if (!isInputResizing.current) return
      isInputResizing.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function startInputResize(e: React.MouseEvent) {
    isInputResizing.current = true
    startInputY.current = e.clientY
    startInputHeight.current = inputHeight
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'row-resize'
    e.preventDefault()
  }

  function formAction(formData: FormData) {
    const content = formData.get('content') as string
    if (!content?.trim()) return
    addOptimistic({
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    })
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.focus()
    }
    serverAction(formData)
  }

  function submitAnswer(answer: string) {
    const fd = new FormData()
    fd.set('content', answer)
    fd.set('session_id', sessionId)
    startTransition(() => formAction(fd))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">

      {/* Time-up overlay for interview mode */}
      {timeUp && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-red-800 bg-slate-900 p-8 text-center">
            <p className="mb-2 text-4xl font-bold text-red-400">Time&apos;s Up</p>
            <p className="mb-6 text-slate-400 text-sm">
              Your 30 minutes are done. Review your conversation below, then head back to the dashboard.
            </p>
            <button
              onClick={() => setTimeUp(false)}
              className="rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
            >
              Review session
            </button>
          </div>
        </div>
      )}

      <Nav />

      {/* Below the nav: three-column layout that fills the rest of the screen */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left column: session history */}
        <SessionSidebar
          sessions={allSessions}
          currentSessionId={sessionId}
          isVisible={showSidebar}
          onToggle={toggleSidebar}
        />

        {/* Center column: problem + messages + input */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Problem pinned at top */}
          <div className="shrink-0 border-b border-slate-800 bg-slate-900 py-4">
            <div className="mx-auto max-w-3xl px-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Problem</p>
                {mode === 'interview' && (
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-red-950 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-red-400">
                      Interview
                    </span>
                    <InterviewTimer
                      durationSeconds={1800}
                      onTimeUp={() => setTimeUp(true)}
                    />
                  </div>
                )}
              </div>
              <div className="border-l-2 border-indigo-500 pl-3">
                <p className="line-clamp-3 font-mono text-sm leading-relaxed text-slate-100">{problem}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-8">
            <div className="mx-auto max-w-3xl space-y-4 px-4">

              {optimisticMessages.length === 0 && (
                <p className="mt-16 text-center text-sm text-slate-500">
                  Explain your initial approach to the problem.
                </p>
              )}

              {optimisticMessages.map((message) => {
                const question = message.role === 'assistant' ? parseQuestion(message.content) : null

                return (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-5 text-sm ${
                      message.role === 'assistant'
                        ? 'border-slate-700 bg-slate-900 text-slate-200'
                        : 'border-indigo-800 bg-slate-800 text-white'
                    }`}
                  >
                    <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${
                      message.role === 'assistant' ? 'text-indigo-300' : 'text-slate-400'
                    }`}>
                      {message.role === 'assistant' ? 'Interviewer' : 'You'}
                    </p>
                    {message.role === 'assistant' ? (
                      question && mode !== 'interview' ? (
                        <InteractiveQuestion
                          question={question}
                          onSubmit={submitAnswer}
                          disabled={pending}
                        />
                      ) : (
                        <MessageContent content={message.content.replace(/```question[\s\S]*?```/g, '')} />
                      )
                    ) : (
                      <MessageContent content={message.content} />
                    )}
                  </div>
                )
              })}

              {pending && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    Interviewer
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input panel — resizable from the top edge */}
          <div
            style={{ height: inputHeight }}
            className="shrink-0 flex flex-col bg-slate-950"
          >

            {/* Drag handle — the top border itself is the resize grip */}
            <div
              onMouseDown={startInputResize}
              className="group flex h-3 shrink-0 cursor-row-resize items-center justify-center border-t border-slate-800 hover:border-indigo-500/50 transition-colors"
            >
              <div className="h-0.5 w-12 rounded-full bg-slate-700 group-hover:bg-indigo-500/70 transition-colors" />
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-slate-800">
              <button
                onClick={() => setCodeMode(false)}
                className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  !codeMode
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCodeMode(true)}
                className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  codeMode
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Code
              </button>
            </div>

            {/* Content — flex-col so children can fill the height */}
            <div className="flex flex-1 flex-col overflow-hidden px-4 py-3 gap-2 min-h-0">
              {state?.error && (
                <p className="shrink-0 text-xs text-red-400">{state.error}</p>
              )}
              {codeMode ? (
                <div className="flex-1 min-h-0">
                  <CodeEditor onSubmit={submitAnswer} disabled={pending} />
                </div>
              ) : (
                <form ref={formRef} action={formAction} className="flex flex-col flex-1 min-h-0">
                  <input type="hidden" name="session_id" value={sessionId} />
                  <div className="relative flex flex-col flex-1 min-h-0">
                    <textarea
                      ref={textareaRef}
                      name="content"
                      placeholder="Explain your thinking… (Enter to send · Shift+Enter for new line)"
                      disabled={pending}
                      onKeyDown={handleKeyDown}
                      className="flex-1 min-h-0 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-24 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={pending}
                      className="absolute bottom-3 right-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* Right column: context panel */}
        <ContextPanel
          messages={optimisticMessages}
          isVisible={showContext}
          onToggle={toggleContext}
        />

      </div>
    </div>
  )
}
