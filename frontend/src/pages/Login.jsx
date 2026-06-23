import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeftIcon } from '../components/Icons'
import BrandLogo from '../components/BrandLogo'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form.email, form.password)
      navigate(res.user?.is_onboarded === false ? '/onboarding' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-[#020617]">

      <div className="relative w-full max-w-sm space-y-6 animate-fade-in">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors cursor-pointer">
          <ArrowLeftIcon size={13} /> Back to home
        </Link>

        {/* Logo */}
        <div className="space-y-3">
          <BrandLogo size={28} textSize="text-sm" />
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: '#00ea64' }}>
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        <div className="card space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={set('email')}
                className="input"
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={set('password')}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-700 leading-relaxed">
          All monitoring sessions require candidate consent.<br />
          No automated hiring decisions are made.
        </p>
      </div>
    </div>
  )
}
