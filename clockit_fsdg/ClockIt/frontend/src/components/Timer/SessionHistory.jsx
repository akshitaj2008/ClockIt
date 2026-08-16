import { groupSessionsByDate } from './utils.js';

function SessionHistory({ sessions, subjects }) {
  const grouped = groupSessionsByDate(sessions);
  const colorFor = (name) => subjects.find((s) => s.name === name)?.color || '#93AFA0';

  return (
    <div>
      <span style={styles.title}>Past sessions</span>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} style={{ marginBottom: 20 }}>
          <span style={styles.dateLabel}>{date}</span>
          <div style={styles.list}>
            {items.map((s) => (
              <div key={s._id} style={styles.row}>
                <span style={{ ...styles.dot, background: colorFor(s.courseName) }} />
                <span style={styles.subject}>{s.courseName}</span>
                <span style={styles.minutes}>{Math.round(s.duration / 60)} min</span>
                <span style={styles.time}>{new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  title: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 16 },
  dateLabel: { fontSize: 12, color: '#93AFA0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 },
  list: { background: '#0F241D', borderRadius: 12, overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(240,237,228,0.06)', fontSize: 14 },
  subject: { flex: 1, color: '#F0EDE4' },
  minutes: { color: '#C9A24B', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 },
  time: { color: '#93AFA0', fontSize: 12, minWidth: 70, textAlign: 'right' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
};

export default SessionHistory;