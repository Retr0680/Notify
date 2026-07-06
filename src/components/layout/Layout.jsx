import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Briefcase, Wallet, Zap, LogOut } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Command Center', icon: LayoutDashboard },
    { path: '/personal', label: 'Personal HUD', icon: ListChecks },
    { path: '/work', label: 'Work Tracker', icon: Briefcase },
    { path: '/finance', label: 'Financial Ledger', icon: Wallet }
  ]

  const handleLogout = () => {
    supabase.auth.signOut()
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark"><Zap size={18} fill="currentColor" /></div>
          <div className="sidebar-brand-text"><span>Noti</span>fy</div>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => {
            const active = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${active ? ' active' : ''}`}
              >
                <Icon />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
