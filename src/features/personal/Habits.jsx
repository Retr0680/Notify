import { useState, useEffect } from 'react'
import { Flame, Plus, Check } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true })

    if (habitsData) {
      setHabits(habitsData)
    }

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('completed_date', today)

    if (logsData) {
      setTodayLogs(logsData.map(log => log.habit_id))
    }
  }

  const handleAddHabit = async (e) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return

    setLoading(true)

    const { error } = await supabase
      .from('habits')
      .insert([{ title: newHabitTitle }])

    if (!error) {
      setNewHabitTitle('')
      fetchData()
    }

    setLoading(false)
  }

  const handleToggleHabit = async (habitId) => {
    const isCompletedForToday = todayLogs.includes(habitId)

    if (isCompletedForToday) {
      setTodayLogs(todayLogs.filter(id => id !== habitId))
      await supabase
        .from('habit_logs')
        .delete()
        .match({ habit_id: habitId, completed_date: today })
    } else {
      setTodayLogs([...todayLogs, habitId])
      await supabase
        .from('habit_logs')
        .insert([{ habit_id: habitId, completed_date: today }])
    }
  }

  const calculateProgress = () => {
    if (habits.length === 0) return 0
    return Math.round((todayLogs.length / habits.length) * 100)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Flame />Daily Habits</h2>
        <span className="badge badge-neutral">{calculateProgress()}% done</span>
      </div>

      <div className="progress-track" style={{ marginBottom: '22px' }}>
        <div className="progress-fill success" style={{ width: `${calculateProgress()}%` }} />
      </div>

      <form onSubmit={handleAddHabit} className="inline-form">
        <input
          type="text"
          placeholder="New daily habit..."
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
          className="input"
        />
        <button type="submit" disabled={loading} className="btn btn-primary btn-icon">
          {loading ? <span className="spinner" /> : <Plus size={16} />}
        </button>
      </form>

      <div className="habit-grid">
        {habits.map((habit) => {
          const isDone = todayLogs.includes(habit.id)
          return (
            <button
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`habit-chip${isDone ? ' done' : ''}`}
            >
              <div className="habit-chip-dot">
                {isDone && <Check />}
              </div>
              <span className="habit-chip-label">{habit.title}</span>
            </button>
          )
        })}
      </div>

      {habits.length === 0 && (
        <div className="empty-state">No habits tracked yet.</div>
      )}
    </div>
  )
}
