import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks, Flame, Briefcase, AlertTriangle, Wallet, Receipt, ArrowRight } from 'lucide-react'
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
    return (
      <div className="loading-screen" style={{ minHeight: '50vh' }}>
        <span className="spinner" />
        Initializing Command Center...
      </div>
    )
  }

  const habitPct = habitStats.total > 0 ? Math.round((habitStats.done / habitStats.total) * 100) : 0

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Overview</span>
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Here's where things stand across your day.</p>
      </div>

      <div className="dashboard-grid">

        <div className="card dashboard-card">
          <div className="dashboard-icon-badge" style={{ background: 'var(--accent-soft)', color: '#a5a6f6' }}>
            <ListChecks />
          </div>
          <h2 className="card-title" style={{ marginBottom: 22 }}>Personal HUD</h2>

          <div style={{ marginBottom: '18px' }}>
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-value">{taskCount}</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="stat-label">Habits Today</div>
            <div className="stat-value">
              {habitStats.done} <span className="stat-unit">/ {habitStats.total}</span>
            </div>
            {habitStats.total > 0 && (
              <div className="progress-track" style={{ marginTop: 10 }}>
                <div className="progress-fill success" style={{ width: `${habitPct}%` }} />
              </div>
            )}
          </div>

          <Link to="/personal" className="btn btn-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Open Personal Pillar <ArrowRight size={15} />
          </Link>
        </div>

        <div className="card dashboard-card">
          <div className="dashboard-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24' }}>
            <Briefcase />
          </div>
          <h2 className="card-title" style={{ marginBottom: 22 }}>Work Focus</h2>

          {closestProject ? (
            <div style={{ marginBottom: '24px' }}>
              <div className="stat-label">Next Deadline</div>
              <div style={{ fontSize: '21px', color: 'var(--text-primary)', fontWeight: 700, marginTop: '2px' }}>
                {closestProject.name}
              </div>
              <div className="badge badge-danger" style={{ marginTop: '10px' }}>
                <AlertTriangle size={12} />
                {new Date(closestProject.deadline).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ textAlign: 'left', padding: '0 0 24px' }}>
              No active project deadlines.
            </div>
          )}
          <Link to="/work" className="btn btn-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Open Work Tracker <ArrowRight size={15} />
          </Link>
        </div>

        <div className="card dashboard-card">
          <div className="dashboard-icon-badge" style={{ background: 'var(--success-soft)', color: '#4ade80' }}>
            <Wallet />
          </div>
          <h2 className="card-title" style={{ marginBottom: 22 }}>Financial Pulse</h2>

          <div style={{ marginBottom: '18px' }}>
            <div className="stat-label">Net Balance</div>
            <div className="stat-value" style={{ fontSize: '30px', color: netBalance >= 0 ? '#4ade80' : '#fb7185' }}>
              ${netBalance.toFixed(2)}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="stat-label">Bills Next 7 Days</div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {upcomingSubsCount}
              {upcomingSubsCount > 0 && <Receipt size={16} color="var(--text-muted)" />}
            </div>
          </div>

          <Link to="/finance" className="btn btn-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Open Finance Ledger <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  )
}
