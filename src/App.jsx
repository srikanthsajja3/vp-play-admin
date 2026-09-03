import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subjects from './pages/Subjects';
import Videos from './pages/Videos';
import Classes from './pages/Classes';
import FileSystem from './pages/FileSystem';

function App() {
  const basename = window.location.pathname.startsWith('/admin') ? '/admin' : '/';

  return (
    <Router basename={basename}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#f8fafc',
            },
          },
        }} 
      />
      <Routes>
        {/* Public Login Route (Isolated from shell) */}
        <Route path="/login" element={<Login />} />

        {/* Protected System Routes */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/filesystem" element={<FileSystem />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/subjects" element={<Subjects />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
