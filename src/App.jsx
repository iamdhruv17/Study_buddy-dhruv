import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Login     from './pages/Login';
import Signup    from './pages/Signup';
import Planner   from './pages/Planner';
import Tasks     from './pages/Tasks';
import Analytics from './pages/Analytics';

const Protected = ({ children }) => {
  const { state } = useContext(AppContext);
  if (!state.auth.isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"     element={<Login />} />
    <Route path="/signup"    element={<Signup />} />
    <Route path="/planner"   element={<Protected><Planner /></Protected>} />
    <Route path="/tasks"     element={<Protected><Tasks /></Protected>} />
    <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
    <Route path="*"          element={<Navigate to="/planner" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}