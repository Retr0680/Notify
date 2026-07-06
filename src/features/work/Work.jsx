import ProjectTimer from './ProjectTimer'
import ProjectList from './ProjectList'
import TimeLogs from './TimeLogs'

export default function Work() {
  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Work</span>
        <h1 className="page-title">Work Tracker</h1>
        <p className="page-subtitle">Track time, manage projects, and stay on deadline.</p>
      </div>

      <div className="dashboard-grid grid-2" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start', marginBottom: '22px' }}>
        <ProjectTimer />
        <ProjectList />
      </div>

      <TimeLogs />
    </div>
  )
}
