import { Routes, Route } from 'react-router-dom';
import RubiksCube from './components/RubiksCube';
import Preview from './components/Preview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RubiksCube />} />
      <Route path="/preview" element={<Preview />} />
    </Routes>
  );
}

export default App;
