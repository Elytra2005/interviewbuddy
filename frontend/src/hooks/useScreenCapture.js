import { useRef, useCallback, useState, useEffect } from 'react'
import api from '../utils/api'

export function useScreenCapture({ intervalMs = 30_000, liveIntervalMs = 3_000, socketRef = null } = {}) {
  const streamRef    = useRef(null)
  const videoRef     = useRef(null)
  const dbTimerRef   = useRef(null)
  const liveTimerRef = useRef(null)
  const [sharing,    setSharing]    = useState(false)
  const [frameCount, setFrameCount] = useState(0)   // frames successfully saved to DB

  const capture = useCallback(({ scale = 0.5, quality = 0.5 } = {}) => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null
    const W = Math.max(Math.floor(video.videoWidth  * scale), 320)
    const H = Math.max(Math.floor(video.videoHeight * scale), 180)
    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    canvas.getContext('2d').drawImage(video, 0, 0, W, H)
    return { frame: canvas.toDataURL('image/jpeg', quality), width: W, height: H }
  }, [])

  const saveToDb = useCallback(() => {
    const result = capture({ scale: 0.5, quality: 0.5 })
    if (!result) return
    api.post('/candidate/frame', result)
      .then(() => setFrameCount(n => n + 1))
      .catch(() => {})
  }, [capture])

  const emitLive = useCallback(() => {
    if (!socketRef?.current) return
    const result = capture({ scale: 0.25, quality: 0.35 })
    if (!result) return
    socketRef.current.emit('candidate:screen_frame', { frame: result.frame })
  }, [capture, socketRef])

  const stop = useCallback(() => {
    clearInterval(dbTimerRef.current)
    clearInterval(liveTimerRef.current)
    dbTimerRef.current   = null
    liveTimerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
    setSharing(false)
  }, [])

  const start = useCallback(async () => {
    if (streamRef.current) return true
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1, width: { ideal: 1280 } },
        audio: false,
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true

      // Attach listener BEFORE play() to avoid the loadeddata race condition.
      const ready = Promise.race([
        new Promise(resolve => video.addEventListener('loadeddata', resolve, { once: true })),
        new Promise(resolve => setTimeout(resolve, 2_000)),
      ])
      video.play().catch(() => {})
      await ready

      streamRef.current = stream
      videoRef.current  = video

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stop()
        api.post('/candidate/event', {
          event_type: 'screen_share_stopped',
          severity:   'high',
          details:    { note: 'Candidate ended screen sharing mid-interview' },
        }).catch(() => {})
      })

      setSharing(true)

      // First capture immediately, then on interval.
      saveToDb()
      emitLive()
      dbTimerRef.current   = setInterval(saveToDb, intervalMs)
      liveTimerRef.current = setInterval(emitLive, liveIntervalMs)
      return true
    } catch {
      return false
    }
  }, [saveToDb, emitLive, stop, intervalMs, liveIntervalMs])

  useEffect(() => () => stop(), [stop])

  return { start, stop, sharing, frameCount }
}
