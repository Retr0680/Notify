import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

export default function Subscriptions() {
  const [subs, setSubs] = useState([])
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [cycle, setCycle] = useState('monthly')
  const [nextDate, setNextDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubs()
  }, [])

  async function fetchSubs() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('next_billing_date', { ascending: true })
    
    if (!error && data) {
      setSubs(data)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name || !cost || !nextDate) return

    setLoading(true)

    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          name,
          cost: parseFloat(cost),
          billing_cycle: cycle,
          next_billing_date: nextDate
        }
      ])

    if (!error) {
      setName('')
      setCost('')
      setCycle('monthly')
      setNextDate('')
      fetchSubs()
    }
    
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription?')) return
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (!error) fetchSubs()
  }

  // Calculate the "True" monthly cost (yearly subs / 12)
  const trueMonthlyCost = subs.reduce((sum, sub) => {
    const amount = Number(sub.cost)
    return sum + (sub.billing_cycle === 'yearly' ? amount / 12 : amount)
  }, 0)

  // Helper to check if a bill is coming up in the next 7 days
  const isUpcoming = (dateString) => {
    const billDate = new Date(dateString)
    const today = new Date()
    const diffTime = billDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Subscriptions</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>True Monthly Cost</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>${trueMonthlyCost.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Service (e.g. Netflix)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            step="0.01"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <select value={cycle} onChange={(e) => setCycle(e.target.value)} style={{ padding: '8px' }}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>Next Bill:</label>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Adding...' : 'Add Subscription'}
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {subs.map((sub) => {
          const upcoming = isUpcoming(sub.next_billing_date)
          return (
            <li 
              key={sub.id} 
              style={{ 
                padding: '12px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: upcoming ? '#fff3cd' : 'transparent',
                borderRadius: upcoming ? '4px' : '0'
              }}
            >
              <div>
                <strong style={{ display: 'block' }}>{sub.name}</strong>
                <span style={{ fontSize: '12px', color: upcoming ? '#856404' : '#666' }}>
                  {upcoming ? '⚠️ Due soon: ' : 'Next: '} 
                  {new Date(sub.next_billing_date).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>${Number(sub.cost).toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</div>
                </div>
                <button 
                  onClick={() => handleDelete(sub.id)}
                  style={{ padding: '4px 8px', background: 'transparent', color: 'red', border: 'none', cursor: 'pointer' }}
                >
                  x
                </button>
              </div>
            </li>
          )
        })}
        {subs.length === 0 && (
          <li style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            No subscriptions tracked.
          </li>
        )}
      </ul>
    </div>
  )
}