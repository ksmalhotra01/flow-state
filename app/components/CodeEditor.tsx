'use client'

import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import type { Extension } from '@codemirror/state'

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++'] as const
type Language = typeof LANGUAGES[number]

function getExtension(lang: Language): Extension {
  switch (lang) {
    case 'Python': return python()
    case 'JavaScript': return javascript()
    case 'TypeScript': return javascript({ typescript: true })
    case 'Java': return java()
    case 'C++': return cpp()
  }
}

function getLangTag(lang: Language): string {
  switch (lang) {
    case 'Python': return 'python'
    case 'JavaScript': return 'javascript'
    case 'TypeScript': return 'typescript'
    case 'Java': return 'java'
    case 'C++': return 'cpp'
  }
}

export default function CodeEditor({
  onSubmit,
  disabled,
}: {
  onSubmit: (code: string) => void
  disabled: boolean
}) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('Python')

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return
    onSubmit(`\`\`\`${getLangTag(language)}\n${code}\n\`\`\``)
  }, [code, language, onSubmit])

  return (
    <div className="flex flex-col h-full gap-2">

      <div className="flex shrink-0 gap-1">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              language === lang
                ? 'bg-orange-600 text-white'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-stone-700">
        <CodeMirror
          value={code}
          onChange={setCode}
          theme={oneDark}
          extensions={[getExtension(language)]}
          height="100%"
          editable={!disabled}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            autocompletion: true,
            indentOnInput: true,
            tabSize: 4,
          }}
          style={{ fontSize: '0.8rem', height: '100%' }}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between">
        <p className="text-xs text-stone-500">Tab indents · Shift+Enter for new line</p>
        <button
          onClick={handleSubmit}
          disabled={disabled || !code.trim()}
          className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Code
        </button>
      </div>

    </div>
  )
}
