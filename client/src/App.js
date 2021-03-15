import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <Router>
      <Route path='/' component={HomePage} exact />
    </Router>
  );
}

export default App;
