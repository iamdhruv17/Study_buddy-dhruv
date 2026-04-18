import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import AppLayout from '../components/layout/AppLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';

/* ── Design tokens ───────────────────────────────────────── */
const C = {
  brand:   '#6C63FF',
  teal:    '#14B8A6',
  emerald: '#10B981',
  amber:   '#F59E0B',
  red:     '#EF4444',
  purple:  '#A78BFA',
  grid:    'rgba(255,255,255,0.06)',
  text:    'rgba(255,255,255,0.45)',
};

const tooltipStyle = {
  backgroundColor: '#16213E',
  border:          '1px solid rgba(255,255,255,0.10)',
  borderRadius:    '10px',
  color:           '#fff',
  fontSize:        '12px',
  fontFamily:      'DM Sans, sans-serif',
};
const tooltipLabelStyle = { color: 'rgba(255,255,255,0.55)', marginBottom: 4 };

/* ── Chart card wrapper ──────────────────────────────────── */
const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-surface-850 border border-white/8 rounded-2xl overflow-hidden ${className}`}>
    <div className="px-5 pt-5 pb-2">
      <h3 className="text-sm font-semibold text-white font-display">{title}</h3>
      {subtitle && <p className="text-xs text-white/40 font-body mt-0.5">{subtitle}</p>}
    </div>
    <div className="px-2 pb-4">{children}</div>
  </div>
);

/* ── Stat pill ───────────────────────────────────────────── */
const StatPill = ({ label, value, color, icon }) => {
  const colorMap = {
    brand:   'text-brand-400   bg-brand-400/10   border-brand-400/20',
    teal:    'text-teal-400    bg-teal-400/10    border-teal-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber:   'text-amber-400   bg-amber-400/10   border-amber-400/20',
    red:     'text-red-400     bg-red-400/10     border-red-400/20',
    purple:  'text-purple-400  bg-purple-400/10  border-purple-400/20',
  };
  return (
    <div className="bg-surface-850 border border-white/8 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-2xs font-medium text-white/40 font-body uppercase tracking-widest">{label}</p>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${colorMap[color] ?? colorMap.brand}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold font-display text-white">{value}</p>
    </div>
  );
};

/* ── Pie label ───────────────────────────────────────────── */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

/* ── Insight card ────────────────────────────────────────── */
const InsightCard = ({ icon, title, body, type = 'info' }) => {
  const typeMap = {
    info:    'bg-brand-400/6   border-brand-400/20   text-brand-300',
    success: 'bg-emerald-400/6 border-emerald-400/20 text-emerald-300',
    warning: 'bg-amber-400/6   border-amber-400/20   text-amber-300',
    danger:  'bg-red-400/6     border-red-400/20     text-red-300',
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${typeMap[type]}`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold font-body">{title}</p>
        <p className="text-xs text-white/45 font-body mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
};

