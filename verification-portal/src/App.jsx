import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VerifyPage from './pages/VerifyPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify/:id" element={<VerifyPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        {/* Redirect root to a demo ID for visualization */}
        <Route path="/" element={<Navigate to="/verify/demo-ipfs-hash-123" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
