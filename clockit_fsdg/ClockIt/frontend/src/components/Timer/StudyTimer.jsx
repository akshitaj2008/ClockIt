import { useState, useEffect, useRef } from 'react';
import { API_BASE } from './config.js';
import { formatDuration } from './utils.js';

const GOAL_SECONDS = 25 * 60;

function StudyTimer({ activeSubject, activeColor, onSessionSaved }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const progress = Math.min(seconds / GOAL_SECONDS, 1);
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - progress);

  const handleStop = async () => {
  setIsRunning(false);
  if (seconds > 0) {
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseName: activeSubject,
          duration: seconds,
          startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Save session failed:', res.status, errText);
        setSeconds(0);
        return;
      }
      const saved = await res.json();
      onSessionSaved(saved);
    } catch (err) {
      console.error('Save session network error:', err);
    }
  }
  setSeconds(0);
};

  return (
    <div>
      <div style={styles.timerWrap}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(240,237,228,0.06)" strokeWidth="6" />
          <circle
            cx="110" cy="110" r="90" fill="none"
            stroke={activeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 110 110)"
            style={{
              filter: isRunning ? `drop-shadow(0 0 10px ${activeColor}99)` : 'none',
              transition: 'stroke-dashoffset 1s linear, filter 0.3s ease',
            }}
          />
        </svg>
        <div style={styles.center}>
          <span style={styles.digits}>{formatDuration(seconds)}</span>
          <span style={{ ...styles.subject, color: activeColor }}>{activeSubject}</span>
        </div>
      </div>

      <div style={styles.controls}>
        <button style={styles.playBtn} onClick={() => setIsRunning(true)}>Start</button>
        <button style={styles.smallBtn} onClick={() => setIsRunning(false)}>Pause</button>
        <button style={styles.smallBtn} onClick={handleStop}>Stop & save</button>
      </div>
    </div>
  );
}

const styles = {
  timerWrap: { position: 'relative', display: 'flex', justifyContent: 'center', margin: '0 auto 24px' },
  center: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  digits: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 44, fontWeight: 500 },
  subject: { fontSize: 13 },
  controls: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36 },
  playBtn: { background: '#C9A24B', border: 'none', color: '#1A1408', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  smallBtn: { background: 'transparent', border: '1px solid rgba(240,237,228,0.15)', color: '#93AFA0', borderRadius: 8, padding: '12px 20px', fontSize: 14, cursor: 'pointer' },
};

export default StudyTimer;