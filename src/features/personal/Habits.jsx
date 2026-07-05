import { useState, useEffect } from 'react'
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
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Daily Habits</h2>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
          {calculateProgress()}% Done
        </span>
      </div>
      
      <div style={{ background: '#eee', height: '8px', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${calculateProgress()}%`, background: '#333', height: '100%', transition: 'width 0.3s ease' }} />
      </div>

      <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="New daily habit..."
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? '+' : '+'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
        {habits.map((habit) => {
          const isDone = todayLogs.includes(habit.id)
          return (
            <button
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              style={{
                padding: '15px 10px',
                border: `2px solid ${isDone ? '#4CAF50' : '#ddd'}`,
                background: isDone ? '#e8f5e9' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                border: `2px solid ${isDone ? '#4CAF50' : '#ccc'}`,
                background: isDone ? '#4CAF50' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px'
              }}>
                {isDone ? '✓' : ''}
              </div>
              <span style={{ fontSize: '14px', fontWeight: isDone ? 'bold' : 'normal', textAlign: 'center' }}>
                {habit.title}
              </span>
            </button>
          )
        })}
      </div>
      
      {habits.length === 0 && (
        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          No habits tracked yet.
        </div>
      )}
    </div>
  )
}