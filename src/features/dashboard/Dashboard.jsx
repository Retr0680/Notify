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
    return <div>Loading dashboard telemetry...</div>
  }

  return (
    <div>
      <h1>Command Center</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '20px' }}>
        
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Personal HUD</h2>
          <div style={{ margin: '15px 0' }}>
            <strong>Pending Tasks:</strong> {taskCount} tasks remain
          </div>
          <div style={{ margin: '15px 0' }}>
            <strong>Habits Today:</strong> {habitStats.done} / {habitStats.total} completed
          </div>
          <Link to="/personal" style={{ display: 'inline-block', marginTop: '10px' }}>Open Personal Pillar →</Link>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Work Focus</h2>
          {closestProject ? (
            <div style={{ margin: '15px 0' }}>
              <strong>Next Deadline:</strong>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>{closestProject.name}</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                Due: {new Date(closestProject.deadline).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div style={{ margin: '15px 0', color: '#666', fontStyle: 'italic' }}>
              No active project deadlines found.
            </div>
          )}
          <Link to="/work" style={{ display: 'inline-block', marginTop: '10px' }}>Open Work Tracker →</Link>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Financial Pulse</h2>
          <div style={{ margin: '15px 0' }}>
            <strong>Net Balance:</strong>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: netBalance >= 0 ? 'green' : 'red', marginTop: '5px' }}>
              ${netBalance.toFixed(2)}
            </div>
          </div>
          <div style={{ margin: '15px 0' }}>
            <strong>Bills Next 7 Days:</strong> {upcomingSubsCount} subscriptions due
          </div>
          <Link to="/finance" style={{ display: 'inline-block', marginTop: '10px' }}>Open Finance Ledger →</Link>
        </div>

      </div>
    </div>
  )
}