/* ── 7-day heatmap ───────────────────────────────────────── */
const WeekHeatmap = ({ tasks }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso   = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const done  = tasks.filter(t => t.date === iso && t.status === 'done').length;
    return { iso, label, done };
  });
  const maxDone = Math.max(...days.map(d => d.done), 1);

  return (
    <div className="flex gap-2 items-end justify-between px-2">
      {days.map(({ iso, label, done }) => {
        const intensity = done / maxDone;
        const isToday   = iso === new Date().toISOString().split('T')[0];
        return (
          <div key={iso} className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-full flex flex-col items-center gap-1">
              <span className="text-2xs font-mono text-white/50">{done}</span>
              <div className="w-full rounded-lg transition-all duration-500"
                style={{
                  height: `${Math.max(8, intensity * 64)}px`,
                  background: done === 0 ? 'rgba(255,255,255,0.05)' : `rgba(108,99,255,${0.2 + intensity * 0.7})`,
                  border: isToday ? '1px solid rgba(108,99,255,0.6)' : '1px solid transparent',
                }}
              />
            </div>
            <span className={`text-2xs font-body ${isToday ? 'text-brand-400 font-semibold' : 'text-white/35'}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Analytics data hook ─────────────────────────────────── */
const useAnalytics = (tasks, subjects) => useMemo(() => {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === 'done').length;
  const missed  = tasks.filter(t => t.status === 'missed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  const subjectPerf = subjects.map(sub => {
    const subTasks = tasks.filter(t => t.subjectId === sub.id);
    const subDone  = subTasks.filter(t => t.status === 'done').length;
    return {
      name:       sub.subject.length > 10 ? sub.subject.slice(0, 10) + '…' : sub.subject,
      fullName:   sub.subject,
      done:       subDone,
      missed:     subTasks.filter(t => t.status === 'missed').length,
      pending:    subTasks.filter(t => t.status === 'pending').length,
      total:      subTasks.length,
      completion: subTasks.length ? Math.round((subDone / subTasks.length) * 100) : 0,
      score:      sub.score,
    };
  }).sort((a, b) => b.score - a.score);

  const diffMap = {};
  subjects.forEach(s => { diffMap[s.difficulty] = (diffMap[s.difficulty] || 0) + 1; });
  const diffPie = Object.entries(diffMap).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));

  const priMap = {};
  tasks.forEach(t => { priMap[t.priority] = (priMap[t.priority] || 0) + 1; });
  const priorityPie = Object.entries(priMap).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));

  const statusPie = [
    { name: 'Done',    value: done,    color: C.emerald },
    { name: 'Missed',  value: missed,  color: C.red     },
    { name: 'Pending', value: pending, color: C.amber   },
  ].filter(d => d.value > 0);

  const dailyLine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.date === iso);
    return {
      label:  d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      done:   dayTasks.filter(t => t.status === 'done').length,
      missed: dayTasks.filter(t => t.status === 'missed').length,
      total:  dayTasks.length,
    };
  });

  const insights = [];
  if (pct >= 80)       insights.push({ icon: '🏆', title: 'Excellent completion rate!',    body: `You've completed ${pct}% of all tasks. Keep up the momentum!`,                              type: 'success' });
  else if (pct >= 50)  insights.push({ icon: '📈', title: 'Good progress',                  body: `${pct}% completion. Push a bit harder to hit 80%+.`,                                       type: 'info'    });
  else if (total > 0)  insights.push({ icon: '⚠️', title: 'Completion needs attention',     body: `Only ${pct}% completed. Consider reducing your task load or adjusting priorities.`,         type: 'warning' });
  if (missed > done && total > 0)
                       insights.push({ icon: '❌', title: 'High miss rate detected',         body: `You've missed ${missed} tasks vs ${done} completed. Review your daily limits.`,             type: 'danger'  });
  const highScore = subjects.find(s => s.score === 6);
  if (highScore)       insights.push({ icon: '🐸', title: 'Eat That Frog reminder',          body: `"${highScore.subject}" has your highest score (6/6). Tackle it first thing tomorrow.`,     type: 'warning' });
  const todayStr  = new Date().toISOString().split('T')[0];
  const todayDone = tasks.filter(t => t.date === todayStr && t.status === 'done').length;
  if (todayDone > 0)   insights.push({ icon: '⚡', title: `${todayDone} task${todayDone > 1 ? 's' : ''} completed today`, body: 'Great work! Every completed task is a step closer to your goal.', type: 'success' });
  if (insights.length === 0)
                       insights.push({ icon: '🚀', title: 'Start adding tasks',              body: 'Add subjects and tasks to start seeing your analytics.',                                    type: 'info'    });

  return { total, done, missed, pending, pct, subjectPerf, diffPie, priorityPie, statusPie, dailyLine, insights };
}, [tasks, subjects]);

/* ══════════════════════════════════════════════════════════
   ANALYTICS PAGE
══════════════════════════════════════════════════════════ */
export default function Analytics() {
  const { state } = useContext(AppContext);
  const { tasks = [], subjects = [] } = state;
  const data = useAnalytics(tasks, subjects);

  const DIFF_COLORS = { Easy: C.emerald, Medium: C.brand, Hard: C.red };
  const PRI_COLORS  = { Low: C.amber,    Medium: C.teal,  High: C.red  };

  return (
    <AppLayout pageTitle="Analytics">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Analytics Dashboard</h1>
          <p className="text-sm text-white/40 font-body mt-0.5">Visual insights into your study performance and habits.</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatPill label="Completion"  value={`${data.pct}%`}   color="brand"   icon="🎯" />
          <StatPill label="Total tasks" value={data.total}       color="teal"    icon="📋" />
          <StatPill label="Done"        value={data.done}        color="emerald" icon="✅" />
          <StatPill label="Missed"      value={data.missed}      color="red"     icon="❌" />
          <StatPill label="Pending"     value={data.pending}     color="amber"   icon="⏳" />
          <StatPill label="Subjects"    value={subjects.length}  color="purple"  icon="📚" />
        </div>

        {/* Row 1: Bar chart + Status pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard className="lg:col-span-2" title="Subject Performance" subtitle="Tasks completed vs missed per subject (sorted by Eat That Frog score)">
            {data.subjectPerf.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/25 text-sm font-body">No subject data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.subjectPerf} margin={{ top: 8, right: 16, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.text, fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="done"    name="Done"    fill={C.emerald} radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="missed"  name="Missed"  fill={C.red}     radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="pending" name="Pending" fill={C.amber}   radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Task Status" subtitle="Overall distribution">
            {data.statusPie.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/25 text-sm font-body">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.statusPie} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" labelLine={false} label={renderPieLabel}>
                    {data.statusPie.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: C.text, fontSize: 11, fontFamily: 'DM Sans' }}>{v}</span>} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Row 2: Line + Difficulty pie + Priority pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Daily Performance" subtitle="Tasks done vs missed — last 7 days">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.dailyLine} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.text, fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.text, fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Line type="monotone" dataKey="done"   name="Done"   stroke={C.emerald} strokeWidth={2} dot={{ r: 3, fill: C.emerald }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="missed" name="Missed" stroke={C.red}     strokeWidth={2} dot={{ r: 3, fill: C.red }}     activeDot={{ r: 5 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Difficulty Breakdown" subtitle="Subject difficulty distribution">
            {data.diffPie.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-white/25 text-sm font-body">No subjects yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.diffPie} cx="50%" cy="42%" outerRadius={72} paddingAngle={3} dataKey="value" labelLine={false} label={renderPieLabel}>
                    {data.diffPie.map((entry, i) => <Cell key={i} fill={DIFF_COLORS[entry.name] ?? C.brand} stroke="transparent" />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: C.text, fontSize: 11, fontFamily: 'DM Sans' }}>{v}</span>} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Priority Breakdown" subtitle="Task priority distribution">
            {data.priorityPie.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-white/25 text-sm font-body">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.priorityPie} cx="50%" cy="42%" outerRadius={72} paddingAngle={3} dataKey="value" labelLine={false} label={renderPieLabel}>
                    {data.priorityPie.map((entry, i) => <Cell key={i} fill={PRI_COLORS[entry.name] ?? C.brand} stroke="transparent" />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: C.text, fontSize: 11, fontFamily: 'DM Sans' }}>{v}</span>} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Completion rate bars */}
        <ChartCard title="Completion Rate by Subject" subtitle="Percentage of tasks completed per subject">
          {data.subjectPerf.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-white/25 text-sm font-body">No subject data yet</div>
          ) : (
            <div className="flex flex-col gap-3 px-3 py-2">
              {data.subjectPerf.map((sub) => (
                <div key={sub.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/80 font-body">{sub.fullName}</span>
                      <span className={`text-2xs px-1.5 py-0.5 rounded font-mono font-bold
                        ${sub.completion >= 80 ? 'bg-emerald-400/15 text-emerald-400' :
                          sub.completion >= 50 ? 'bg-amber-400/15   text-amber-400'   :
                                                 'bg-red-400/15     text-red-400'}`}>
                        {sub.completion}%
                      </span>
                    </div>
                    <span className="text-2xs text-white/35 font-body">{sub.done}/{sub.total} tasks</span>
                  </div>
                  <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${sub.completion}%`,
                        background: sub.completion >= 80 ? C.emerald : sub.completion >= 50 ? C.amber : C.red,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* 7-day heatmap */}
        <ChartCard title="7-Day Activity Heatmap" subtitle="Tasks completed each day this week">
          <div className="px-3 py-2"><WeekHeatmap tasks={tasks} /></div>
        </ChartCard>

        {/* Score table */}
        {subjects.length > 0 && (
          <ChartCard title="Subject Score Breakdown" subtitle="Eat That Frog priority scores at a glance">
            <div className="px-3 py-2 overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Rank','Subject','Topic','Priority','Difficulty','Score','Daily Hrs'].map(h => (
                      <th key={h} className="text-left text-2xs font-medium text-white/35 uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...subjects].sort((a, b) => b.score - a.score).map((sub, i) => {
                    const scoreColor = sub.score >= 5 ? 'text-red-400' : sub.score >= 4 ? 'text-brand-400' : 'text-teal-400';
                    return (
                      <tr key={sub.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                        <td className="py-3 pr-4"><span className="text-xs font-mono text-white/35">#{i+1}</span></td>
                        <td className="py-3 pr-4"><span className="font-medium text-white/85">{sub.subject}</span></td>
                        <td className="py-3 pr-4"><span className="text-xs text-white/45">{sub.topic}</span></td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium
                            ${sub.priority === 'High'   ? 'bg-red-400/10 border-red-400/20 text-red-300'       :
                              sub.priority === 'Medium' ? 'bg-orange-400/10 border-orange-400/20 text-orange-300' :
                                                          'bg-amber-400/10 border-amber-400/20 text-amber-300'}`}>
                            {sub.priority}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium
                            ${sub.difficulty === 'Hard'   ? 'bg-red-400/10 border-red-400/20 text-red-300'         :
                              sub.difficulty === 'Medium' ? 'bg-blue-400/10 border-blue-400/20 text-blue-300'       :
                                                            'bg-emerald-400/10 border-emerald-400/20 text-emerald-300'}`}>
                            {sub.difficulty}
                          </span>
                        </td>
                        <td className="py-3 pr-4"><span className={`font-bold font-mono ${scoreColor}`}>{sub.score}/6</span></td>
                        <td className="py-3"><span className="text-xs text-white/45 font-mono">{sub.dailyLimit}h</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}

        {/* Smart Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">💡</span>
            <h2 className="text-sm font-semibold text-white font-display">Smart Insights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}