import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Command Center' },
    { path: '/personal', label: 'Personal HUD' },
    { path: '/work', label: 'Work Tracker' },
    { path: '/finance', label: 'Financial Ledger' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <nav style={{ width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#f8fafc', fontSize: '28px', fontWeight: '800', marginBottom: '40px', paddingLeft: '10px', letterSpacing: '-1px' }}>
          <span style={{ color: '#3b82f6' }}>Noti</span>fy
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: active ? '#ffffff' : '#94a3b8',
                  backgroundColor: active ? '#3b82f6' : 'transparent',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s',
                  fontSize: '15px'
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}