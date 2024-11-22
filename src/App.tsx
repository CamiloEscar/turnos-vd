import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ClientView from './views/ClientView';
import CounterView from './views/CounterView';
import DisplayView from './views/DisplayView';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ClientView />} />
          <Route path="/counter" element={<CounterView />} />
          <Route path="/display" element={<DisplayView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;