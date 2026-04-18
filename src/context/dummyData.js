export const dummySubjects = [
  {
    id: 'sub-1',
    subject: 'Mathematics',
    topic: 'Differential Equations',
    priority: 'High',
    difficulty: 'Hard',
    score: 6,
    dailyLimit: 3,
    createdAt: '2025-01-08',
  },
  {
    id: 'sub-2',
    subject: 'Physics',
    topic: 'Quantum Mechanics',
    priority: 'High',
    difficulty: 'Hard',
    score: 6,
    dailyLimit: 2,
    createdAt: '2025-01-08',
  },
  {
    id: 'sub-3',
    subject: 'Computer Science',
    topic: 'Dynamic Programming',
    priority: 'Medium',
    difficulty: 'Medium',
    score: 4,
    dailyLimit: 2,
    createdAt: '2025-01-09',
  },
  {
    id: 'sub-4',
    subject: 'Chemistry',
    topic: 'Organic Reactions',
    priority: 'Medium',
    difficulty: 'Easy',
    score: 3,
    dailyLimit: 1,
    createdAt: '2025-01-09',
  },
  {
    id: 'sub-5',
    subject: 'English',
    topic: 'Essay Writing',
    priority: 'Low',
    difficulty: 'Easy',
    score: 2,
    dailyLimit: 1,
    createdAt: '2025-01-10',
  },
];

const today     = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const dummyTasks = [
  { id: 'task-1', title: 'Solve 10 differential equation problems', subjectId: 'sub-1', status: 'done',    date: today,     priority: 'High'   },
  { id: 'task-2', title: 'Read Quantum Mechanics Chapter 5',        subjectId: 'sub-2', status: 'pending', date: today,     priority: 'High'   },
  { id: 'task-3', title: 'Implement LCS dynamic programming',       subjectId: 'sub-3', status: 'pending', date: today,     priority: 'Medium' },
  { id: 'task-4', title: 'Review nucleophilic substitution',        subjectId: 'sub-4', status: 'missed',  date: yesterday, priority: 'Medium' },
  { id: 'task-5', title: 'Write outline for argumentative essay',   subjectId: 'sub-5', status: 'done',    date: yesterday, priority: 'Low'    },
  { id: 'task-6', title: 'Practice eigenvalue problems',            subjectId: 'sub-1', status: 'missed',  date: yesterday, priority: 'High'   },
  { id: 'task-7', title: 'Study wave functions and Schrödinger eq', subjectId: 'sub-2', status: 'done',    date: yesterday, priority: 'High'   },
];

export const dummyUser = {
  name:  'Arjun Sharma',
  email: 'arjun.sharma@college.edu',
};