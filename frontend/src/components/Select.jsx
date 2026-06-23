import { useState, useRef, useEffect, useId } from 'react'

/**
 * Custom Select — replaces native <select> which renders with the OS/browser
 * default white background, breaking dark themes.
 *
 * Props:
 *   value      — current value
 *   onChange   — (value) => void
 *   options    — [{ value, label }]
 *   label      — optional visible label above
 *   placeholder — shown when no value selected
 *   id         — optional HTML id
 */
export default function Select({ value, onChange, options = [], label, placeholder = 'Select…', id }) {
  const [open, setOpen]   = useState(false)
  const containerRef      = useRef(null)
  const generatedId       = useId()
  const selectId          = id ?? generatedId

  const selected = options.find(o => o.value === value)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onMouse = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false) }
    const onKey   = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown',   onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown',   onKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative" id={selectId}>
      {label && (
        <label className="label" onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`input flex items-center justify-between cursor-pointer text-left
          ${open ? 'border-[#00ea64]/30 ring-2 ring-[#00ea64]/15' : ''}`}
      >
        <span className={selected ? 'text-white' : 'text-slate-500'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-[rgba(255,255,255,0.10)]
                     bg-[#111827] shadow-2xl shadow-black/60 overflow-hidden animate-slide-down"
        >
          {options.map(opt => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer
                  transition-colors duration-100
                  ${active
                    ? 'bg-[#00ea64]/8 text-[#00ea64]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {active && (
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#00ea64]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={active ? '' : 'ml-[22px]'}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
