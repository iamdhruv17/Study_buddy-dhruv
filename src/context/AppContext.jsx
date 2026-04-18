import { createContext, useReducer, useEffect, useCallback, useState } from 'react';
import { dummySubjects, dummyTasks, dummyUser } from './dummyData';

export const AppContext = createContext(null);

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('ssb_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Force dark mode always, ignore saved theme
      return { ...parsed, theme: 'dark' };
    }
  } catch {}
  return {
    auth:     { isLoggedIn: false, user: null },
    theme:    'dark',
    subjects: dummySubjects,
    tasks:    dummyTasks,
    settings: {
      totalDailyHours: 6,
      weeklyHours: {
        Mon: 6, Tue: 6, Wed: 6, Thu: 6, Fri: 6, Sat: 4, Sun: 4,
      },
    },
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, auth: { isLoggedIn: true, user: action.payload ?? dummyUser } };
    case 'LOGOUT':
      return { ...state, auth: { isLoggedIn: false, user: null } };
    case 'SIGNUP':
      return { ...state, auth: { isLoggedIn: true, user: action.payload } };

    // THEME TOGGLE REMOVED — always dark

    case 'ADD_SUBJECT':
      return { ...state, subjects: [action.payload, ...state.subjects] };
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(s => s.id !== action.payload),
        tasks:    state.tasks.filter(t => t.subjectId !== action.payload),
      };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        ),
      };
    case 'SET_ALL_TASKS':
      return { ...state, tasks: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_WEEKLY_HOURS':
      return {
        ...state,
        settings: {
          ...state.settings,
          weeklyHours: {
            ...state.settings.weeklyHours,
            ...action.payload,
          },
        },
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    try { localStorage.setItem('ssb_state', JSON.stringify(state)); } catch {}
  }, [state]);

  // Always force dark mode on html element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast    = useCallback(({ type = 'info', message }) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
};

export const PRIORITY_MAP   = { Low: 1, Medium: 2, High: 3 };
export const DIFFICULTY_MAP = { Easy: 1, Medium: 2, Hard: 3 };
export const calculateScore = (priority, difficulty) =>
  (PRIORITY_MAP[priority] ?? 1) + (DIFFICULTY_MAP[difficulty] ?? 1);
export const genId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;