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
      const { data, error } = await supabase.auth.signUp({ email, password })
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
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Life OS - {isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      {message && <div style={{ marginTop: '15px', fontSize: '14px', color: 'blue' }}>{message}</div>}
      
      <button 
        onClick={() => setIsSignUp(!isSignUp)} 
        style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  )
}