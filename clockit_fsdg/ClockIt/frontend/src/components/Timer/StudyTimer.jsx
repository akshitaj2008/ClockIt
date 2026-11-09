import { useState, useEffect, useRef } from 'react';
import { API_BASE } from './config.js';
import { formatDuration } from './utils.js';
import { handleAuthFailure } from '../../services/session.js';

const GOAL_SECONDS = 25 * 60;

function StudyTimer({ activeSubject, activeColor, onSessionSaved }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // The elapsed time is worked out from the real clock, not by counting
  // setInterval ticks. Browsers slow timers down heavily in background tabs,
  // so a tick-counting timer silently loses time whenever the student
  // switches to another tab to study.
  const startedAtRef = useRef(null);     // when the current run started (ms)
  const bankedRef = useRef(0);           // seconds already counted before it

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      const running = (Date.now() - startedAtRef.current) / 1000;
      setSeconds(Math.floor(bankedRef.current + running));
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [isRunning]);

  const handleStart = () => {
    if (!activeSubject) {
      setMessage('Add or pick a subject first, then press Start.');
      return;
    }
    if (isRunning) return;
    setMessage('');
    startedAtRef.current = Date.now();
    setIsRunning(true);
  };

  const pauseClock = () => {
    if (!isRunning) return seconds;
    const total = Math.floor(
      bankedRef.current + (Date.now() - startedAtRef.current) / 1000
    );
    bankedRef.current = total;
    setSeconds(total);
    setIsRunning(false);
    return total;
  };

  const handlePause = () => {
    pauseClock();
  };

  const progress = Math.min(seconds / GOAL_SECONDS, 1);
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - progress);

  const resetClock = () => {
    bankedRef.current = 0;
    startedAtRef.current = null;
    setSeconds(0);
  };

  const handleStop = async () => {
    if (saving) return;

    const total = pauseClock();

    if (total <= 0) {
      return;
    }

    if (!activeSubject) {
      setMessage('Pick a subject before saving this session.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseName: activeSubject,
          duration: total,
          startedAt: new Date(Date.now() - total * 1000).toISOString(),
        }),
      });

      if (handleAuthFailure(res.status)) return;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Keep the time on screen so nothing is lost - the student can retry.
        setMessage(data.message || 'Could not save this session. Please try again.');
        return;
      }

      const saved = await res.json();
      onSessionSaved(saved);
      setMessage('Session saved!');
      resetClock();
    } catch (err) {
      console.error('Save session network error:', err);
      setMessage("Couldn't reach the server. Your time is kept - try Stop & save again.");
    } finally {
      setSaving(false);
    }
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
        <button style={styles.playBtn} onClick={handleStart} disabled={isRunning}>
          {seconds > 0 && !isRunning ? 'Resume' : 'Start'}
        </button>
        <button style={styles.smallBtn} onClick={handlePause} disabled={!isRunning}>Pause</button>
        <button style={styles.smallBtn} onClick={handleStop} disabled={saving || seconds === 0}>
          {saving ? 'Saving...' : 'Stop & save'}
        </button>
      </div>
      {message && (
        <p role="status" style={{ textAlign: 'center', color: '#93AFA0', fontSize: 13, margin: '-20px 0 24px' }}>
          {message}
        </p>
      )}
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