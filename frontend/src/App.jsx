import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UrlHistoryPage from './pages/UrlHistoryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/urls/:id" element={<UrlHistoryPage />} />
    </Routes>
  );
}

export default App;
