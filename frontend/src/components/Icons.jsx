/**
 * Inline SVG icon set — Lucide-style, 24×24 viewBox.
 * Using SVGs instead of emojis per design system guidelines.
 *
 * Each icon accepts: className, size (default 16)
 */

const icon = (path, extraProps = {}) =>
  function Icon({ className = '', size = 16 }) {
    return (
      <svg
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75}
        strokeLinecap="round" strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...extraProps}
      >
        {path}
      </svg>
    )
  }

export const ClockIcon       = icon(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)
export const UserIcon        = icon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>)
export const UsersIcon       = icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>)
export const BarChartIcon    = icon(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>)
export const MonitorIcon     = icon(<><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>)
export const ClipboardIcon   = icon(<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>)
export const ZapIcon         = icon(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>)
export const AlertIcon       = icon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)
export const TerminalIcon    = icon(<><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>)
export const BotIcon         = icon(<><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></>)
export const EyeIcon         = icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
export const RefreshIcon     = icon(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.46"/></>)
export const CameraIcon      = icon(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>)
export const RadioIcon       = icon(<><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></>)
export const ShieldIcon      = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>)
export const CodeIcon        = icon(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>)
export const PlayIcon        = icon(<><polygon points="5 3 19 12 5 21 5 3"/></>)
export const ListIcon        = icon(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>)
export const KeyboardIcon    = icon(<><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="18" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/></>)
export const MouseIcon       = icon(<><path d="M12 2a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10A10 10 0 0 1 2 12v0A10 10 0 0 1 12 2"/><path d="M12 2v10"/><line x1="12" y1="2" x2="12" y2="12"/></>)
export const SleepIcon       = icon(<><path d="M17 17H3l4-4 4 4 3-3"/><path d="M21 7l-4 4-4-4 3-3"/></>)
export const PlusIcon        = icon(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>)
export const FileTextIcon    = icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>)
export const DownloadIcon    = icon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>)
export const PrintIcon       = icon(<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>)
export const LogOutIcon      = icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>)
export const ChevronRightIcon= icon(<><polyline points="9 18 15 12 9 6"/></>)
export const ChevronDownIcon = icon(<><polyline points="6 9 12 15 18 9"/></>)
export const CheckIcon       = icon(<><polyline points="20 6 9 17 4 12"/></>)
export const XIcon           = icon(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>)
export const LayoutIcon      = icon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>)
export const GlobeIcon       = icon(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>)
export const MailIcon        = icon(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>)
export const ArrowLeftIcon   = icon(<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>)
export const CopyIcon        = icon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>)
export const ScreenShareIcon = icon(<><path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M8 21h8"/><path d="M12 17v4"/><polyline points="17 8 21 4"/><polyline points="17 4 21 4 21 8"/></>)

/** Maps event_type → icon component */
export const EVENT_ICON_MAP = {
  tab_switch:                  RefreshIcon,
  window_blur:                 EyeIcon,
  copy_paste_small:            ClipboardIcon,
  copy_paste_large:            ClipboardIcon,
  copy_paste_xlarge:           AlertIcon,
  large_insertion:             ZapIcon,
  inactivity_burst:            SleepIcon,
  typing_anomaly:              KeyboardIcon,
  devtools_open:               TerminalIcon,
  keyboard_shortcut_devtools:  TerminalIcon,
  cluely_pattern_suspected:    BotIcon,
  frame_timing_anomaly:        MonitorIcon,
  clipboard_api_access:        ClipboardIcon,
  context_menu_blocked:        MouseIcon,
  multiple_displays_detected:  MonitorIcon,
  virtual_camera_detected:     CameraIcon,
  screen_share_change:         RadioIcon,
}
