import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

export default function ProjectTimer() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentLogId, setCurrentLogId] = useState(null)

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase.from('projects').select('id, name').eq('status', 'active')
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    let interval = null
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTracking])

  const handleStart = async () => {
    if (!selectedProject) return

    const { data, error } = await supabase
      .from('time_logs')
      .insert([{ project_id: selectedProject }])
      .select()
      .single()

    if (!error && data) {
      setCurrentLogId(data.id)
      setIsTracking(true)
      setElapsedSeconds(0)
    }
  }

  const handleStop = async () => {
    if (!currentLogId) return

    const durationMinutes = Math.floor(elapsedSeconds / 60)

    await supabase
      .from('time_logs')
      .update({ end_time: new Date().toISOString(), duration_minutes: durationMinutes })
      .eq('id', currentLogId)

    setIsTracking(false)
    setCurrentLogId(null)
    setElapsedSeconds(0)
  }

  const formatTime = (totalSeconds) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const s = String(totalSeconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Project Timer</h2>
      
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        disabled={isTracking}
        style={{ padding: '8px', marginBottom: '15px', width: '100%' }}
      >
        <option value="">Select a Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div style={{ fontSize: '48px', fontFamily: 'monospace', margin: '20px 0' }}>
        {formatTime(elapsedSeconds)}
      </div>

      {!isTracking ? (
        <button onClick={handleStart} style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}>
          Start
        </button>
      ) : (
        <button onClick={handleStop} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>
          Stop
        </button>
      )}
    </div>
  )
}