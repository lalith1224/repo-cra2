import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PrintJob from './pages/PrintJob';
import ThankYou from './pages/ThankYou';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';
import Faculty from './pages/Facultylogin';
import ThankYou2 from './pages/ThankYou2'
import PrintJob2 from './pages/Printjob2';

// Import contexts
import { useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  );
}

function AppContent() {
  const { admin } = useAdminAuth();

  return (
    <div className="App">
      <Helmet>
        <title>Print Repository System</title>
        <meta name="description" content="Efficient printing management for educational institutions" />
      </Helmet>
      
      <Navbar />
      
      <main className="container-fluid p-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/print-job" element={<PrintJob />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route 
            path="/admin-login" 
            element={<AdminLogin />}
          />
          <Route 
            path="/admin" 
            element={
              admin ? <Admin /> : <AdminLogin />
            } 
          />
          <Route path="/faculty-login" element={<Faculty />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/thank-you2" element={<ThankYou2 />} />
          
          <Route path="/printjob2" element={<PrintJob2 />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 