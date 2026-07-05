import { useState, useEffect } from 'react'
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
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Daily Tasks</h2>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="all">All Tasks</option>
        </select>
      </div>
      
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredTasks.map((task) => (
          <li 
            key={task.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '12px 10px',
              borderBottom: '1px solid #eee',
              opacity: task.is_completed ? 0.5 : 1,
              backgroundColor: task.is_completed ? '#f9f9f9' : 'transparent'
            }}
          >
            <input 
              type="checkbox" 
              checked={task.is_completed}
              onChange={() => handleToggleComplete(task.id, task.is_completed)}
              style={{ marginRight: '15px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ 
                textDecoration: task.is_completed ? 'line-through' : 'none',
                fontSize: '16px'
              }}>
                {task.title}
              </span>
              {task.due_date && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </li>
        ))}
        
        {filteredTasks.length === 0 && (
          <li style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            {filter === 'pending' ? "You're all caught up!" : "No tasks found."}
          </li>
        )}
      </ul>
    </div>
  )
}