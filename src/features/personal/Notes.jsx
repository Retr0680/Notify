import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [editingNote, setEditingNote] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (!error && data) {
      setNotes(data)
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note.id)
    setTitle(note.title)
    setContent(note.content || '')
  }

  const handleCreateNew = () => {
    setEditingNote('new')
    setTitle('')
    setContent('')
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setLoading(true)

    const payload = {
      title,
      content,
      updated_at: new Date().toISOString()
    }

    let error;

    if (editingNote === 'new') {
      const { error: insertError } = await supabase
        .from('notes')
        .insert([payload])
      error = insertError
    } else {
      const { error: updateError } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', editingNote)
      error = updateError
    }

    if (!error) {
      setEditingNote(null)
      fetchNotes()
    } else {
      console.error("Error saving note:", error)
    }
    
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return
    
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) {
      fetchNotes()
      if (editingNote === id) setEditingNote(null)
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Notes</h2>
        {!editingNote && (
          <button onClick={handleCreateNew} style={{ padding: '6px 12px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
            + New
          </button>
        )}
      </div>

      {editingNote ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', fontWeight: 'bold' }}
          />
          <textarea
            placeholder="Jot something down..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ padding: '10px', minHeight: '150px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditingNote(null)} style={{ padding: '8px 16px' }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', background: 'green', color: 'white', border: 'none' }}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notes.map((note) => (
            <li 
              key={note.id} 
              style={{ 
                padding: '12px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div onClick={() => handleEdit(note)} style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{note.title}</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                style={{ padding: '4px 8px', background: '#ffdddd', color: 'red', border: 'none', borderRadius: '4px' }}
              >
                x
              </button>
            </li>
          ))}
          {notes.length === 0 && (
            <li style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              No notes yet.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}