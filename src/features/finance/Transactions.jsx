import { useState, useEffect } from 'react'
import { Receipt, Plus, X, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTransactions(data)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!description || !amount) return

    setLoading(true)

    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          description,
          amount: parseFloat(amount),
          type
        }
      ])

    if (!error) {
      setDescription('')
      setAmount('')
      fetchTransactions()
    }

    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete transaction?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: '20px' }}><Receipt />Income & Expenses</h2>

      <div className="summary-strip">
        <div className="summary-item">
          <div className="stat-label"><TrendingUp size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Income</div>
          <div className="stat-value income">+${totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-item">
          <div className="stat-label"><TrendingDown size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Expenses</div>
          <div className="stat-value expense">-${totalExpense.toFixed(2)}</div>
        </div>
        <div className="summary-item">
          <div className="stat-label"><Scale size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Net Balance</div>
          <div className="stat-value">${balance.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          style={{ flex: 2 }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="select" style={{ width: 'auto' }}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
          Add
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.description}</td>
                <td style={{ textAlign: 'right', color: t.type === 'income' ? '#4ade80' : '#fb7185', fontWeight: 600 }}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleDelete(t.id)} className="icon-btn">
                    <X />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">No transactions recorded.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
