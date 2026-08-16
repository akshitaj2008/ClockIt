import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { buildWeeklyData, buildSubjectTotals } from './utils.js';

function StatsCharts({ sessions, subjects }) {
  const weeklyData = buildWeeklyData(sessions);
  const subjectTotals = buildSubjectTotals(sessions, subjects);
  const weekTotalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  return (
    <div>
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>This week</span>
          <span style={styles.statValue}>{Math.floor(weekTotalMinutes / 60)}h {weekTotalMinutes % 60}m</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Sessions logged</span>
          <span style={styles.statValue}>{sessions.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Subjects tracked</span>
          <span style={styles.statValue}>{subjects.length}</span>
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <span style={styles.chartTitle}>Hours this week</span>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="rgba(240,237,228,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(240,237,228,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#13291F', border: '1px solid rgba(240,237,228,0.1)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#F0EDE4' }} cursor={{ fill: 'rgba(240,237,228,0.04)' }} />
              <Bar dataKey="hours" fill="#C9A24B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <span style={styles.chartTitle}>Time by subject</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={subjectTotals} dataKey="minutes" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {subjectTotals.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#13291F', border: '1px solid rgba(240,237,228,0.1)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {subjectTotals.map((s) => (
                <div key={s.name} style={styles.legendRow}>
                  <span style={{ ...styles.dot, background: s.color }} />
                  <span style={styles.legendText}>{s.name}</span>
                  <span style={styles.legendMins}>{s.minutes}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
  statCard: { background: '#0F241D', borderRadius: 12, padding: '16px 18px' },
  statLabel: { display: 'block', fontSize: 12, color: '#93AFA0', marginBottom: 6 },
  statValue: { fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 },
  chartCard: { background: '#0F241D', borderRadius: 12, padding: '16px 16px 8px' },
  chartTitle: { fontSize: 13, color: '#93AFA0', display: 'block', marginBottom: 4 },
  legendRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },
  legendText: { flex: 1, color: '#F0EDE4' },
  legendMins: { color: '#93AFA0' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
};

export default StatsCharts;