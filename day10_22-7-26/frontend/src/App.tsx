import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayersPage } from './pages/PlayersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SignupOrganizerPage } from './pages/SignupOrganizerPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { TeamsPage } from './pages/TeamsPage';
import { CompleteRegistrationPage } from './pages/CompleteRegistrationPage';

import { UploadPlayersPage } from './pages/UploadPlayersPage';
import { OrganizersPage } from './pages/OrganizersPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { EmailTemplatesPage } from './pages/EmailTemplatesPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup-organizer" element={<SignupOrganizerPage />} />
      <Route path="/organizer/register" element={<CompleteRegistrationPage />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
      <Route path="/organizers" element={<ProtectedRoute><OrganizersPage /></ProtectedRoute>} />
      <Route path="/enrollments" element={<ProtectedRoute><EnrollmentsPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadPlayersPage /></ProtectedRoute>} />
      <Route path="/email-templates" element={<ProtectedRoute><EmailTemplatesPage /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><PlaceholderPage title="Activity Log" /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Settings" /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/players" replace />} />
      <Route path="*" element={<Navigate to="/players" replace />} />
    </Routes>
  );
}

export default App;
