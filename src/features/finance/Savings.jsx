import { useState, useEffect } from 'react'
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
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', marginbottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Total Savings</h2>
        <div style={{ textalign: 'right' }}>
          <div style={{ fontsize: '24px', fontweight: 'bold', color: 'blue' }}>${totalSavings.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAddGoal} style={{ display: 'flex', flexdirection: 'column', gap: '10px', marginbottom: '25px' }}>
        <input
          type="text"
          placeholder="Goal Name (e.g. Emergency Fund)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            step="0.01"
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Initial Amount (Optional)"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px', background: '#333', color: 'white', border: 'none', border_radius: '4px' }}>
          {loading ? 'Adding...' : 'Add Savings Goal'}
        </button>
      </form>

      <div style={{ display: 'flex', flexdirection: 'column', gap: '20px' }}>
        {goals.map((goal) => {
          const current = Number(goal.current_amount)
          const target = Number(goal.target_amount)
          const pct = Math.min(Math.round((current / target) * 100), 100) || 0

          return (
            <div key={goal.id} style={{ borderBottom: '1px solid #eee', paddingbottom: '15px' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', marginbottom: '5px' }}>
                <strong>{goal.name}</strong>
                <button 
                  onClick={() => handleDelete(goal.id)}
                  style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontsize: '12px' }}
                >
                  Delete
                </button>
              </div>

              <div style={{ display: 'flex', justifycontent: 'space-between', fontsize: '14px', color: '#666', marginbottom: '5px' }}>
                <span>${current.toFixed(2)} / ${target.toFixed(2)}</span>
                <span>{pct}%</span>
              </div>

              <div style={{ background: '#eee', height: '10px', border_radius: '5px', overflow: 'hidden', marginbottom: '10px' }}>
                <div style={{ width: `${pct}%`, background: 'blue', height: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifycontent: 'flex-end' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={updateAmounts[goal.id] || ''}
                  onChange={(e) => setUpdateAmounts({ ...updateAmounts, [goal.id]: e.target.value })}
                  style={{ padding: '4px', width: '80px' }}
                />
                <button onClick={() => handleAddFunds(goal.id, current)} style={{ padding: '4px 8px' }}>
                  Add Cash
                </button>
              </div>
            </div>
          )
        })}
        {goals.length === 0 && (
          <div style={{ color: '#666', fontstyle: 'italic', textalign: 'center', padding: '10px' }}>
            No savings goals established yet.
          </div>
        )}
      </div>
    </div>
  )
}