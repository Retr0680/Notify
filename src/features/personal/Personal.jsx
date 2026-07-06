import Tasks from './Tasks'
import Habits from './Habits'
import Notes from './Notes'

export default function Personal() {
  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Personal</span>
        <h1 className="page-title">Personal HUD</h1>
        <p className="page-subtitle">Tasks, habits, and notes in one place.</p>
      </div>

      <div className="dashboard-grid grid-2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <Tasks />

        <div className="card-stack">
          <Habits />
          <Notes />
        </div>
      </div>
    </div>
  )
}
