import { useState, useContext, useMemo } from 'react';
import { AppContext, calculateScore, genId } from '../context/AppContext';
import AppLayout from '../components/layout/AppLayout';
import { ScoreBadge, PriorityBadge, DifficultyBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/Modal';
import Button from '../components/ui/Button';

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const PRIORITIES   = ['Low', 'Medium', 'High'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const SCORE_LABEL  = { 2: 'Chill', 3: 'Easy', 4: 'Moderate', 5: 'Urgent', 6: 'Critical' };
const WEEK_DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL     = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday' };

const PRIORITY_BORDER = {
  Low:    'border-amber-400/20',
  Medium: 'border-orange-400/20',
  High:   'border-red-400/25',
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

/* Returns 'Mon' | 'Tue' | ... for a given ISO date string */
const getDayKey = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  // remap Sun→end: we want Mon-Sun order but JS getDay is 0=Sun
};

const formatDateLabel = (iso) => {
  const d   = new Date(iso + 'T00:00:00');
  const key = getDayKey(iso);
  return `${DAY_FULL[key]} ${d.getDate()}/${d.getMonth() + 1}`;
};

const scoreColor = (score) =>
  score >= 5 ? 'from-red-500 to-orange-400' :
  score >= 4 ? 'from-brand-400 to-purple-400' :
               'from-teal-400 to-emerald-400';

/* ══════════════════════════════════════════════════════════
   AUTO-SCHEDULER  (per-day hour aware)
══════════════════════════════════════════════════════════ */
const autoSchedule = (subjects, weeklyHours) => {
  const sorted = [...subjects].sort((a, b) => b.score - a.score);

  const units = [];
  sorted.forEach(sub => {
    (sub.topics || []).forEach(topic => {
      units.push({
        id:           genId('unit'),
        subjectId:    sub.id,
        subjectName:  sub.subject,
        topic:        topic.name,
        hoursNeeded:  topic.hours,
        priority:     sub.priority,
        difficulty:   sub.difficulty,
        score:        sub.score,
        dailyLimit:   sub.dailyLimit,
      });
    });
  });

  if (!units.length) return [];

  const schedule  = [];
  let dayOffset   = 0;
  let remaining   = [...units];

  while (remaining.length > 0 && dayOffset < 60) {
    const date    = getDateStr(dayOffset);
    const dayKey  = getDayKey(date);
    const budget  = weeklyHours[dayKey] ?? 0;

    if (budget <= 0) { dayOffset++; continue; } // skip days with 0 hours

    let   dayBudget     = budget;
    const dayTasks      = [];
    const subHoursUsed  = {};

    for (let i = 0; i < remaining.length && dayBudget > 0; i++) {
      const unit     = remaining[i];
      const subLimit = unit.dailyLimit ?? 24;
      const used     = subHoursUsed[unit.subjectId] ?? 0;
      const canUse   = Math.min(unit.hoursNeeded, dayBudget, subLimit - used);

      if (canUse <= 0) continue;

      dayTasks.push({ ...unit, allocatedHours: canUse, date });
      subHoursUsed[unit.subjectId] = used + canUse;
      dayBudget -= canUse;

      if (canUse >= unit.hoursNeeded) {
        remaining.splice(i, 1);
        i--;
      } else {
        remaining[i] = { ...unit, hoursNeeded: unit.hoursNeeded - canUse };
      }
    }

    if (dayTasks.length) {
      schedule.push({
        date,
        dayKey,
        dayLabel: formatDateLabel(date),
        tasks:    dayTasks,
        budget,
        usedHours: budget - dayBudget,
      });
    }
    dayOffset++;
  }

  return schedule;
};

/* ══════════════════════════════════════════════════════════
   FIELD COMPONENTS
══════════════════════════════════════════════════════════ */
const inputBase = "w-full h-10 px-3 rounded-xl text-sm font-body bg-surface-850 text-white border border-white/10 hover:border-white/20 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 focus:outline-none placeholder-white/25 transition-all";

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-xs font-medium text-white/55 font-body">{label}</label>
    <div className="relative">
      <select value={value} onChange={onChange}
        className={`${inputBase} appearance-none cursor-pointer pr-8 [&>option]:bg-surface-850 [&>option]:text-white`}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
);

const TextField = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    {label && <label className="text-xs font-medium text-white/55 font-body">{label}</label>}
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} className={inputBase} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   SCORE PREVIEW
══════════════════════════════════════════════════════════ */
const ScorePreview = ({ score }) => {
  const color = scoreColor(score);
  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border min-w-[76px] ${score >= 5 ? 'border-red-400/40' : score >= 4 ? 'border-brand-400/40' : 'border-teal-400/40'} bg-white/3`}>
      <p className="text-2xs font-medium text-white/40 font-body uppercase tracking-widest">Score</p>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-base font-bold text-white font-display`}>{score}</div>
      <p className="text-2xs font-medium text-white/55 font-body">{SCORE_LABEL[score]}</p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TOPIC ROW
