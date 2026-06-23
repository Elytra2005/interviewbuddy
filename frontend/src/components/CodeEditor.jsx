import { useRef, useCallback } from 'react'
import MonacoEditor from '@monaco-editor/react'

/**
 * CodeEditor — Monaco-based editor with anti-cheat hook attachment.
 *
 * @param {string}    value
 * @param {function}  onChange          (newCode: string) => void
 * @param {string}    language          Monaco language id
 * @param {boolean}   readOnly
 * @param {function}  onEditorMount     (editor, monaco) => void  — attach anti-cheat here
 */
export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  onEditorMount,
}) {
  const editorRef = useRef(null)

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    onEditorMount?.(editor, monaco)
  }, [onEditorMount])

  return (
    <div className="monaco-container h-full w-full overflow-hidden rounded-lg border border-gray-800">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={readOnly ? undefined : onChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize:            14,
          fontFamily:          '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures:       true,
          minimap:             { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap:            'on',
          tabSize:             2,
          readOnly,
          // Disable suggest/autocomplete to keep the interview fair
          quickSuggestions:    !readOnly ? false : undefined,
          suggestOnTriggerCharacters: false,
          parameterHints:      { enabled: false },
        }}
      />
    </div>
  )
}
