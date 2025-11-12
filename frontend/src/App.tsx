import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from './lib/store/authStore';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import NewProjectPage from './features/projects/NewProjectPage';
import DesignerPageFinal from './features/designer/DesignerPageFinal';
import DesignerPageEnhanced from './features/designer/DesignerPageEnhanced';
import WorkflowListPage from './features/workflows/WorkflowListPage';
import WorkflowBuilder from './features/workflows/WorkflowBuilder';
import Layout from './components/Layout';

// Redirect component for CI/CD to Workflows
function CICDRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/projects/${id}/workflows`} replace />;
}

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />

        {/* Protected routes */}
        {token ? (
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:projectId" element={<DesignerPageFinal />} />
            <Route path="/projects/:projectId/enhanced" element={<DesignerPageEnhanced />} />
            <Route path="/projects/:id/cicd" element={<CICDRedirect />} />
            <Route path="/projects/:projectId/workflows" element={<WorkflowListPage />} />
            <Route path="/projects/:projectId/workflows/new" element={<WorkflowBuilder projectId={0} />} />
            <Route path="/projects/:projectId/workflows/:workflowId/edit" element={<WorkflowBuilder projectId={0} workflowId={0} />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
