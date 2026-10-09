import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { SearchPapers } from './pages/SearchPapers';
import { WorkspaceDetail } from './pages/WorkspaceDetail';
import { AITools } from './pages/AITools';
import { UploadPDF } from './pages/UploadPDF';
import { DocSpace } from './pages/DocSpace';

// Protected Layout Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedLayout>
              <SearchPapers />
            </ProtectedLayout>
          }
        />
        <Route
          path="/workspace/:id"
          element={
            <ProtectedLayout>
              <WorkspaceDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ai-tools"
          element={
            <ProtectedLayout>
              <AITools />
            </ProtectedLayout>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedLayout>
              <UploadPDF />
            </ProtectedLayout>
          }
        />
        <Route
          path="/docspace"
          element={
            <ProtectedLayout>
              <DocSpace />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
