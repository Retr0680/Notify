import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDeadline, setNewProjectDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setProjects(data)
    }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProjectName) return

    setLoading(true)

    const { error } = await supabase
      .from('projects')
      .insert([
        { 
          name: newProjectName, 
          deadline: newProjectDeadline || null 
        }
      ])

    if (!error) {
      setNewProjectName('')
      setNewProjectDeadline('')
      fetchProjects() // Refresh the list
    } else {
      console.error("Error adding project:", error)
    }
    
    setLoading(false)
  }

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active'
    
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      fetchProjects()
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Projects & Deadlines</h2>
      
      <form onSubmit={handleAddProject} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <input
          type="date"
          value={newProjectDeadline}
          onChange={(e) => setNewProjectDeadline(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((project) => (
          <li 
            key={project.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #eee',
              opacity: project.status === 'completed' ? 0.5 : 1
            }}
          >
            <div>
              <strong style={{ textDecoration: project.status === 'completed' ? 'line-through' : 'none' }}>
                {project.name}
              </strong>
              {project.deadline && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <button onClick={() => handleToggleStatus(project.id, project.status)}>
              Mark {project.status === 'active' ? 'Complete' : 'Active'}
            </button>
          </li>
        ))}
        
        {projects.length === 0 && (
          <li style={{ color: '#666', fontStyle: 'italic' }}>No projects yet. Add one above!</li>
        )}
      </ul>
    </div>
  )
}