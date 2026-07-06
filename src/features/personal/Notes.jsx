import { useState, useEffect } from 'react'
import { StickyNote, Plus, X, Check } from 'lucide-react'
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
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h2 className="card-title"><StickyNote />Notes</h2>
        {!editingNote && (
          <button onClick={handleCreateNew} className="btn btn-secondary btn-sm">
            <Plus size={14} />
            New
          </button>
        )}
      </div>

      {editingNote ? (
        <div className="form-stack" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            style={{ fontWeight: 600 }}
          />
          <textarea
            placeholder="Jot something down..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea"
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditingNote(null)} className="btn btn-ghost btn-sm">
              <X size={14} />
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-success btn-sm">
              {loading ? <span className="spinner" /> : <Check size={14} />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="list">
          {notes.map((note) => (
            <div key={note.id} className="list-item">
              <div className="list-item-body" onClick={() => handleEdit(note)} style={{ cursor: 'pointer' }}>
                <div className="list-item-title">{note.title}</div>
                <div className="list-item-meta">{new Date(note.updated_at).toLocaleDateString()}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="icon-btn">
                <X />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="empty-state">No notes yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
