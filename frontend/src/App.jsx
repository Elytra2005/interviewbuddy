import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing         from './pages/Landing'
import Login           from './pages/Login'
import Signup          from './pages/Signup'
import Onboarding      from './pages/Onboarding'
import Dashboard       from './pages/Dashboard'
import CreateInterview from './pages/CreateInterview'
import InterviewDetail from './pages/InterviewDetail'
import SessionView     from './pages/SessionView'
import CandidateEntry  from './pages/CandidateEntry'
import ConsentScreen   from './pages/ConsentScreen'
import CandidateRoom   from './pages/CandidateRoom'
import About           from './pages/About'
import PrivacyPolicy   from './pages/PrivacyPolicy'
import Terms           from './pages/Terms'

/** Root "/" — show landing to guests, dashboard to authed users */
function SmartRoot() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Landing />
  if (user.is_onboarded === false) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

/** Protect interviewer routes — redirect to /login if not authed */
function Protected({ children, requireOnboarded = true }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  if (requireOnboarded && user.is_onboarded === false) return <Navigate to="/onboarding" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <svg className="h-5 w-5 animate-spin text-[#00ea64]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
      </svg>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<SmartRoot />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />
          <Route path="/about"   element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms"   element={<Terms />} />

          {/* Onboarding — auth required, onboarding NOT required */}
          <Route path="/onboarding" element={
            <Protected requireOnboarded={false}><Onboarding /></Protected>
          } />

          {/* Interviewer routes */}
          <Route path="/dashboard"       element={<Protected><Dashboard /></Protected>} />
          <Route path="/interviews/new"  element={<Protected><CreateInterview /></Protected>} />
          <Route path="/interviews/:id"  element={<Protected><InterviewDetail /></Protected>} />
          <Route path="/sessions/:id"    element={<Protected><SessionView /></Protected>} />

          {/* Candidate routes — token-based, no account needed */}
          <Route path="/interview/join/:token"    element={<CandidateEntry />} />
          <Route path="/interview/consent/:token" element={<ConsentScreen />} />
          <Route path="/interview/room"           element={<CandidateRoom />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
