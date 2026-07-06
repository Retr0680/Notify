import { useState, useEffect } from 'react'
import { CreditCard, Plus, X, AlertTriangle } from 'lucide-react'
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
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h2 className="card-title"><CreditCard />Subscriptions</h2>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-label" style={{ marginBottom: 2 }}>True Monthly</div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>${trueMonthlyCost.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="form-stack">
        <input
          type="text"
          placeholder="Service (e.g. Netflix)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <div className="form-row">
          <input
            type="number"
            step="0.01"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="input"
          />
          <select value={cycle} onChange={(e) => setCycle(e.target.value)} className="select">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <input
          type="date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          className="input"
        />
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
          Add Subscription
        </button>
      </form>

      <div className="list">
        {subs.map((sub) => {
          const upcoming = isUpcoming(sub.next_billing_date)
          return (
            <div key={sub.id} className={`list-item${upcoming ? ' highlight' : ''}`}>
              <div className="list-item-body">
                <div className="list-item-title">{sub.name}</div>
                <div className={`list-item-meta${upcoming ? ' warning' : ''}`}>
                  {upcoming && <AlertTriangle size={12} />}
                  {upcoming ? 'Due soon: ' : 'Next: '}
                  {new Date(sub.next_billing_date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>${Number(sub.cost).toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</div>
              </div>
              <button onClick={() => handleDelete(sub.id)} className="icon-btn">
                <X />
              </button>
            </div>
          )
        })}
        {subs.length === 0 && (
          <div className="empty-state">No subscriptions tracked.</div>
        )}
      </div>
    </div>
  )
}
