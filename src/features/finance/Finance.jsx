import Transactions from './Transactions'
import Subscriptions from './Subscriptions'
import Savings from './Savings'

export default function Finance() {
  return (
    <div>
      <h1>Finance</h1>
      
      <div style={{ marginTop: '20px' }}>
        <Transactions />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
        <div>
          <Subscriptions />
        </div>
        <div>
          <Savings />
        </div>
      </div>
    </div>
  )
}