══════════════════════════════════════════════════════════ */
const TopicRow = ({ topic, index, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/3 border border-white/8">
    <div className="w-5 h-5 rounded-md bg-brand-400/15 border border-brand-400/25 flex items-center justify-center flex-shrink-0">
      <span className="text-2xs font-bold text-brand-400 font-mono">{index + 1}</span>
    </div>
    <input
      type="text"
      value={topic.name}
      onChange={e => onChange(index, 'name', e.target.value)}
      placeholder={`Topic ${index + 1} name`}
      className="flex-1 h-8 px-2.5 rounded-lg text-xs font-body bg-surface-850 text-white border border-white/10 focus:border-brand-400/50 focus:outline-none placeholder-white/25 transition-all"
    />
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-xs text-white/35 font-body">hrs</span>
      <input
        type="number" min="0.5" max="20" step="0.5"
        value={topic.hours}
        onChange={e => onChange(index, 'hours', parseFloat(e.target.value) || 0.5)}
        className="w-16 h-8 px-2 rounded-lg text-xs font-body bg-surface-850 text-white border border-white/10 focus:border-brand-400/50 focus:outline-none text-center transition-all"
      />
    </div>
    <button onClick={() => onRemove(index)}
      className="w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2 2l8 8M10 2l-8 8"/>
      </svg>
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════
   SUBJECT FORM
══════════════════════════════════════════════════════════ */
const emptyForm = () => ({
  subject: '', priority: 'Medium', difficulty: 'Medium',
  dailyLimit: 2, topics: [{ name: '', hours: 1 }],
});

const SubjectForm = ({ initial, onSave, onCancel, isEdit, existingSubjects }) => {
  const [form,  setForm]  = useState(() => initial
    ? { subject: initial.subject, priority: initial.priority, difficulty: initial.difficulty,
        dailyLimit: initial.dailyLimit, topics: initial.topics?.length ? initial.topics : [{ name: '', hours: 1 }] }
    : emptyForm());
  const [error, setError] = useState('');

  const score = useMemo(() => calculateScore(form.priority, form.difficulty), [form.priority, form.difficulty]);
  const totalTopicHours = form.topics.reduce((s, t) => s + (t.hours || 0), 0);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const addTopic    = () => setForm(p => ({ ...p, topics: [...p.topics, { name: '', hours: 1 }] }));
  const updateTopic = (idx, field, value) =>
    setForm(p => ({ ...p, topics: p.topics.map((t, i) => i === idx ? { ...t, [field]: value } : t) }));
  const removeTopic = (idx) =>
    setForm(p => ({ ...p, topics: p.topics.filter((_, i) => i !== idx) }));

  const handleSave = () => {
    if (!form.subject.trim())                         { setError('Subject name is required'); return; }
    if (form.topics.length === 0)                     { setError('Add at least one topic'); return; }
    if (form.topics.some(t => !t.name.trim()))        { setError('All topic names must be filled'); return; }
    if (form.topics.some(t => t.hours <= 0))          { setError('All topics must have hours > 0'); return; }

    const isDupe = existingSubjects
      .filter(s => !initial || s.id !== initial.id)
      .some(s => s.subject.trim().toLowerCase() === form.subject.trim().toLowerCase());
    if (isDupe) { setError(`"${form.subject}" already exists`); return; }

    setError('');
    onSave({ ...form, score, dailyLimit: Number(form.dailyLimit) });
  };

  return (
    <div className="bg-surface-850 border border-white/10 rounded-2xl overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-400/15 border border-brand-400/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {isEdit ? <path d="M11 2l3 3-8 8H3v-3L11 2z"/> : <><path d="M8 3v10"/><path d="M3 8h10"/></>}
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white font-display">{isEdit ? 'Edit Subject' : 'Add New Subject'}</h3>
        </div>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all text-xs">✕</button>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Row 1 */}
        <div className="flex gap-3 items-end flex-wrap">
          <TextField label="Subject name" value={form.subject} onChange={set('subject')} placeholder="e.g. Mathematics" />
          <SelectField label="Priority"   value={form.priority}   onChange={set('priority')}   options={PRIORITIES}   />
          <SelectField label="Difficulty" value={form.difficulty} onChange={set('difficulty')} options={DIFFICULTIES} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/55 font-body">Max hrs/day</label>
            <input type="number" min="0.5" max="12" step="0.5" value={form.dailyLimit} onChange={set('dailyLimit')}
              className="w-20 h-10 px-3 rounded-xl text-sm font-body bg-surface-850 text-white border border-white/10 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 focus:outline-none transition-all text-center" />
          </div>
          <ScorePreview score={score} />
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80 font-body">Topics</p>
              <p className="text-2xs text-white/35 font-body mt-0.5">
                Total: <span className="text-teal-400 font-semibold">{totalTopicHours}h</span> of study content
              </p>
            </div>
            <button onClick={addTopic}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-medium font-body bg-brand-400/12 hover:bg-brand-400/20 border border-brand-400/25 text-brand-300 transition-all">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>
              Add Topic
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {form.topics.map((topic, idx) => (
              <TopicRow key={idx} topic={topic} index={idx} onChange={updateTopic} onRemove={removeTopic} />
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-brand-400/6 border border-brand-400/15">
          <span className="text-base flex-shrink-0">🐸</span>
          <div>
            <p className="text-xs font-semibold text-brand-300 font-body">Eat That Frog · Auto-Scheduler</p>
            <p className="text-xs text-white/40 font-body mt-0.5 leading-relaxed">
              Score = Priority + Difficulty. Topics are distributed across your weekly calendar respecting each day's hour limit.
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 font-body flex items-center gap-1"><span>⚠</span> {error}</p>}

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost"   size="sm" onClick={onCancel} fullWidth>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} fullWidth>{isEdit ? 'Save Changes' : 'Add Subject'}</Button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WEEKLY HOURS CONFIGURATOR  ← NEW
══════════════════════════════════════════════════════════ */
const WeeklyHoursConfig = ({ weeklyHours, onChange }) => {
  const totalWeek = WEEK_DAYS.reduce((s, d) => s + (weeklyHours[d] ?? 0), 0);
  const maxHours  = Math.max(...WEEK_DAYS.map(d => weeklyHours[d] ?? 0), 1);

  const todayKey = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

  const DAY_COLOR = {
    Mon: { border: 'border-brand-400/30',   bg: 'bg-brand-400/8',    text: 'text-brand-300',   bar: 'bg-brand-400'   },
    Tue: { border: 'border-purple-400/30',  bg: 'bg-purple-400/8',   text: 'text-purple-300',  bar: 'bg-purple-400'  },
    Wed: { border: 'border-teal-400/30',    bg: 'bg-teal-400/8',     text: 'text-teal-300',    bar: 'bg-teal-400'    },
    Thu: { border: 'border-emerald-400/30', bg: 'bg-emerald-400/8',  text: 'text-emerald-300', bar: 'bg-emerald-400' },
    Fri: { border: 'border-amber-400/30',   bg: 'bg-amber-400/8',    text: 'text-amber-300',   bar: 'bg-amber-400'   },
    Sat: { border: 'border-orange-400/30',  bg: 'bg-orange-400/8',   text: 'text-orange-300',  bar: 'bg-orange-400'  },
    Sun: { border: 'border-red-400/30',     bg: 'bg-red-400/8',      text: 'text-red-300',     bar: 'bg-red-400'     },
  };

  const increment = (day) => {
    const current = weeklyHours[day] ?? 0;
    const next    = Math.min(24, parseFloat((current + 0.5).toFixed(1)));
    onChange({ [day]: next });
  };

  const decrement = (day) => {
    const current = weeklyHours[day] ?? 0;
    const next    = Math.max(0, parseFloat((current - 0.5).toFixed(1)));
    onChange({ [day]: next });
  };

  const handleInput = (day, raw) => {
    const val = parseFloat(raw);
    if (!isNaN(val)) onChange({ [day]: Math.min(24, Math.max(0, val)) });
  };

  return (
    <div className="bg-surface-850 border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <h3 className="text-sm font-semibold text-white font-display">📆 Weekly Hour Planner</h3>
          <p className="text-xs text-white/40 font-body mt-0.5">
            Set study hours per day · Total: <span className="text-brand-400 font-semibold">{totalWeek}h</span>
          </p>
        </div>
        <button
          onClick={() => onChange({ Mon:6, Tue:6, Wed:6, Thu:6, Fri:6, Sat:4, Sun:4 })}
          className="px-3 h-7 rounded-lg text-xs font-medium font-body bg-white/4 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
        >
          Reset
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5">

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-16">
          {WEEK_DAYS.map(day => {
            const hrs     = weeklyHours[day] ?? 0;
            const pct     = maxHours > 0 ? hrs / maxHours : 0;
            const isToday = day === todayKey;
            const { bar } = DAY_COLOR[day];
            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-2xs font-mono text-white/50 leading-none">{hrs}h</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${bar} ${isToday ? 'ring-2 ring-white/25' : ''}`}
                  style={{ height: `${Math.max(4, pct * 40)}px`, opacity: hrs === 0 ? 0.2 : 0.75 }}
                />
              </div>
            );
          })}
        </div>

        {/* Day cards */}
        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map(day => {
            const hrs     = weeklyHours[day] ?? 0;
            const isToday = day === todayKey;
            const { border, bg, text } = DAY_COLOR[day];

            return (
              <div key={day}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${border} ${bg} ${isToday ? 'ring-1 ring-white/20' : ''}`}
              >
                {/* Label */}
                <span className={`text-xs font-bold font-display ${text}`}>{day}</span>
                {isToday && (
                  <span className="text-2xs bg-white/15 text-white/70 px-1.5 py-0.5 rounded font-body -mt-1">Today</span>
                )}

                {/* Direct number input */}
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hrs}
                  onChange={e => handleInput(day, e.target.value)}
                  className="w-full h-9 text-center text-lg font-bold font-mono text-white bg-white/8 border border-white/15 rounded-lg focus:outline-none focus:border-white/40 transition-all"
                />
                <span className="text-2xs text-white/35 font-body">hrs</span>

                {/* + / - buttons */}
                <div className="flex flex-col gap-1 w-full">
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); increment(day); }}
                    className={`w-full h-7 rounded-lg text-white font-bold text-base transition-all select-none
                      ${border} border bg-white/8 hover:bg-white/20 active:scale-95`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); decrement(day); }}
                    className={`w-full h-7 rounded-lg text-white font-bold text-base transition-all select-none
                      ${border} border bg-white/8 hover:bg-white/20 active:scale-95`}
                  >
                    −
                  </button>
                </div>

                {hrs === 0 && (
                  <span className="text-2xs text-white/25 font-body">Off</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/35 font-body">Presets:</span>
          {[
            { label: 'Weekdays only', val: { Mon:6, Tue:6, Wed:6, Thu:6, Fri:6, Sat:0, Sun:0 } },
            { label: 'Light weekend', val: { Mon:6, Tue:6, Wed:6, Thu:6, Fri:6, Sat:3, Sun:3 } },
            { label: 'Exam mode',     val: { Mon:8, Tue:8, Wed:8, Thu:8, Fri:8, Sat:6, Sun:6 } },
            { label: 'Balanced',      val: { Mon:5, Tue:5, Wed:5, Thu:5, Fri:5, Sat:4, Sun:3 } },
          ].map(({ label, val }) => (
            <button key={label}
              type="button"
              onClick={() => onChange(val)}
              className="px-3 h-7 rounded-lg text-xs font-medium font-body bg-white/4 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SUBJECT CARD
══════════════════════════════════════════════════════════ */
const SubjectCard = ({ subject, rank, onEdit, onDelete }) => {
  const { subject: name, priority, difficulty, score, dailyLimit, topics = [] } = subject;
  const totalHours = topics.reduce((s, t) => s + (t.hours || 0), 0);
  const color = scoreColor(score);

  return (
    <div className={`relative rounded-2xl bg-surface-850 border ${PRIORITY_BORDER[priority] ?? 'border-white/8'} overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-dark animate-fade-in`}>
      <div className={`h-[2px] w-full bg-gradient-to-r ${color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-6 h-6 rounded-md bg-white/6 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-2xs font-bold text-white/40 font-mono">#{rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white font-display truncate">{name}</h3>
            <p className="text-xs text-white/45 font-body mt-0.5">
              {topics.length} topic{topics.length !== 1 ? 's' : ''} · {totalHours}h total
            </p>
          </div>
          <ScoreBadge score={score} />
        </div>

        {/* Topics preview */}
        <div className="flex flex-col gap-1.5 mb-3">
          {topics.slice(0, 3).map((t, i) => (
            <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6">
              <span className="text-xs text-white/70 font-body truncate flex-1">{t.name}</span>
              <span className="text-2xs text-white/35 font-mono ml-2 flex-shrink-0">{t.hours}h</span>
            </div>
          ))}
          {topics.length > 3 && (
            <p className="text-2xs text-white/30 font-body text-center">+{topics.length - 3} more</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <PriorityBadge priority={priority} />
          <DifficultyBadge difficulty={difficulty} />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-body bg-white/6 border border-white/10 text-white/50">
            ⏱ max {dailyLimit}h/day
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-2xs text-white/30 font-body">Priority score</span>
            <span className="text-2xs font-semibold text-white/55 font-body">{SCORE_LABEL[score]} ({score}/6)</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${(score / 6) * 100}%` }} />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(subject)}
            className="flex-1 h-8 rounded-lg text-xs font-medium font-body bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3L11 2z"/></svg>
            Edit
          </button>
          <button onClick={() => onDelete(subject.id)}
            className="flex-1 h-8 rounded-lg text-xs font-medium font-body bg-red-500/8 hover:bg-red-500/18 border border-red-500/20 hover:border-red-500/40 text-red-400/80 hover:text-red-400 transition-all flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SCHEDULE VIEW
══════════════════════════════════════════════════════════ */
const ScheduleView = ({ schedule, subjects }) => {
  if (!schedule.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center text-2xl mb-3">📅</div>
      <p className="text-sm font-semibold text-white/50 font-display mb-1">No schedule yet</p>
      <p className="text-xs text-white/30 font-body max-w-xs">Add subjects with topics and set your weekly hours to generate your plan.</p>
    </div>
  );

  const totalDays = schedule.length;
  const endDate   = schedule[schedule.length - 1].dayLabel;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-400/6 border border-teal-400/20">
        <span className="text-lg">🗓️</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-teal-300 font-body">Auto-schedule generated</p>
          <p className="text-xs text-white/40 font-body mt-0.5">
            <span className="text-white/70">{totalDays} days</span> · Finishes around <span className="text-white/70">{endDate}</span> · Sorted by Eat That Frog score
          </p>
        </div>
      </div>

      {/* Day cards */}
      {schedule.map(({ date, dayKey, dayLabel, tasks, budget, usedHours }) => {
        const isToday    = date === getDateStr(0);
        const isTomorrow = date === getDateStr(1);
        const label      = isToday ? `Today · ${dayLabel}` : isTomorrow ? `Tomorrow · ${dayLabel}` : dayLabel;
        const fillPct    = budget > 0 ? Math.round((usedHours / budget) * 100) : 0;

        return (
          <div key={date} className={`rounded-2xl border overflow-hidden ${isToday ? 'border-brand-400/40 bg-brand-400/4' : 'border-white/8 bg-surface-850'}`}>
            {/* Day header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${isToday ? 'border-brand-400/20 bg-brand-400/8' : 'border-white/8'}`}>
              <div className="flex items-center gap-2.5">
                {isToday && <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" />}
                <span className={`text-sm font-semibold font-display ${isToday ? 'text-brand-300' : 'text-white/80'}`}>{label}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Usage bar */}
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${fillPct >= 90 ? 'bg-emerald-400' : 'bg-brand-400'}`} style={{ width: `${fillPct}%` }} />
                  </div>
                  <span className="text-xs text-white/40 font-body">{usedHours}h / {budget}h</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-xs font-medium text-white/60 font-body">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 flex flex-col gap-2">
              {tasks.map((task, idx) => {
                const color = scoreColor(task.score);
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-all">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0`}>
                      {task.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/85 font-body truncate">{task.topic}</p>
                      <p className="text-2xs text-white/40 font-body mt-0.5">{task.subjectName}</p>
                    </div>
                    <span className="text-2xs font-mono font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-1 rounded-lg flex-shrink-0">
                      {task.allocatedHours}h
                    </span>
                    <span className={`text-2xs font-medium px-2 py-0.5 rounded-md border flex-shrink-0
                      ${task.priority === 'High'   ? 'bg-red-400/10 border-red-400/20 text-red-300'         :
                        task.priority === 'Medium' ? 'bg-orange-400/10 border-orange-400/20 text-orange-300' :
                                                     'bg-amber-400/10 border-amber-400/20 text-amber-300'}`}>
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   STATS ROW
══════════════════════════════════════════════════════════ */
const Stats = ({ subjects, schedule, weeklyHours }) => {
  const totalTopics = subjects.reduce((s, sub) => s + (sub.topics?.length || 0), 0);
  const totalStudyH = subjects.reduce((s, sub) => s + (sub.topics?.reduce((a, t) => a + (t.hours || 0), 0) || 0), 0);
  const weekTotal   = WEEK_DAYS.reduce((s, d) => s + (weeklyHours[d] ?? 0), 0);
  const planDays    = schedule.length;
  const avgScore    = subjects.length ? (subjects.reduce((s, sub) => s + sub.score, 0) / subjects.length).toFixed(1) : '—';

  const cards = [
    { label: 'Subjects',    value: subjects.length,  icon: '📚', color: 'text-brand-400   bg-brand-400/10   border-brand-400/20'   },
    { label: 'Topics',      value: totalTopics,      icon: '📖', color: 'text-purple-400  bg-purple-400/10  border-purple-400/20'  },
    { label: 'Study hrs',   value: `${totalStudyH}h`,icon: '⏱',  color: 'text-teal-400    bg-teal-400/10    border-teal-400/20'    },
    { label: 'Plan days',   value: planDays || '—',  icon: '📅', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Avg score',   value: avgScore,         icon: '🎯', color: 'text-amber-400   bg-amber-400/10   border-amber-400/20'   },
    { label: 'Week budget', value: `${weekTotal}h`,  icon: '⚡', color: 'text-red-400     bg-red-400/10     border-red-400/20'     },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon, color }) => (
        <div key={label} className="bg-surface-850 border border-white/8 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xs font-medium text-white/40 font-body uppercase tracking-wide leading-tight">{label}</p>
            <span className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs ${color}`}>{icon}</span>
          </div>
          <p className="text-lg font-bold font-display text-white">{value}</p>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PUSH TO TASKS
══════════════════════════════════════════════════════════ */
const pushScheduleToTasks = (schedule, existingTasks, dispatch, addToast) => {
  const manual   = existingTasks.filter(t => !t.autoScheduled);
  const newTasks = [];
  schedule.forEach(({ date, tasks }) => {
    tasks.forEach(unit => {
      newTasks.push({
        id:             genId('task'),
        title:          unit.topic,
        subjectId:      unit.subjectId,
        priority:       unit.priority,
        date,
        status:         'pending',
        autoScheduled:  true,
        allocatedHours: unit.allocatedHours,
      });
    });
  });
  dispatch({ type: 'SET_ALL_TASKS', payload: [...manual, ...newTasks] });
  addToast({ type: 'success', message: `✅ ${newTasks.length} tasks scheduled across ${schedule.length} days!` });
};

/* ══════════════════════════════════════════════════════════
   PLANNER PAGE
══════════════════════════════════════════════════════════ */
export default function Planner() {
  const { state, dispatch } = useContext(AppContext);
  const { subjects = [], tasks = [], settings } = state;

  const weeklyHours = settings?.weeklyHours ?? {
    Mon: 6, Tue: 6, Wed: 6, Thu: 6, Fri: 6, Sat: 4, Sun: 4,
  };

  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('subjects');
  const [filterPri,  setFilterPri]  = useState('All');
  const [sortMode,   setSortMode]   = useState('score');
  const [toastMsg,   setToastMsg]   = useState(null);

  const addToast = ({ type, message }) => {
    setToastMsg({ type, message });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const schedule = useMemo(() => autoSchedule(subjects, weeklyHours), [subjects, weeklyHours]);

  const sorted = useMemo(() => {
    let list = [...subjects];
    if (sortMode === 'score') list.sort((a, b) => b.score - a.score);
    if (sortMode === 'name')  list.sort((a, b) => a.subject.localeCompare(b.subject));
    if (filterPri !== 'All')  list = list.filter(s => s.priority === filterPri);
    return list;
  }, [subjects, sortMode, filterPri]);

  const handleWeeklyChange = (patch) =>
    dispatch({ type: 'UPDATE_WEEKLY_HOURS', payload: patch });

  const handleSave = (formData) => {
    if (editTarget) {
      dispatch({ type: 'UPDATE_SUBJECT', payload: { ...editTarget, ...formData } });
      addToast({ type: 'success', message: '✏️ Subject updated!' });
      setEditTarget(null);
    } else {
      dispatch({
        type:    'ADD_SUBJECT',
        payload: { ...formData, id: genId('sub'), createdAt: new Date().toISOString().split('T')[0] },
      });
      addToast({ type: 'success', message: '📚 Subject added!' });
    }
    setShowForm(false);
  };

  const handleEdit = (sub) => {
    setEditTarget(sub);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout pageTitle="Planner">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Study Planner</h1>
            <p className="text-sm text-white/40 font-body mt-0.5">
              Add subjects + topics → set weekly hours → app builds your <span className="text-brand-400 font-medium">Eat That Frog</span> schedule.
            </p>
          </div>
          <Button
            variant={showForm && !editTarget ? 'secondary' : 'primary'}
            size="md"
            onClick={() => { setShowForm(v => !v); setEditTarget(null); }}
            leftIcon={showForm && !editTarget ? '✕' : '+'}
          >
            {showForm && !editTarget ? 'Cancel' : 'Add Subject'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <SubjectForm
            initial={editTarget ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
            isEdit={!!editTarget}
            existingSubjects={subjects}
          />
        )}

        {/* Stats */}
        <Stats subjects={subjects} schedule={schedule} weeklyHours={weeklyHours} />

        {/* Weekly hours configurator */}
        <WeeklyHoursConfig weeklyHours={weeklyHours} onChange={handleWeeklyChange} />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/4 border border-white/10 rounded-xl p-1 w-fit">
          {[['subjects','📚 Subjects'],['schedule','📅 Auto Schedule']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 h-8 rounded-lg text-xs font-semibold font-body transition-all ${activeTab === tab ? 'bg-brand-400 text-white shadow-glow-brand' : 'text-white/50 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Subjects tab */}
        {activeTab === 'subjects' && (
          <>
            {subjects.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-white/35 font-body mr-1">Filter:</p>
                {['All', ...PRIORITIES].map(p => (
                  <button key={p} onClick={() => setFilterPri(p)}
                    className={`px-3 h-7 rounded-lg text-xs font-medium font-body border transition-all ${filterPri === p ? 'bg-brand-400 border-brand-400 text-white' : 'bg-white/4 border-white/10 text-white/50 hover:text-white hover:bg-white/8'}`}>
                    {p}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5">
                  <p className="text-xs text-white/35 font-body mr-1">Sort:</p>
                  {[['score','🎯 Score'],['name','A–Z']].map(([mode, label]) => (
                    <button key={mode} onClick={() => setSortMode(mode)}
                      className={`px-3 h-7 rounded-lg text-xs font-medium font-body border transition-all ${sortMode === mode ? 'bg-teal-400/20 border-teal-400/40 text-teal-300' : 'bg-white/4 border-white/10 text-white/50 hover:text-white hover:bg-white/8'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((sub, idx) => (
                  <SubjectCard key={sub.id} subject={sub} rank={idx + 1}
                    onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center text-3xl mb-4">📚</div>
                <h3 className="text-base font-semibold text-white/60 font-display mb-1">No subjects yet</h3>
                <p className="text-sm text-white/35 font-body max-w-xs mb-5">Add subjects with topics to get a smart auto-schedule.</p>
                <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>+ Add your first subject</Button>
              </div>
            )}
          </>
        )}

        {/* Schedule tab */}
        {activeTab === 'schedule' && (
          <>
            {schedule.length > 0 && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/40 font-body">Review your plan, then push to Task Manager.</p>
                <Button variant="teal" size="md" onClick={() => pushScheduleToTasks(schedule, tasks, dispatch, addToast)} leftIcon="🚀">
                  Push to Task Manager
                </Button>
              </div>
            )}
            <ScheduleView schedule={schedule} subjects={subjects} />
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-card-dark animate-slide-up
          ${toastMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className="text-sm text-white/90 font-body">{toastMsg.message}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { dispatch({ type: 'DELETE_SUBJECT', payload: deleteId }); setDeleteId(null); }}
        title="Delete Subject"
        message="This removes the subject and all its auto-scheduled tasks. Cannot be undone."
        confirmLabel="Delete Subject"
        danger
      />
    </AppLayout>
  );
}