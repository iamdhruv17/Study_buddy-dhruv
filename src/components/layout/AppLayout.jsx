import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen dark">
      <Sidebar />
      <Navbar pageTitle={pageTitle} />
      <main
        className="min-h-screen bg-surface-900 text-white"
        style={{ paddingLeft: 'var(--sidebar-w)', paddingTop: 'var(--navbar-h)' }}
      >
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;