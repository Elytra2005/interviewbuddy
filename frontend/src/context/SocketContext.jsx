import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

/**
 * role: 'interviewer' | 'candidate'
 * token: JWT (interviewer) | session token (candidate)
 */
export function SocketProvider({ role, token, children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const socket = io('/', {
      auth: {
        role,
        ...(role === 'interviewer' ? { token } : { sessionToken: token }),
      },
      transports: ['websocket'],
    })

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('error',      (msg) => console.error('[socket]', msg))

    socketRef.current = socket
    return () => { socket.disconnect(); socketRef.current = null }
  }, [role, token])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
