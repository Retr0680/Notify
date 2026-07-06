import { useState, useEffect } from 'react'
import { PiggyBank, Plus, X, Wallet } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Savings() {
  const [goals, setGoals] = useState([])
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [updateAmounts, setUpdateAmounts] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setGoals(data)
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    if (!name || !targetAmount) return

    setLoading(true)

    const { error } = await supabase
      .from('savings')
      .insert([
        {
          name,
          target_amount: parseFloat(targetAmount),
          current_amount: currentAmount ? parseFloat(currentAmount) : 0
        }
      ])

    if (!error) {
      setName('')
      setTargetAmount('')
      setCurrentAmount('')
      fetchGoals()
    }

    setLoading(false)
  }

  const handleAddFunds = async (id, currentVal) => {
    const amountToAdd = parseFloat(updateAmounts[id])
    if (isNaN(amountToAdd) || amountToAdd <= 0) return

    const newVal = currentVal + amountToAdd

    const { error } = await supabase
      .from('savings')
      .update({ current_amount: newVal })
      .eq('id', id)

    if (!error) {
      setUpdateAmounts({ ...updateAmounts, [id]: '' })
      fetchGoals()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return
    const { error } = await supabase.from('savings').delete().eq('id', id)
    if (!error) fetchGoals()
  }

  const totalSavings = goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><PiggyBank />Total Savings</h2>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#818cf8' }}>${totalSavings.toFixed(2)}</div>
      </div>

      <form onSubmit={handleAddGoal} className="form-stack">
        <input
          type="text"
          placeholder="Goal name (e.g. Emergency Fund)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <div className="form-row">
          <input
            type="number"
            step="0.01"
            placeholder="Target amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="input"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Initial amount (optional)"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
          Add Savings Goal
        </button>
      </form>

      <div className="card-stack" style={{ gap: '20px' }}>
        {goals.map((goal) => {
          const current = Number(goal.current_amount)
          const target = Number(goal.target_amount)
          const pct = Math.min(Math.round((current / target) * 100), 100) || 0

          return (
            <div key={goal.id} style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>{goal.name}</span>
                <button onClick={() => handleDelete(goal.id)} className="icon-btn">
                  <X />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>${current.toFixed(2)} / ${target.toFixed(2)}</span>
                <span>{pct}%</span>
              </div>

              <div className="progress-track" style={{ marginBottom: '12px' }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={updateAmounts[goal.id] || ''}
                  onChange={(e) => setUpdateAmounts({ ...updateAmounts, [goal.id]: e.target.value })}
                  className="input"
                  style={{ width: '100px' }}
                />
                <button onClick={() => handleAddFunds(goal.id, current)} className="btn btn-secondary btn-sm">
                  <Wallet size={13} />
                  Add Cash
                </button>
              </div>
            </div>
          )
        })}
        {goals.length === 0 && (
          <div className="empty-state">No savings goals established yet.</div>
        )}
      </div>
    </div>
  )
}
