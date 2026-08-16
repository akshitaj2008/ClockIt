import { useState } from 'react';
import { API_BASE } from './config';

function SubjectSelector({ subjects, activeSubject, setActiveSubject, onSubjectAdded, disabled }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');

  const handleAdd = async () => {
  if (!name.trim()) return;
  try {
    const res = await fetch(`${API_BASE}/api/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Add subject failed:', res.status, errText);
      return;
    }
    const newSubject = await res.json();
    onSubjectAdded(newSubject);
    setActiveSubject(newSubject.name);
    setName('');
    setShowAdd(false);
  } catch (err) {
    console.error('Add subject network error:', err);
  }
};

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.wordmark}>Clock It</span>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add subject</button>
      </div>

      {showAdd && (
        <div style={styles.addRow}>
          <input
            style={styles.input}
            placeholder="Subject name, e.g. Computer Networks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button style={styles.smallBtnGold} onClick={handleAdd}>Add</button>
          <button style={styles.smallBtn} onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      <div style={styles.subjectRow}>
        {subjects.map((s) => (
          <span
            key={s.name}
            onClick={() => !disabled && setActiveSubject(s.name)}
            style={{
              ...styles.pill,
              borderColor: activeSubject === s.name ? s.color : 'rgba(240,237,228,0.12)',
              color: activeSubject === s.name ? s.color : '#93AFA0',
              background: activeSubject === s.name ? `${s.color}1a` : 'transparent',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            <span style={{ ...styles.dot, background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  wordmark: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600 },
  addBtn: { background: 'transparent', border: '1px solid rgba(240,237,228,0.15)', color: '#93AFA0', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  addRow: { display: 'flex', gap: 8, marginBottom: 16 },
  input: { flex: 1, background: '#0F241D', border: '1px solid rgba(240,237,228,0.12)', borderRadius: 8, padding: '10px 12px', color: '#F0EDE4', fontSize: 14, outline: 'none' },
  smallBtnGold: { background: '#C9A24B', border: 'none', color: '#1A1408', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  smallBtn: { background: 'transparent', border: '1px solid rgba(240,237,228,0.15)', color: '#93AFA0', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer' },
  subjectRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid', borderRadius: 20, padding: '6px 14px', fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
};

export default SubjectSelector;