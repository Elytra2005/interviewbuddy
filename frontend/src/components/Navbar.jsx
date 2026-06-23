import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOutIcon } from './Icons'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[#020617]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        {/* Brand */}
        <Link to="/dashboard" className="cursor-pointer">
          <BrandLogo size={26} textSize="text-sm" />
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            {/* Avatar + name */}
            <div className="hidden sm:flex items-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#00ea64] to-emerald-600 flex items-center justify-center text-[10px] font-bold text-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-300">{user.name}</span>
              <span className="badge badge-info">{user.role.replace('_', ' ')}</span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={() => { logout(); navigate('/login') }}
              aria-label="Sign out"
              className="btn-ghost px-2.5 py-1.5 cursor-pointer"
            >
              <LogOutIcon size={15} />
              <span className="hidden sm:inline text-xs">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
