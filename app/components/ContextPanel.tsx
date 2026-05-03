'use client'

import { useState, useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { Message } from '@/app/actions/messages'

type CodeBlock = {
  language: string
  code: string
}

function extractCodeBlocks(messages: Message[]): CodeBlock[] {
  const blocks: CodeBlock[] = []
  for (const msg of messages) {
    if (msg.role !== 'assistant') continue
    const stripped = msg.content.replace(/```question[\s\S]*?```/g, '')
    const regex = /```(\w+)?\n([\s\S]*?)```/g
    let match
    while ((match = regex.exec(stripped)) !== null) {
      blocks.push({ language: match[1] ?? 'text', code: match[2].trim() })
    }
  }
  return blocks.reverse()
}

function extractComplexity(messages: Message[]): string[] {
  const seen = new Set<string>()
  const results: string[] = []
  for (const msg of [...messages].reverse()) {
    if (msg.role !== 'assistant') continue
    const matches = msg.content.match(/O\([^)]+\)/g) ?? []
    for (const m of matches) {
      if (!seen.has(m)) {
        seen.add(m)
        results.push(m)
      }
    }
  }
  return results
}

type Props = {
  messages: Message[]
  isVisible: boolean
  onToggle: () => void
}

export default function ContextPanel({ messages, isVisible, onToggle }: Props) {
  const [width, setWidth] = useState(288)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(288)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return
      // Panel is on the right — dragging left (smaller clientX) widens it
      const delta = startX.current - e.clientX
      setWidth(Math.max(180, Math.min(600, startWidth.current + delta)))
    }
    function onMouseUp() {
      if (!isResizing.current) return
      isResizing.current = false
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

  function startResize(e: React.MouseEvent) {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    e.preventDefault()
  }

  const codeBlocks = extractCodeBlocks(messages)
  const complexities = extractComplexity(messages)
  const isEmpty = codeBlocks.length === 0 && complexities.length === 0

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        title="Show context panel"
        className="flex w-8 shrink-0 items-start justify-center border-l border-slate-800 bg-slate-900 pt-4 text-lg text-slate-600 hover:text-slate-400 transition-colors"
      >
        ‹
      </button>
    )
  }

  return (
    <div
      style={{ width }}
      className="relative flex shrink-0 flex-col border-l border-slate-800 bg-slate-900"
    >
      {/* Resize handle — left edge */}
      <div
        onMouseDown={startResize}
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/40 transition-colors"
      />

      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <span className="text-sm font-bold tracking-wide text-slate-100">
          Context
        </span>
        <button
          onClick={onToggle}
          title="Hide context panel"
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          ›
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 px-3 py-4">

        {isEmpty && (
          <p className="mt-8 text-center text-xs leading-relaxed text-slate-600">
            Context will appear here as the conversation progresses.
          </p>
        )}

        {complexities.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-bold uppercase tracking-widest text-slate-200">
              Complexity
            </p>
            <div className="flex flex-wrap gap-2 px-1">
              {complexities.map((c, i) => (
                <span
                  key={i}
                  className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-indigo-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {codeBlocks.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-xs font-bold uppercase tracking-widest text-slate-200">
              Code
            </p>
            {codeBlocks.map((block, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-slate-800">
                <SyntaxHighlighter
                  style={oneDark}
                  language={block.language}
                  PreTag="div"
                  customStyle={{ margin: 0, fontSize: '0.72rem', borderRadius: 0 }}
                >
                  {block.code}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
