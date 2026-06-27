import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subjects from './pages/Subjects';
import Videos from './pages/Videos';

function App() {
  return (
    <Router>
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/videos" element={<Videos />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
