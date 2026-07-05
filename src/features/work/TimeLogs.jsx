import { useState, useEffect } from 'react'
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
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Recent Time Logs</h2>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '10px' }}>Project</th>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Start</th>
            <th style={{ padding: '10px' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{log.projects?.name || 'Unknown'}</td>
              <td style={{ padding: '10px' }}>{new Date(log.start_time).toLocaleDateString()}</td>
              <td style={{ padding: '10px' }}>{new Date(log.start_time).toLocaleTimeString()}</td>
              <td style={{ padding: '10px' }}>
                {log.duration_minutes !== null ? `${log.duration_minutes} min` : 'In progress...'}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '10px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                No time logs recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}