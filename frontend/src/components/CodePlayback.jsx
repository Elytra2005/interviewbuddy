import { useState, useEffect, useRef } from 'react'
import CodeEditor from './CodeEditor'

/**
 * CodePlayback — scrubable timeline of code snapshots.
 * Interviewers can replay the candidate's editing session.
 */
export default function CodePlayback({ snapshots = [] }) {
  const [index, setIndex]     = useState(snapshots.length - 1)
  const [playing, setPlaying] = useState(false)
  const intervalRef           = useRef(null)

  const current = snapshots[index] ?? null

  useEffect(() => {
    setIndex(snapshots.length - 1)
  }, [snapshots.length])

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setIndex((i) => {
        if (i >= snapshots.length - 1) { setPlaying(false); return i }
        return i + 1
      })
    }, 800)
    return () => clearInterval(intervalRef.current)
  }, [playing, snapshots.length])

  if (!snapshots.length) {
    return <div className="card text-xs text-gray-500 text-center py-8">No snapshots recorded.</div>
  }

  const timestamp = current?.timestamp
    ? new Date(current.timestamp).toLocaleTimeString()
    : '—'

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Code Playback</h3>
        <span className="text-xs text-gray-500">{timestamp}</span>
      </div>

      {/* Scrubber */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="btn-primary px-3 py-1 text-xs"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <input
          type="range"
          min={0}
          max={snapshots.length - 1}
          value={index}
          onChange={(e) => { setPlaying(false); setIndex(Number(e.target.value)) }}
          className="flex-1 accent-indigo-500"
        />
        <span className="text-xs text-gray-500 tabular-nums w-16 text-right">
          {index + 1} / {snapshots.length}
        </span>
      </div>

      {/* Code view — read-only */}
      <div className="h-72">
        <CodeEditor
          value={current?.content ?? ''}
          language="javascript"
          readOnly
        />
      </div>

      <p className="text-xs text-gray-600">
        Snapshot taken at {timestamp} · {current?.char_count ?? 0} chars
      </p>
    </div>
  )
}
