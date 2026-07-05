import { useState, useEffect } from 'react'
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
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Income & Expenses</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#666' }}>Income</div>
          <div style={{ fontSize: '24px', color: 'green' }}>+${totalIncome.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#666' }}>Expenses</div>
          <div style={{ fontSize: '24px', color: 'red' }}>-${totalExpense.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#666' }}>Net Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${balance.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '8px', flex: 2 }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '8px' }}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{new Date(t.date).toLocaleDateString()}</td>
              <td style={{ padding: '10px' }}>{t.description}</td>
              <td style={{ padding: '10px', textAlign: 'right', color: t.type === 'income' ? 'green' : 'red' }}>
                {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleDelete(t.id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>
                  x
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No transactions recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}