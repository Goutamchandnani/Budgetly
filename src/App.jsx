import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';

function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-budgetly-base">
            <div className="w-8 h-8 rounded-full border-4 border-budgetly-mid border-t-budgetly-accent animate-spin" />
        </div>
    );

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
    const { currentUser, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-budgetly-base">
            <div className="w-8 h-8 rounded-full border-4 border-budgetly-mid border-t-budgetly-accent animate-spin" />
        </div>
    );

    if (currentUser) {
        return <Navigate to="/" />;
    }

    return children;
}

import InstallPrompt from './components/InstallPrompt';

export default function App() {
    const { currentUser } = useAuth();
    return (
        <>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <InstallPrompt />
            <Routes>
                <Route path="/" element={
                    currentUser ? <Navigate to="/dashboard" /> : <Landing />
                } />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes >
        </>
    );
}
