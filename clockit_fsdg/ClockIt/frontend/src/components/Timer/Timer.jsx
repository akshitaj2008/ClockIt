import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './config.js';
import SubjectSelector from './SubjectSelector.jsx';
import StudyTimer from './StudyTimer.jsx';
import StatsCharts from './StatsCharts.jsx';
import SessionHistory from './SessionHistory.jsx';
import Navbar from '../Navbar.jsx';
import { handleAuthFailure } from '../../services/session.js';

function Timer({ user, onLogout }) {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    // If the session has expired (401/403) the API returns an object, not a
    // list. Treat that as "log in again" instead of crashing the page.
    const toList = (res) => {
      if (handleAuthFailure(res.status)) return [];
      return res.ok ? res.json() : [];
    };

    fetch(`${API_BASE}/api/subjects`, { headers: authHeaders })
      .then(toList)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSubjects(list);
        if (list.length > 0) setActiveSubject(list[0].name);
      })
      .catch((err) => console.error('Error loading subjects:', err));

    fetch(`${API_BASE}/api/sessions`, { headers: authHeaders })
      .then(toList)
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error loading sessions:', err));
  }, []);

  const activeColor = subjects.find((s) => s.name === activeSubject)?.color || '#93AFA0';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <Navbar user={user} onLogout={onLogout} />
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        style={{ background: 'transparent', border: '1px solid rgba(240,237,228,0.15)', color: '#93AFA0', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}
      >
        ← Dashboard
      </button>
      <SubjectSelector
        subjects={subjects}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        onSubjectAdded={(s) =>
          setSubjects((prev) => (prev.some((x) => x._id === s._id) ? prev : [...prev, s]))
        }
      />
      <StudyTimer
        activeSubject={activeSubject}
        activeColor={activeColor}
        onSessionSaved={(session) => setSessions([session, ...sessions])}
      />
      <StatsCharts sessions={sessions} subjects={subjects} />
      <SessionHistory sessions={sessions} subjects={subjects} />
    </div>
  );
}

export default Timer;