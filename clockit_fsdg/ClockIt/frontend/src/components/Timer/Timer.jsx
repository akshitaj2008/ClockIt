import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './config.js';
import SubjectSelector from './SubjectSelector.jsx';
import StudyTimer from './StudyTimer.jsx';
import StatsCharts from './StatsCharts.jsx';
import SessionHistory from './SessionHistory.jsx';
import Navbar from '../Navbar.jsx';

function Timer({ user, onLogout }) {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const authHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    fetch(`${API_BASE}/api/subjects`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        if (data.length > 0) setActiveSubject(data[0].name);
      });

    fetch(`${API_BASE}/api/sessions`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setSessions(data));
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
        onSubjectAdded={(s) => setSubjects([...subjects, s])}
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