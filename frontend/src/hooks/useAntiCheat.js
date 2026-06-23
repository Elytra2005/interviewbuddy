import { useEffect, useRef, useCallback } from 'react'
import api from '../utils/api'

/**
 * useAntiCheat — comprehensive behavioural monitoring hook.
 *
 * Core bug fix: idle detection now uses `lastChangeAt` (gap between content-change
 * events) rather than `lastKeystrokeAt`. Previously, `onKeyDown` always fired before
 * `onDidChangeModelContent`, resetting the idle counter to ~0 on every keystroke and
 * making the Cluely read-pause-type check impossible to trigger via keyboard input.
 *
 * New detections:
 *   - Typing velocity anomaly (>9 chars/sec sustained)
 *   - Mouse idle during typing burst (reading from overlay)
 *   - Programmatic insertion (large change with no recent keypress = extension/script)
 *   - Tightened Cluely: 2 cycles / 45s window / 3s idle / 40 chars
 */
export function useAntiCheat({ monitoringLevel = 'standard', onEvent, socketRef }) {
  // Keystroke timing
  const keystrokeTs     = useRef([])
  const lastKeystrokeAt = useRef(Date.now())
  const lastKeyPressAt  = useRef(Date.now())   // updated on every keydown for source attribution

  // Content-change idle tracking (decoupled from keystroke timing — the key fix)
  const lastChangeAt    = useRef(Date.now())

  const lastCodeLen     = useRef(0)
  const pasteFlag       = useRef(false)
  const devtoolsOpen    = useRef(false)

  // Cluely pattern (tightened)
  const cluelyPauses    = useRef([])

  // Burst velocity tracking
  const burst           = useRef({ startAt: null, chars: 0, lastAt: null })
  const burstTimer      = useRef(null)

  // Mouse inactivity
  const lastMouseMoveAt = useRef(Date.now())

  // rAF timing
  const rafTimings      = useRef([])
  const lastRafTs       = useRef(performance.now())

  // ── Emit helper ─────────────────────────────────────────────────────────────
  const emit = useCallback((event_type, severity, details = {}) => {
    const payload = {
      event_type, severity,
      details: { ...details, note: 'Signal only — requires human review' },
    }
    onEvent?.(payload)
    socketRef?.current?.emit('candidate:event', payload)
    api.post('/candidate/event', payload).catch(() => {})
  }, [onEvent, socketRef])

  // ── Mouse tracking ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (monitoringLevel !== 'full') return
    const onMove = () => { lastMouseMoveAt.current = Date.now() }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [monitoringLevel])

  // ── Tab / window focus ────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) emit('tab_switch', 'medium') }
    const onBlur       = () => emit('window_blur', 'low')
    document.addEventListener('visibilitychange', onVisibility)
    if (monitoringLevel !== 'minimal') window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [monitoringLevel, emit])

  // ── DevTools: window-size heuristic ──────────────────────────────────────
  useEffect(() => {
    if (monitoringLevel === 'minimal') return
    const check = () => {
      const wGap = window.outerWidth  - window.innerWidth
      const hGap = window.outerHeight - window.innerHeight
      const open = wGap > 200 || hGap > 200
      if (open && !devtoolsOpen.current) {
        devtoolsOpen.current = true
        emit('devtools_open', 'high', { gap_px: Math.max(wGap, hGap) })
      } else if (!open) {
        devtoolsOpen.current = false
      }
    }
    const id = setInterval(check, 1500)
    return () => clearInterval(id)
  }, [monitoringLevel, emit])

  // ── DevTools: keyboard shortcut interception ──────────────────────────────
  useEffect(() => {
    if (monitoringLevel === 'minimal') return
    const onKey = (e) => {
      if (e.key === 'F12') {
        e.preventDefault()
        emit('keyboard_shortcut_devtools', 'medium', { key: 'F12' })
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','J','C','i','j','c'].includes(e.key)) {
        e.preventDefault()
        emit('keyboard_shortcut_devtools', 'medium', { key: `Ctrl+Shift+${e.key.toUpperCase()}` })
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) e.preventDefault()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [monitoringLevel, emit])

  // ── Context menu blocking ─────────────────────────────────────────────────
  useEffect(() => {
    if (monitoringLevel === 'minimal') return
    const onContext = (e) => { e.preventDefault(); emit('context_menu_blocked', 'low') }
    document.addEventListener('contextmenu', onContext)
    return () => document.removeEventListener('contextmenu', onContext)
  }, [monitoringLevel, emit])

  // ── Multiple display detection ────────────────────────────────────────────
  useEffect(() => {
    if (monitoringLevel !== 'full') return
    const check = () => {
      if (window.screen.availWidth > window.screen.width + 100) {
        emit('multiple_displays_detected', 'medium', {
          screen_width: window.screen.width,
          avail_width:  window.screen.availWidth,
        })
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [monitoringLevel, emit])

  // ── rAF frame-timing: detect overlay apps ────────────────────────────────
  useEffect(() => {
    if (monitoringLevel !== 'full') return
    let rafId, reported = false
    const tick = (now) => {
      const gap = now - lastRafTs.current
      lastRafTs.current = now
      rafTimings.current.push(gap)
      if (rafTimings.current.length > 60) rafTimings.current.shift()
      if (!reported && rafTimings.current.length >= 30) {
        const avg = rafTimings.current.slice(-30).reduce((a, b) => a + b, 0) / 30
        if (avg > 80) {
          reported = true
          emit('frame_timing_anomaly', 'low', { avg_frame_ms: Math.round(avg) })
          setTimeout(() => { reported = false }, 30_000)
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [monitoringLevel, emit])

  // ── Clipboard API access monitoring ──────────────────────────────────────
  useEffect(() => {
    if (monitoringLevel === 'minimal') return
    const orig = navigator.clipboard?.readText?.bind(navigator.clipboard)
    if (orig) {
      navigator.clipboard.readText = async (...args) => {
        emit('clipboard_api_access', 'medium', { method: 'readText' })
        return orig(...args)
      }
    }
  }, [monitoringLevel, emit])

  // ── Burst velocity evaluator ──────────────────────────────────────────────
  const flushBurst = useCallback(() => {
    const { startAt, chars, lastAt } = burst.current
    burst.current = { startAt: null, chars: 0, lastAt: null }
    if (!startAt || !lastAt || chars < 25) return

    const durationMs = lastAt - startAt
    if (durationMs < 500) return

    const cps         = chars / (durationMs / 1000)
    const now         = Date.now()
    const mouseIdleMs = now - lastMouseMoveAt.current

    // Sustained typing faster than ~108 WPM (9 chars/sec) — hard for code
    if (cps > 9 && chars > 35) {
      emit('typing_velocity_anomaly', 'high', {
        chars_per_second: Math.round(cps * 10) / 10,
        chars_in_burst:   chars,
        duration_ms:      Math.round(durationMs),
        mouse_idle_ms:    mouseIdleMs,
      })
    }

    // Mouse idle 15s+ while actively typing → consistent with reading an overlay
    if (chars > 40 && mouseIdleMs > 15_000) {
      emit('mouse_idle_during_typing', 'medium', {
        mouse_idle_seconds: Math.round(mouseIdleMs / 1000),
        chars_in_burst:     chars,
      })
    }
  }, [emit])

  // ── Keystroke cadence recorder ────────────────────────────────────────────
  const recordKeystroke = useCallback(() => {
    if (monitoringLevel === 'minimal') return
    const now = Date.now()
    lastKeyPressAt.current = now
    const gap = now - lastKeystrokeAt.current
    lastKeystrokeAt.current = now
    keystrokeTs.current.push(gap)
    if (keystrokeTs.current.length > 60) keystrokeTs.current.shift()
  }, [monitoringLevel])

  // ── Monaco editor attachment ──────────────────────────────────────────────
  const attachToEditor = useCallback((editor, monaco) => {
    if (!editor || !monaco) return () => {}
    const D = []

    D.push(editor.onKeyDown(() => recordKeystroke()))

    D.push(editor.onDidChangeModelContent((e) => {
      const newLen = editor.getValue().length
      const delta  = newLen - lastCodeLen.current
      lastCodeLen.current = newLen

      if (monitoringLevel === 'minimal' || delta <= 0) return

      const now               = Date.now()
      const timeSinceLastChange = now - lastChangeAt.current

      // ── Paste detection ───────────────────────────────────────────────
      const isPaste = pasteFlag.current
        || (e.changes.length === 1 && e.changes[0].text.length > 10 && e.changes[0].rangeLength === 0)
      pasteFlag.current = false

      if (isPaste) {
        lastChangeAt.current = now
        if (delta >= 500)      emit('copy_paste_xlarge', 'high',   { chars_pasted: delta })
        else if (delta >= 100) emit('copy_paste_large',  'medium', { chars_pasted: delta })
        else if (delta >= 20)  emit('copy_paste_small',  'low',    { chars_pasted: delta })
        return
      }

      // ── Source attribution: programmatic/extension insertion ──────────
      // Single large change with no keypress in last 500ms → not from keyboard/autocomplete
      if (monitoringLevel === 'full'
          && e.changes.length === 1
          && delta > 40
          && now - lastKeyPressAt.current > 500) {
        lastChangeAt.current = now
        emit('programmatic_insertion', 'high', {
          chars_added:       delta,
          ms_since_last_key: Math.round(now - lastKeyPressAt.current),
        })
        return
      }

      // ── Cluely: content-gap idle ≥3s then ≥40 chars ──────────────────
      // Uses timeSinceLastChange (content gap), NOT keystroke gap.
      // This is the key fix — onKeyDown fires before onDidChangeModelContent,
      // so lastKeystrokeAt was always ~0ms, making the old check unreachable.
      if (monitoringLevel === 'full' && delta >= 40 && timeSinceLastChange > 3_000) {
        lastChangeAt.current = now
        cluelyPauses.current.push(now)
        cluelyPauses.current = cluelyPauses.current.filter(t => now - t < 45_000)

        if (cluelyPauses.current.length >= 2) {
          emit('cluely_pattern_suspected', 'high', {
            occurrences_last_45s: cluelyPauses.current.length,
            chars_added:          delta,
            pause_seconds:        Math.round(timeSinceLastChange / 1000),
            mouse_idle_ms:        now - lastMouseMoveAt.current,
          })
          cluelyPauses.current = []
        } else {
          emit('inactivity_burst', timeSinceLastChange > 30_000 ? 'high' : 'medium', {
            idle_seconds: Math.round(timeSinceLastChange / 1000),
            chars_added:  delta,
          })
        }
        clearTimeout(burstTimer.current)
        burst.current = { startAt: null, chars: 0, lastAt: null }
        return
      }

      lastChangeAt.current = now

      if (monitoringLevel === 'full') {
        // ── Large insertion without idle ──────────────────────────────
        if (delta > 400) emit('large_insertion', 'medium', { chars_added: delta })

        // ── Burst velocity accumulation ───────────────────────────────
        if (delta <= 40) {
          const gapSinceLast = burst.current.lastAt ? now - burst.current.lastAt : Infinity
          if (!burst.current.startAt || gapSinceLast > 2_000) {
            if (burst.current.startAt) flushBurst()
            burst.current = { startAt: now, chars: delta, lastAt: now }
          } else {
            burst.current.chars += delta
            burst.current.lastAt = now
          }
          clearTimeout(burstTimer.current)
          burstTimer.current = setTimeout(flushBurst, 2_000)
        }
      }
    }))

    const dom     = editor.getDomNode()
    const onPaste = () => { pasteFlag.current = true }
    const onDrop  = (e) => {
      if (e.dataTransfer?.types?.includes('text/plain')) {
        emit('copy_paste_large', 'medium', { method: 'drag_drop' })
      }
    }
    dom?.addEventListener('paste', onPaste)
    dom?.addEventListener('drop',  onDrop)

    return () => {
      D.forEach(d => d.dispose())
      dom?.removeEventListener('paste', onPaste)
      dom?.removeEventListener('drop',  onDrop)
      clearTimeout(burstTimer.current)
    }
  }, [monitoringLevel, emit, recordKeystroke, flushBurst])

  return { attachToEditor }
}
