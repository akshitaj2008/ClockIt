export function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function dateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function groupSessionsByDate(sessions) {
  const groups = {};
  sessions.forEach((s) => {
    const label = dateLabel(s.startedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return groups;
}

export function buildWeeklyData(sessions) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last7.push({ date: d, day: dayNames[d.getDay()], hours: 0 });
  }
  sessions.forEach((s) => {
    const sDate = new Date(s.startedAt);
    const match = last7.find((d) => d.date.toDateString() === sDate.toDateString());
    if (match) match.hours += s.duration / 3600;
  });
  return last7.map((d) => ({ day: d.day, hours: Math.round(d.hours * 10) / 10 }));
}

export function buildSubjectTotals(sessions, subjects) {
  const totals = {};
  sessions.forEach((s) => {
    totals[s.courseName] = (totals[s.courseName] || 0) + Math.round(s.duration / 60);
  });
  return subjects
    .map((subj) => ({ name: subj.name, minutes: totals[subj.name] || 0, color: subj.color }))
    .filter((s) => s.minutes > 0);
}