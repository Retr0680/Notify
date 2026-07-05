import { useState } from 'react'
import { supabase } from '../../config/supabase'

export default function Auth({ onSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email for confirmation link!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else if (data?.session) onSession(data.session)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', border: '1px solid #334155', borderRadius: '16px', backgroundColor: '#1e293b' }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '30px', fontSize: '24px', textAlign: 'center' }}>
          <span style={{ color: '#3b82f6' }}>Noti</span>fy - {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        {message && <div style={{ marginTop: '20px', fontSize: '14px', color: '#3b82f6', textAlign: 'center' }}>{message}</div>}
        
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}