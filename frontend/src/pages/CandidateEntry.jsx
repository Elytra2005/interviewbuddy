/**
 * CandidateEntry — validates the invite token and shows interview details
 * before forwarding to the consent screen.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function CandidateEntry() {
  const { token } = useParams()
  const navigate  = useNavigate()
  const [data, setData]   = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/candidate/verify/${token}`)
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Invalid or expired invite link'))
  }, [token])

  if (error) {
    return (
      <CentreLayout>
        <div className="card max-w-md text-center space-y-3">
          <span className="text-3xl">⚠️</span>
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-xs text-gray-500">Please contact your interviewer for a new invite link.</p>
        </div>
      </CentreLayout>
    )
  }

  if (!data) {
    return (
      <CentreLayout>
        <p className="text-gray-500 text-sm">Verifying invite…</p>
      </CentreLayout>
    )
  }

  const { candidate, interview } = data

  return (
    <CentreLayout>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <span className="text-4xl text-indigo-400">⬡</span>
          <h1 className="text-2xl font-bold text-white mt-3">Hello, {candidate.name}</h1>
          <p className="text-sm text-gray-400 mt-1">You've been invited to a technical interview.</p>
        </div>

        <div className="card space-y-4">
          <div>
            <p className="label">Interview</p>
            <p className="text-white font-medium">{interview.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label">Duration</p>
              <p className="text-white">{interview.duration_minutes} minutes</p>
            </div>
            <div>
              <p className="label">Language</p>
              <p className="text-white capitalize">{interview.language}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/interview/consent/${token}`)}
          className="btn-primary w-full py-3 text-base"
        >
          Continue to Interview →
        </button>
      </div>
    </CentreLayout>
  )
}

function CentreLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      {children}
    </div>
  )
}
