import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'

export default function Dashboard() {
  const [taskCount, setTaskCount] = useState(0)
  const [habitStats, setHabitStats] = useState({ done: 0, total: 0 })
  const [closestProject, setClosestProject] = useState(null)
  const [netBalance, setNetBalance] = useState(0)
  const [upcomingSubsCount, setUpcomingSubsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)

      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)
      
      setTaskCount(pendingTasks || 0)

      const { data: habits } = await supabase.from('habits').select('id')
      const { data: logs } = await supabase.from('habit_logs').select('habit_id').eq('completed_date', today)
      
      setHabitStats({
        done: logs ? logs.length : 0,
        total: habits ? habits.length : 0
      })

      const { data: projects } = await supabase
        .from('projects')
        .select('name, deadline')
        .eq('status', 'active')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true })
        .limit(1)

      if (projects && projects.length > 0) {
        setClosestProject(projects[0])
      }

      const { data: transactions } = await supabase.from('transactions').select('amount, type')
      if (transactions) {
        const balance = transactions.reduce((sum, t) => {
          const amt = Number(t.amount)
          return t.type === 'income' ? sum + amt : sum - amt
        }, 0)
        setNetBalance(balance)
      }

      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 7)
      const maxDateString = targetDate.toLocaleDateString('en-CA')

      const { count: incomingBills } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('next_billing_date', today)
        .lte('next_billing_date', maxDateString)

      setUpcomingSubsCount(incomingBills || 0)
      setLoading(false)
    }

    fetchDashboardData()
  }, [today])

  if (loading) {
    return <div style={{ color: '#94a3b8', fontSize: '18px' }}>Initializing Command Center...</div>
  }

  const cardStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column'
  }

  const labelStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  }

  const linkStyle = {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'opacity 0.2s'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#f8fafc', fontSize: '32px', fontWeight: '700', marginBottom: '40px' }}>Command Center</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
        
        <div style={cardStyle}>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '24px' }}>Personal HUD</h2>
          <div style={{ marginBottom: '20px' }}>
            <div style={labelStyle}>Pending Tasks</div>
            <div style={{ fontSize: '28px', color: '#f8fafc', fontWeight: '700' }}>{taskCount}</div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <div style={labelStyle}>Habits Today</div>
            <div style={{ fontSize: '28px', color: '#f8fafc', fontWeight: '700' }}>
              {habitStats.done} <span style={{ color: '#64748b', fontSize: '20px' }}>/ {habitStats.total}</span>
            </div>
          </div>
          <Link to="/personal" style={linkStyle}>Open Personal Pillar</Link>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '24px' }}>Work Focus</h2>
          {closestProject ? (
            <div style={{ marginBottom: '30px' }}>
              <div style={labelStyle}>Next Deadline</div>
              <div style={{ fontSize: '24px', color: '#f8fafc', fontWeight: '700', marginTop: '4px' }}>{closestProject.name}</div>
              <div style={{ color: '#ef4444', fontWeight: '600', marginTop: '8px', fontSize: '15px' }}>
                {new Date(closestProject.deadline).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '30px', color: '#64748b', fontStyle: 'italic' }}>
              No active project deadlines.
            </div>
          )}
          <Link to="/work" style={linkStyle}>Open Work Tracker</Link>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '24px' }}>Financial Pulse</h2>
          <div style={{ marginBottom: '20px' }}>
            <div style={labelStyle}>Net Balance</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>
              ${netBalance.toFixed(2)}
            </div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <div style={labelStyle}>Bills Next 7 Days</div>
            <div style={{ fontSize: '28px', color: '#f8fafc', fontWeight: '700' }}>{upcomingSubsCount}</div>
          </div>
          <Link to="/finance" style={linkStyle}>Open Finance Ledger</Link>
        </div>

      </div>
    </div>
  )
}