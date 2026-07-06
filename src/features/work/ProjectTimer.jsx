import { useState, useEffect } from 'react'
import { Timer, Play, Square } from 'lucide-react'
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
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: '20px' }}><Timer />Project Timer</h2>

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        disabled={isTracking}
        className="select"
      >
        <option value="">Select a project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <div className={`timer-display${isTracking ? ' is-active' : ''}`}>
        {formatTime(elapsedSeconds)}
      </div>

      {!isTracking ? (
        <button onClick={handleStart} disabled={!selectedProject} className="btn btn-success btn-block">
          <Play size={16} fill="currentColor" />
          Start
        </button>
      ) : (
        <button onClick={handleStop} className="btn btn-danger btn-block">
          <span className="pulse-dot" style={{ background: 'white' }} />
          Stop
        </button>
      )}
    </div>
  )
}
