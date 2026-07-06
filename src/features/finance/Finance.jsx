import Transactions from './Transactions'
import Subscriptions from './Subscriptions'
import Savings from './Savings'

export default function Finance() {
  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Finance</span>
        <h1 className="page-title">Financial Ledger</h1>
        <p className="page-subtitle">Income, expenses, subscriptions, and savings goals.</p>
      </div>

      <div style={{ marginBottom: '22px' }}>
        <Transactions />
      </div>

      <div className="dashboard-grid grid-2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Subscriptions />
        <Savings />
      </div>
    </div>
  )
}
