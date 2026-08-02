import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TransactionModal } from './components/TransactionModal';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Accounts } from './pages/Accounts';
import { ImportData } from './pages/ImportData';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './styles/theme.css';

const ProtectedLayout = () => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="main-content">
        <Navbar 
          onOpenAddTransaction={() => setIsModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard onOpenAddTransaction={() => setIsModalOpen(true)} />} />
            <Route path="/transactions" element={<Transactions onOpenAddTransaction={() => setIsModalOpen(true)} />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </TransactionProvider>
    </AuthProvider>
  );
}
