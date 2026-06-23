/**
 * Risk Score Calculator
 *
 * Produces a 0–100 score from session events.
 * All scores are SIGNALS — not proof. Human review is required.
 */

const EVENT_WEIGHTS = {
  // Tab / focus
  tab_switch:                  5,
  window_blur:                 3,
  // Copy-paste
  copy_paste_small:            5,
  copy_paste_large:           15,
  copy_paste_xlarge:          25,
  // Code behaviour
  large_insertion:            20,
  inactivity_burst:           20,
  typing_anomaly:             10,
  // Developer tools
  devtools_open:              15,
  keyboard_shortcut_devtools: 12,
  // AI overlay tools (Cluely, etc.)
  cluely_pattern_suspected:   30,   // read-pause-type rhythm (tightened: 2 cycles / 45s)
  typing_velocity_anomaly:    25,   // sustained >9 chars/sec (copies from overlay)
  mouse_idle_during_typing:   15,   // mouse static 15s+ while typing (reading overlay)
  programmatic_insertion:     22,   // large change with no keypress = extension/script
  frame_timing_anomaly:       15,   // overlay app causing frame drops
  clipboard_api_access:       10,
  context_menu_blocked:        3,
  // Screen sharing
  screen_share_stopped:       20,   // candidate ended sharing mid-interview
  screen_share_denied:        10,   // candidate denied sharing request
  // Display / environment
  multiple_displays_detected: 12,
  virtual_camera_detected:    18,
  screen_share_change:        12,
}

// Per-type caps so repeated events can't dominate
const EVENT_CAPS = {
  tab_switch:                 30,
  window_blur:                15,
  devtools_open:              30,
  context_menu_blocked:       10,
  keyboard_shortcut_devtools: 24,
}

/**
 * @param {Array<{event_type: string}>} events
 * @returns {number} 0–100
 */
export function calculateRiskScore(events) {
  let score = 0
  const typeCounts = {}

  for (const event of events) {
    const type  = event.event_type
    typeCounts[type] = (typeCounts[type] || 0) + 1

    const cap         = EVENT_CAPS[type]
    const priorScore  = (typeCounts[type] - 1) * (EVENT_WEIGHTS[type] || 5)
    if (cap && priorScore >= cap) continue

    score += EVENT_WEIGHTS[type] ?? 5
  }

  return Math.min(Math.round(score), 100)
}

export function riskLabel(score) {
  if (score < 20) return { label: 'Low',      color: 'green'  }
  if (score < 50) return { label: 'Medium',   color: 'yellow' }
  if (score < 75) return { label: 'High',     color: 'orange' }
  return              { label: 'Very High', color: 'red'    }
}

/** Post-hoc snapshot analysis — returns synthetic events for burst/insertion detection. */
export function analyseSnapshots(snapshots) {
  const flags = []
  if (snapshots.length < 2) return flags

  for (let i = 1; i < snapshots.length; i++) {
    const prev      = snapshots[i - 1]
    const curr      = snapshots[i]
    const deltaChars = curr.char_count - prev.char_count
    const deltaSec   = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000

    if (deltaSec > 120 && deltaChars > 200) {
      flags.push({
        event_type: 'inactivity_burst',
        severity:   'high',
        details:    { idle_seconds: Math.round(deltaSec), chars_added: deltaChars, note: 'Signal only' },
      })
    }

    const cps = deltaChars / Math.max(deltaSec, 1)
    if (deltaChars > 300 && cps > 100) {
      flags.push({
        event_type: 'large_insertion',
        severity:   'medium',
        details:    { chars_added: deltaChars, chars_per_second: Math.round(cps), note: 'Signal only' },
      })
    }
  }

  return flags
}
