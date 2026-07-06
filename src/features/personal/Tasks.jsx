import { useState, useEffect } from 'react'
import { ListChecks, Plus, CalendarDays } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending') // 'all', 'pending', 'completed'

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('is_completed', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setLoading(true)

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          title: newTaskTitle,
          due_date: newTaskDueDate || null
        }
      ])

    if (!error) {
      setNewTaskTitle('')
      setNewTaskDueDate('')
      fetchTasks()
    }

    setLoading(false)
  }

  const handleToggleComplete = async (id, currentStatus) => {
    // Optimistic UI update for instant feedback
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id)

    if (error) {
      // Revert if it fails
      fetchTasks()
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed
    if (filter === 'completed') return task.is_completed
    return true
  })

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><ListChecks />Daily Tasks</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="select"
          style={{ width: 'auto' }}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="all">All Tasks</option>
        </select>
      </div>

      <form onSubmit={handleAddTask} className="inline-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          className="input"
          style={{ width: 'auto' }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
          Add
        </button>
      </form>

      <div className="list">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`list-item${task.is_completed ? ' is-done' : ''}`}>
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={() => handleToggleComplete(task.id, task.is_completed)}
              className="checkbox"
            />
            <div className="list-item-body">
              <div className="list-item-title">{task.title}</div>
              {task.due_date && (
                <div className="list-item-meta">
                  <CalendarDays size={12} />
                  Due {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            {filter === 'pending' ? "You're all caught up!" : "No tasks found."}
          </div>
        )}
      </div>
    </div>
  )
}
