import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store/authStore';
import VodafoneLoginPage from './features/auth/VodafoneLoginPage';
import RegisterPage from './features/auth/RegisterPage';
import { VodafoneLandingPage } from './features/landing';
import EnhancedDashboard from './features/dashboard/EnhancedDashboard';
import EnhancedNewProjectPage from './features/projects/EnhancedNewProjectPage';
import DesignerPageFinal from './features/designer/DesignerPageFinal';
import AssistantPage from './features/assistant/AssistantPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import DocumentationPage from './features/docs/DocumentationPage';
import VodafoneLayout from './components/VodafoneLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : <VodafoneLandingPage />}
          />
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" /> : <VodafoneLoginPage />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
          />

          {/* Protected routes */}
          {token ? (
            <>
              <Route path="/" element={<VodafoneLayout />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<EnhancedDashboard />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="projects/new" element={<EnhancedNewProjectPage />} />
                <Route path="projects/:projectId" element={<DesignerPageFinal />} />
                <Route path="assistant" element={<AssistantPage />} />
              </Route>
              {/* Documentation page without layout */}
              <Route path="docs" element={<DocumentationPage />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
