import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './admin/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
