import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './config/supabase'
import Layout from './components/layout/Layout'
import Dashboard from './features/dashboard/Dashboard'
import Personal from './features/personal/Personal'
import Work from './features/work/Work'
import Finance from './features/finance/Finance'
import Auth from './features/auth/Auth'

function App() {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitializing(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (initializing) {
    return <div style={{ padding: '50px' }}>Syncing global session configurations...</div>
  }

  if (!session) {
    return <Auth onSession={(s) => setSession(s)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="personal" element={<Personal />} />
          <Route path="work" element={<Work />} />
          <Route path="finance" element={<Finance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App