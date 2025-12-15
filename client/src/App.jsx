import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Templates from './pages/Templates';
import ProfilePage from './pages/ProfilePage'; // Added ProfilePage

import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/templates" element={<Templates />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Added Profile Route */}
        <Route path="/map/:mapId" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
