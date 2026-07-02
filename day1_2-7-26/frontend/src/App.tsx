import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InternalStatusPage from './pages/InternalStatus/InternalStatusPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/internal/status" element={<InternalStatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
