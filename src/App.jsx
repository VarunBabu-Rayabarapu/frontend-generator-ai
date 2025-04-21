import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './admin/Admin';
import ShowPage from './components/ShowPage';
import AiAdminPage from './admin/AiAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/:url" element={<ShowPage />} />
      </Routes>
    </Router>
  );
}

export default App;
