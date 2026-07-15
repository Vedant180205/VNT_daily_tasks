import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayersPage } from './pages/PlayersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TeamsPage } from './pages/TeamsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/players" 
        element={
          <ProtectedRoute>
            <PlayersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teams" 
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/players" replace />} />
      <Route path="*" element={<Navigate to="/players" replace />} />
    </Routes>
  );
}

export default App;
