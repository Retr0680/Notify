import Tasks from './Tasks'
import Habits from './Habits'
import Notes from './Notes'

export default function Personal() {
  return (
    <div>
      <h1>Personal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        <div>
          <Tasks />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <Habits />
          <Notes />
        </div>
      </div>
    </div>
  )
}