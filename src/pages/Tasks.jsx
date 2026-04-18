import { useState, useContext, useMemo } from 'react';
import { AppContext, genId, useToast } from '../context/AppContext';
import AppLayout from '../components/layout/AppLayout';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Modal';
import Button from '../components/ui/Button';

/* ── Constants ───────────────────────────────────────────── */
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES   = ['pending', 'done', 'missed'];

const STATUS_META = {
  pending: { label: 'Pending', icon: '⏳', col: 'border-amber-400/25  bg-amber-400/4',   head: 'text-amber-300'   },
  done:    { label: 'Done',    icon: '✅', col: 'border-emerald-400/25 bg-emerald-400/4', head: 'text-emerald-300' },
  missed:  { label: 'Missed',  icon: '❌', col: 'border-red-400/25     bg-red-400/4',     head: 'text-red-300'     },
};

const today     = () => new Date().toISOString().split('T')[0];
const yesterday = () => new Date(Date.now() - 86400000).toISOString().split('T')[0];

const fmt = (dateStr) => {
  if (!dateStr) return '';
  const t = today(), y = yesterday();
  if (dateStr === t) return 'Today';
  if (dateStr === y) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/* ── Shared styles ───────────────────────────────────────── */
const inputCls  = "w-full h-10 px-3 rounded-xl text-sm font-body bg-surface-850 text-white hover:bg-surface-800 border border-white/10 hover:border-white/20 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 focus:outline-none placeholder-white/25 transition-all";
const selectCls = "w-full h-10 pl-3 pr-8 rounded-xl text-sm font-body bg-surface-850 text-white hover:bg-surface-800 border border-white/10 hover:border-white/20 focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 focus:outline-none appearance-none cursor-pointer transition-all [&>option]:bg-surface-850 [&>option]:text-white";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    {label && <label className="text-xs font-medium text-white/55 font-body">{label}</label>}
    {children}
  </div>
);

const ChevronDown = () => (
  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Add / Edit Task form ────────────────────────────────── */
const emptyTask = () => ({ title: '', subjectId: '', priority: 'Medium', date: today(), status: 'pending' });

const TaskForm = ({ initial, subjects, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState(initial
    ? { title: initial.title, subjectId: initial.subjectId, priority: initial.priority, date: initial.date, status: initial.status }
    : emptyTask());
  const [error, setError] = useState('');
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.title.trim()) { setError('Task title is required'); return; }
    setError('');
    onSave(form);
  };

  return (
    <div className="bg-surface-850 border border-white/10 rounded-2xl overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {isEdit ? <path d="M11 2l3 3-8 8H3v-3L11 2z"/> : <><path d="M8 3v10"/><path d="M3 8h10"/></>}
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white font-display">{isEdit ? 'Edit Task' : 'Add New Task'}</h3>
        </div>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all text-xs">✕</button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <Field label="Task title">
          <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Solve 10 integral problems" className={inputCls} />
        </Field>

        <div className="flex gap-3 flex-wrap">
          <Field label="Subject (optional)">
            <div className="relative">
              <select value={form.subjectId} onChange={set('subjectId')} className={selectCls}>
                <option value="">— No subject —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject} · {s.topic}</option>)}
              </select>
              <ChevronDown />
            </div>
          </Field>

          <Field label="Priority">
            <div className="relative">
              <select value={form.priority} onChange={set('priority')} className={`${selectCls} max-w-[140px]`}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown />
            </div>
          </Field>

          <Field label="Due date">
            <input type="date" value={form.date} onChange={set('date')}
              className={`${inputCls} max-w-[160px] [color-scheme:dark]`} />
          </Field>

          {isEdit && (
            <Field label="Status">
              <div className="relative">
                <select value={form.status} onChange={set('status')} className={`${selectCls} max-w-[140px]`}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
                <ChevronDown />
              </div>
            </Field>
          )}
        </div>

        {error && <p className="text-xs text-red-400 font-body flex items-center gap-1"><span>⚠</span> {error}</p>}

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost"   size="sm" onClick={onCancel} fullWidth>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} fullWidth>{isEdit ? 'Save Changes' : 'Add Task'}</Button>
        </div>
      </div>
    </div>
  );
};

