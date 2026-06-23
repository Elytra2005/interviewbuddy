import { useRef, useEffect, useState, useCallback } from 'react'

/**
 * WebcamCapture — shows a live preview and captures a single JPEG snapshot.
 *
 * @param {function} onCapture  (base64DataUrl: string) => void
 * @param {boolean}  autoCapture  if true, captures automatically after 2s
 */
export default function WebcamCapture({ onCapture, autoCapture = false }) {
  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const [status, setStatus]   = useState('idle')   // idle | requesting | active | captured | denied
  const [preview, setPreview] = useState(null)

  const startCamera = useCallback(async () => {
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('active')
    } catch {
      setStatus('denied')
    }
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width  = videoRef.current.videoWidth  || 320
    canvas.height = videoRef.current.videoHeight || 240
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    setPreview(dataUrl)
    setStatus('captured')
    onCapture?.(dataUrl)

    // Stop the camera stream
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [onCapture])

  useEffect(() => {
    if (status === 'active' && autoCapture) {
      const t = setTimeout(capture, 2000)
      return () => clearTimeout(t)
    }
  }, [status, autoCapture, capture])

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])

  return (
    <div className="flex flex-col items-center gap-4">
      {status === 'captured' && preview ? (
        <div className="space-y-2 text-center">
          <img src={preview} alt="Captured snapshot" className="h-32 w-48 rounded-lg object-cover ring-2 ring-green-500" />
          <p className="text-xs text-green-400">✓ Snapshot captured</p>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-32 w-48 rounded-lg bg-gray-800 object-cover ${status !== 'active' ? 'hidden' : ''}`}
          />
          {status !== 'active' && (
            <div className="flex h-32 w-48 items-center justify-center rounded-lg bg-gray-800 text-gray-500 text-xs">
              {status === 'denied' ? 'Camera denied' : 'Camera off'}
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <button onClick={startCamera} className="btn-primary text-xs">
          Enable Camera
        </button>
      )}
      {status === 'requesting' && (
        <p className="text-xs text-gray-400">Requesting camera access…</p>
      )}
      {status === 'active' && !autoCapture && (
        <button onClick={capture} className="btn-primary text-xs">
          Take Snapshot
        </button>
      )}
      {status === 'denied' && (
        <p className="text-xs text-red-400">Camera access denied. You may continue without it.</p>
      )}
    </div>
  )
}
