export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>Daily HUD</h3>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>Active Timer</h3>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>Financial Pulse</h3>
        </div>
      </div>
    </div>
  )
}