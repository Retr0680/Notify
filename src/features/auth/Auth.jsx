import { useState } from 'react'
import { Zap, Mail, Lock } from 'lucide-react'
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
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark"><Zap size={24} fill="currentColor" /></div>
          <div>
            <div className="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</div>
            <div className="auth-subtitle">
              {isSignUp ? 'Set up Notify to start tracking your life' : 'Sign in to your Command Center'}
            </div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="form-stack" style={{ marginBottom: 0 }}>
          <div className="field">
            <label className="field-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 8, padding: '12px' }}>
            {loading ? <span className="spinner" /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {message && <div className="auth-message">{message}</div>}

        <button className="auth-toggle" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign In' : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  )
}
