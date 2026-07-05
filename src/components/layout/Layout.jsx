import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '250px', padding: '20px', background: '#f4f4f4' }}>
        <h2>Life OS</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '10px 0' }}><Link to="/">Dashboard</Link></li>
          <li style={{ margin: '10px 0' }}><Link to="/personal">Personal</Link></li>
          <li style={{ margin: '10px 0' }}><Link to="/work">Work</Link></li>
          <li style={{ margin: '10px 0' }}><Link to="/finance">Finance</Link></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  )
}