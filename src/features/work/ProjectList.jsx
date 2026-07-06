import { useState, useEffect } from 'react'
import { FolderKanban, Plus, CalendarDays, RotateCcw, CheckCircle2 } from 'lucide-react'
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
      fetchProjects()
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
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: '20px' }}><FolderKanban />Projects & Deadlines</h2>

      <form onSubmit={handleAddProject} className="inline-form">
        <input
          type="text"
          placeholder="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={newProjectDeadline}
          onChange={(e) => setNewProjectDeadline(e.target.value)}
          className="input"
          style={{ width: 'auto' }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
          Add
        </button>
      </form>

      <div className="list">
        {projects.map((project) => (
          <div key={project.id} className={`list-item${project.status === 'completed' ? ' is-done' : ''}`}>
            <div className="list-item-body">
              <div className="list-item-title">{project.name}</div>
              {project.deadline && (
                <div className="list-item-meta">
                  <CalendarDays size={12} />
                  Deadline {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <button onClick={() => handleToggleStatus(project.id, project.status)} className="btn btn-secondary btn-sm">
              {project.status === 'active' ? <CheckCircle2 size={14} /> : <RotateCcw size={14} />}
              {project.status === 'active' ? 'Complete' : 'Reactivate'}
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="empty-state">No projects yet. Add one above!</div>
        )}
      </div>
    </div>
  )
}
