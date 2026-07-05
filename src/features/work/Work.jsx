import ProjectTimer from './ProjectTimer'
import ProjectList from './ProjectList'
import TimeLogs from './TimeLogs'

export default function Work() {
  return (
    <div>
      <h1>Work</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <ProjectTimer />
        </div>
        
        <div>
          <ProjectList />
        </div>
      </div>
      
      <TimeLogs />
      
      <div style={{ marginTop: '40px' }}>
        <h2>Payments</h2>
      </div>
    </div>
  )
}