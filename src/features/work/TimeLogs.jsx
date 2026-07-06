import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function TimeLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('time_logs')
      .select(`
        id,
        start_time,
        end_time,
        duration_minutes,
        projects (
          name
        )
      `)
      .order('start_time', { ascending: false })
      .limit(20)

    if (!error && data) {
      setLogs(data)
    }
  }

  return (
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: '18px' }}><History />Recent Time Logs</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Date</th>
              <th>Start</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600 }}>{log.projects?.name || 'Unknown'}</td>
                <td>{new Date(log.start_time).toLocaleDateString()}</td>
                <td>{new Date(log.start_time).toLocaleTimeString()}</td>
                <td>
                  {log.duration_minutes !== null
                    ? `${log.duration_minutes} min`
                    : <span className="badge badge-success">In progress</span>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">No time logs recorded yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