/* ── Task card ───────────────────────────────────────────── */
const TaskCard = ({ task, subjectName, onDone, onMissed, onPending, onEdit, onDelete }) => {
  const { id, title, priority, date, status } = task;
  const isDone    = status === 'done';
  const isMissed  = status === 'missed';
  const isPending = status === 'pending';

  return (
    <div className={`group relative rounded-xl border bg-surface-850 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-dark animate-fade-in
      ${isDone ? 'border-emerald-400/15 opacity-80' : isMissed ? 'border-red-400/15' : 'border-white/8'}`}>
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${isDone ? 'bg-emerald-400' : isMissed ? 'bg-red-400' : 'bg-brand-400'}`} />

      <div className="pl-3">
        <div className="flex items-start gap-2 mb-2.5">
          <p className={`text-sm font-medium font-body flex-1 leading-snug ${isDone ? 'line-through text-white/40' : 'text-white/90'}`}>{title}</p>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <PriorityBadge priority={priority} />
          {subjectName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-body bg-brand-400/8 border border-brand-400/15 text-brand-300/80">
              📚 {subjectName}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-body bg-white/4 border border-white/8 text-white/40">
            📅 {fmt(date)}
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {!isDone   && <button onClick={() => onDone(id)}    className="h-7 px-2.5 rounded-lg text-xs font-medium font-body bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all flex items-center gap-1">✓ Done</button>}
          {!isMissed && <button onClick={() => onMissed(id)}  className="h-7 px-2.5 rounded-lg text-xs font-medium font-body bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all flex items-center gap-1">✕ Missed</button>}
          {!isPending && <button onClick={() => onPending(id)} className="h-7 px-2.5 rounded-lg text-xs font-medium font-body bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 transition-all flex items-center gap-1">↺ Pending</button>}
          <div className="flex-1" />
          <button onClick={() => onEdit(task)} className="h-7 px-2.5 rounded-lg text-xs font-medium font-body bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 2l3 3-8 8H3v-3L11 2z"/></svg>
            Edit
          </button>
          <button onClick={() => onDelete(id)} className="h-7 px-2.5 rounded-lg text-xs font-medium font-body bg-red-500/8 hover:bg-red-500/18 border border-red-500/15 hover:border-red-500/35 text-red-400/70 hover:text-red-400 transition-all flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Kanban column ───────────────────────────────────────── */
const Column = ({ status, tasks, subjects, onDone, onMissed, onPending, onEdit, onDelete }) => {
  const meta = STATUS_META[status];
  return (
    <div className={`flex flex-col rounded-2xl border ${meta.col} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-sm">{meta.icon}</span>
          <span className={`text-sm font-semibold font-display ${meta.head}`}>{meta.label}</span>
        </div>
        <span className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold font-mono text-white/60">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2.5 p-3 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 opacity-40">
            <p className="text-xs text-white/40 font-body">No {meta.label.toLowerCase()} tasks</p>
          </div>
        ) : tasks.map(task => (
          <TaskCard key={task.id} task={task}
            subjectName={subjects.find(s => s.id === task.subjectId)?.subject ?? ''}
            onDone={onDone} onMissed={onMissed} onPending={onPending} onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Summary stats ───────────────────────────────────────── */
const TaskStats = ({ tasks }) => {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === 'done').length;
  const missed  = tasks.filter(t => t.status === 'missed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-surface-850 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-white/45 font-body uppercase tracking-wide mb-1">Overall completion</p>
          <p className="text-3xl font-bold font-display text-white">{pct}<span className="text-lg text-white/40">%</span></p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-emerald-400 font-body">{done} done</span>
          <span className="text-xs text-amber-400 font-body">{pending} pending</span>
          <span className="text-xs text-red-400 font-body">{missed} missed</span>
        </div>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 bg-white/6">
        {done    > 0 && <div className="bg-emerald-400 transition-all duration-700" style={{ width: `${(done    / total) * 100}%` }} />}
        {pending > 0 && <div className="bg-amber-400  transition-all duration-700" style={{ width: `${(pending / total) * 100}%` }} />}
        {missed  > 0 && <div className="bg-red-400    transition-all duration-700" style={{ width: `${(missed  / total) * 100}%` }} />}
      </div>
      <div className="flex items-center gap-4 mt-2.5">
        {[['bg-emerald-400','Done'],['bg-amber-400','Pending'],['bg-red-400','Missed']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${c}`} />
            <span className="text-2xs text-white/40 font-body">{l}</span>
          </div>
        ))}
        <span className="ml-auto text-2xs text-white/30 font-body">{total} total</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TASKS PAGE
══════════════════════════════════════════════════════════ */
export default function Tasks() {
  const { state, dispatch } = useContext(AppContext);
  const { tasks = [], subjects = [] } = state;
  const { toasts, addToast, removeToast } = useToast();

  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [filterSub,   setFilterSub]   = useState('All');
  const [filterPri,   setFilterPri]   = useState('All');
  const [dateFilter,  setDateFilter]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode,    setViewMode]    = useState('kanban');

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filterSub !== 'All')       list = list.filter(t => t.subjectId === filterSub);
    if (filterPri !== 'All')       list = list.filter(t => t.priority  === filterPri);
    if (dateFilter === 'today')     list = list.filter(t => t.date === today());
    if (dateFilter === 'yesterday') list = list.filter(t => t.date === yesterday());
    if (searchQuery.trim())         list = list.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [tasks, filterSub, filterPri, dateFilter, searchQuery]);

  const byStatus = (s) => filtered.filter(t => t.status === s);

  const setStatus = (id, status) => {
    dispatch({ type: 'SET_TASK_STATUS', payload: { id, status } });
    const labels = { done: '✅ Marked as done!', missed: '❌ Marked as missed.', pending: '↺ Reset to pending.' };
    addToast({ type: status === 'done' ? 'success' : status === 'missed' ? 'error' : 'info', message: labels[status] });
  };

  const handleSave = (formData) => {
    if (editTarget) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...editTarget, ...formData } });
      addToast({ type: 'success', message: '✏️ Task updated successfully!' });
      setEditTarget(null);
    } else {
      dispatch({ type: 'ADD_TASK', payload: { ...formData, id: genId('task') } });
      addToast({ type: 'success', message: '➕ Task added!' });
    }
    setShowForm(false);
  };

  const handleEdit = (task) => {
    setEditTarget(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: deleteId });
    addToast({ type: 'error', message: '🗑️ Task deleted.' });
    setDeleteId(null);
  };

  const hasActiveFilters = filterSub !== 'All' || filterPri !== 'All' || dateFilter !== 'all' || searchQuery.trim();

  return (
    <AppLayout pageTitle="Tasks">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Task Manager</h1>
            <p className="text-sm text-white/40 font-body mt-0.5">Track, complete, and review your daily study tasks.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/4 border border-white/10 rounded-xl p-1 gap-1">
              {[['kanban','⠿ Kanban'],['list','≡ List']].map(([mode, label]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-3 h-7 rounded-lg text-xs font-medium font-body transition-all ${viewMode === mode ? 'bg-white/12 text-white' : 'text-white/40 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
            <Button variant={showForm && !editTarget ? 'secondary' : 'primary'} size="md"
              onClick={() => { setShowForm(v => !v); setEditTarget(null); }}
              leftIcon={showForm && !editTarget ? '✕' : '+'}>
              {showForm && !editTarget ? 'Cancel' : 'Add Task'}
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <TaskForm initial={editTarget ?? undefined} subjects={subjects} onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }} isEdit={!!editTarget} />
        )}

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm font-body bg-white/4 border border-white/8 hover:border-white/16 focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/15 focus:outline-none text-white placeholder-white/25 transition-all" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[['all','All dates'],['today','Today'],['yesterday','Yesterday']].map(([val, label]) => (
              <button key={val} onClick={() => setDateFilter(val)}
                className={`px-3 h-7 rounded-lg text-xs font-medium font-body border transition-all ${dateFilter === val ? 'bg-brand-400 border-brand-400 text-white' : 'bg-white/4 border-white/10 text-white/50 hover:text-white hover:bg-white/8'}`}>
                {label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            {['All', ...PRIORITIES].map(p => (
              <button key={p} onClick={() => setFilterPri(p)}
                className={`px-3 h-7 rounded-lg text-xs font-medium font-body border transition-all ${filterPri === p && p !== 'All' ? 'bg-brand-400 border-brand-400 text-white' : filterPri === p ? 'bg-white/10 border-white/20 text-white' : 'bg-white/4 border-white/10 text-white/50 hover:text-white hover:bg-white/8'}`}>
                {p === 'All' ? 'All Priority' : p}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="relative">
              <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
                className="h-7 pl-3 pr-7 rounded-lg text-xs font-body bg-white/4 border border-white/10 hover:border-white/20 focus:outline-none text-white/60 appearance-none cursor-pointer transition-all [&>option]:bg-surface-850">
                <option value="All">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject}</option>)}
              </select>
              <ChevronDown />
            </div>
            {hasActiveFilters && (
              <button onClick={() => { setFilterSub('All'); setFilterPri('All'); setDateFilter('all'); setSearchQuery(''); }}
                className="ml-auto px-3 h-7 rounded-lg text-xs font-medium font-body bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all">
                ✕ Clear
              </button>
            )}
          </div>
          <p className="text-xs text-white/30 font-body">
            Showing <span className="text-white/60 font-medium">{filtered.length}</span> of {tasks.length} tasks
          </p>
        </div>

        {/* Content */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-3xl mb-4">✅</div>
            <h3 className="text-base font-semibold text-white/60 font-display mb-1">No tasks yet</h3>
            <p className="text-sm text-white/35 font-body max-w-xs mb-5">Add your first task to start tracking your study progress.</p>
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>+ Add your first task</Button>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUSES.map(status => (
              <Column key={status} status={status} tasks={byStatus(status)} subjects={subjects}
                onDone={(id) => setStatus(id, 'done')} onMissed={(id) => setStatus(id, 'missed')}
                onPending={(id) => setStatus(id, 'pending')} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.length === 0
              ? <div className="text-center py-12 text-white/30 font-body text-sm">No tasks match your filters.</div>
              : filtered
                  .sort((a, b) => ({ pending: 0, missed: 1, done: 2 }[a.status] ?? 3) - ({ pending: 0, missed: 1, done: 2 }[b.status] ?? 3))
                  .map(task => (
                    <TaskCard key={task.id} task={task}
                      subjectName={subjects.find(s => s.id === task.subjectId)?.subject ?? ''}
                      onDone={(id) => setStatus(id, 'done')} onMissed={(id) => setStatus(id, 'missed')}
                      onPending={(id) => setStatus(id, 'pending')} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />
                  ))
            }
          </div>
        )}
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Task" message="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete Task" danger />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppLayout>
  );
}